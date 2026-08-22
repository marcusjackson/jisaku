/** use-kanji-detail-data - Composable for loading and managing kanji detail data. */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useKanjiRepos } from './use-kanji-repos'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { KanjiRepos } from './use-kanji-repos'
import type {
  ClassificationType,
  KanjiClassification
} from '@/api/classification'
import type { Component as RadicalComponent } from '@/api/component'
import type {
  Kanji,
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup,
  KunReading,
  OnReading
} from '@/api/kanji'
import type { VocabKanjiWithVocabulary } from '@/api/vocabulary'
import type { ComputedRef, Ref } from 'vue'

function createState() {
  return {
    kanji: ref<Kanji | null>(null),
    radical: ref<RadicalComponent | null>(null),
    allComponents: ref<RadicalComponent[]>([]),
    classifications: ref<KanjiClassification[]>([]),
    classificationTypes: ref<ClassificationType[]>([]),
    onReadings: ref<OnReading[]>([]),
    kunReadings: ref<KunReading[]>([]),
    meanings: ref<KanjiMeaning[]>([]),
    readingGroups: ref<KanjiMeaningReadingGroup[]>([]),
    groupMembers: ref<KanjiMeaningGroupMember[]>([]),
    vocabulary: ref<VocabKanjiWithVocabulary[]>([]),
    componentOccurrences: ref<ComponentOccurrenceWithDetails[]>([]),
    isLoading: ref(true),
    loadError: ref<string | null>(null)
  }
}

type Repos = KanjiRepos

// Helper to populate component occurrence details
function populateOccurrenceDetails(
  occurrences: ReturnType<
    KanjiRepos['componentOccurrenceRepo']['getByParentId']
  >,
  repos: Pick<Repos, 'componentRepo' | 'positionTypeRepo' | 'componentFormRepo'>
): ComponentOccurrenceWithDetails[] {
  return occurrences.map((occ) => {
    const component = repos.componentRepo.getById(occ.componentId)
    const position = occ.positionTypeId
      ? repos.positionTypeRepo.getById(occ.positionTypeId)
      : null
    const form = occ.componentFormId
      ? repos.componentFormRepo.getById(occ.componentFormId)
      : null

    return {
      ...occ,
      component: {
        id: component?.id ?? occ.componentId,
        character: component?.character ?? '',
        shortMeaning: component?.shortMeaning ?? null
      },
      position,
      form: form
        ? {
            id: form.id,
            formCharacter: form.formCharacter,
            formName: form.formName
          }
        : null
    } satisfies ComponentOccurrenceWithDetails
  })
}

function loadKanjiData(
  kanjiId: number,
  state: ReturnType<typeof createState>,
  repos: Repos
): void {
  state.isLoading.value = true
  state.loadError.value = null
  try {
    state.kanji.value = repos.kanjiRepo.getById(kanjiId)
    if (!state.kanji.value) {
      state.loadError.value = `Kanji with ID ${String(kanjiId)} not found`
      return
    }
    state.radical.value = state.kanji.value.radicalId
      ? repos.componentRepo.getById(state.kanji.value.radicalId)
      : null
    state.allComponents.value = repos.componentRepo.getAll()
    state.classificationTypes.value = repos.classificationTypeRepo.getAll()
    state.classifications.value =
      repos.kanjiClassificationRepo.getByKanjiIdWithType(kanjiId)
    state.onReadings.value = repos.onReadingRepo.getByParentId(kanjiId)
    state.kunReadings.value = repos.kunReadingRepo.getByParentId(kanjiId)
    state.meanings.value = repos.meaningRepo.getByParentId(kanjiId)
    state.readingGroups.value = repos.readingGroupRepo.getByParentId(kanjiId)
    state.groupMembers.value = repos.groupMemberRepo.getByKanjiId(kanjiId)
    state.vocabulary.value =
      repos.vocabKanjiRepo.getByKanjiIdWithVocabulary(kanjiId)

    // Load component occurrences with details
    const occurrences = repos.componentOccurrenceRepo.getByParentId(kanjiId)
    state.componentOccurrences.value = populateOccurrenceDetails(
      occurrences,
      repos
    )
  } catch (err) {
    state.loadError.value =
      err instanceof Error ? err.message : 'Failed to load kanji'
  } finally {
    state.isLoading.value = false
  }
}

interface KanjiDetailDataReturn {
  kanji: Ref<Kanji | null>
  radical: Ref<RadicalComponent | null>
  allComponents: Ref<RadicalComponent[]>
  classifications: Ref<KanjiClassification[]>
  classificationTypes: Ref<ClassificationType[]>
  onReadings: Ref<OnReading[]>
  kunReadings: Ref<KunReading[]>
  meanings: Ref<KanjiMeaning[]>
  readingGroups: Ref<KanjiMeaningReadingGroup[]>
  groupMembers: Ref<KanjiMeaningGroupMember[]>
  vocabulary: Ref<VocabKanjiWithVocabulary[]>
  componentOccurrences: Ref<ComponentOccurrenceWithDetails[]>
  isLoading: Ref<boolean>
  loadError: Ref<string | null>
  kanjiId: ComputedRef<number>
}

/**
 * Loads and manages all reactive state for the kanji detail page.
 *
 * @returns Reactive state for the kanji detail page (does not include repositories)
 */
export function useKanjiDetailData(): KanjiDetailDataReturn {
  const route = useRoute()
  const repos: Repos = useKanjiRepos()
  const state = createState()
  const kanjiId = computed(() => Number(route.params['id']))
  watch(
    kanjiId,
    () => {
      loadKanjiData(kanjiId.value, state, repos)
    },
    { immediate: true }
  )
  return { ...state, kanjiId }
}
