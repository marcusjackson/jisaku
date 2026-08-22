/** use-component-detail-data - Composable for loading and managing component detail data. */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import {
  useComponentFormRepository,
  useComponentGroupingRepository,
  useComponentOccurrenceRepository,
  useComponentRepository
} from '@/api/component'
import { useKanjiRepository } from '@/api/kanji'
import { usePositionTypeRepository } from '@/api/position'

import type {
  Component,
  ComponentForm,
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { PositionType } from '@/api/position'
import type { ComputedRef, Ref } from 'vue'

interface ComponentDetailDataReturn {
  component: Ref<Component | null>
  forms: Ref<ComponentForm[]>
  groupings: Ref<ComponentGroupingWithMembers[]>
  allGroupingMembers: Ref<Map<number, ComponentGroupingMember[]>>
  occurrences: Ref<OccurrenceWithKanji[]>
  positionTypes: Ref<PositionType[]>
  kanjiOptions: Ref<Kanji[]>
  sourceKanji: Ref<Kanji | null>
  isLoading: Ref<boolean>
  loadError: Ref<string | null>
  componentId: ComputedRef<number>
}

type ComponentDetailState = Omit<ComponentDetailDataReturn, 'componentId'>
interface ComponentDetailRepos {
  componentRepo: ReturnType<typeof useComponentRepository>
  formRepo: ReturnType<typeof useComponentFormRepository>
  groupingRepo: ReturnType<typeof useComponentGroupingRepository>
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
  kanjiRepo: ReturnType<typeof useKanjiRepository>
  positionTypeRepo: ReturnType<typeof usePositionTypeRepository>
}

function createComponentDetailState(): ComponentDetailState {
  return {
    component: ref<Component | null>(null),
    forms: ref<ComponentForm[]>([]),
    groupings: ref<ComponentGroupingWithMembers[]>([]),
    allGroupingMembers: ref(new Map<number, ComponentGroupingMember[]>()),
    occurrences: ref<OccurrenceWithKanji[]>([]),
    positionTypes: ref<PositionType[]>([]),
    kanjiOptions: ref<Kanji[]>([]),
    sourceKanji: ref<Kanji | null>(null),
    isLoading: ref(true),
    loadError: ref<string | null>(null)
  }
}

function createComponentDetailRepos(): ComponentDetailRepos {
  return {
    componentRepo: useComponentRepository(),
    formRepo: useComponentFormRepository(),
    groupingRepo: useComponentGroupingRepository(),
    occurrenceRepo: useComponentOccurrenceRepository(),
    kanjiRepo: useKanjiRepository(),
    positionTypeRepo: usePositionTypeRepository()
  }
}

function loadComponentData(
  componentId: number,
  state: ComponentDetailState,
  repos: ComponentDetailRepos
): void {
  state.isLoading.value = true
  state.loadError.value = null
  try {
    state.component.value = repos.componentRepo.getById(componentId)
    if (!state.component.value) {
      state.loadError.value = `Component with ID ${String(componentId)} not found`
      return
    }
    state.kanjiOptions.value = repos.kanjiRepo.getAll()
    state.sourceKanji.value = state.component.value.sourceKanjiId
      ? (repos.kanjiRepo.getById(state.component.value.sourceKanjiId) ?? null)
      : null
    state.forms.value = repos.formRepo.getByParentId(componentId)
    state.occurrences.value =
      repos.occurrenceRepo.getByComponentIdWithKanji(componentId)
    state.positionTypes.value = repos.positionTypeRepo.getAll()
    state.groupings.value = repos.groupingRepo.getByParentId(componentId)
    state.allGroupingMembers.value =
      repos.groupingRepo.getMembersByComponentId(componentId)
  } catch (err) {
    state.loadError.value =
      err instanceof Error ? err.message : 'Failed to load component'
  } finally {
    state.isLoading.value = false
  }
}

/**
 * Loads and manages all reactive state for the component detail page.
 *
 * @returns Reactive state for the component detail page (does not include repositories)
 */
export function useComponentDetailData(): ComponentDetailDataReturn {
  const route = useRoute()
  const repos = createComponentDetailRepos()
  const state = createComponentDetailState()
  const componentId = computed(() => Number(route.params['id']))

  watch(
    componentId,
    () => {
      loadComponentData(componentId.value, state, repos)
    },
    { immediate: true }
  )

  return { ...state, componentId }
}
