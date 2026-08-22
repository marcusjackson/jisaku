/**
 * Use Component Detail Root Handlers
 *
 * Extracts inline handlers from ComponentDetailRoot for headline,
 * basic info, description save, and component deletion.
 */

import { useComponentRepository } from '@/api/component'
import { useKanjiRepository } from '@/api/kanji'

import { useToast } from '@/shared/composables'

import { ROUTES } from '@/router/routes'

import type {
  BasicInfoSaveData,
  HeadlineSaveData
} from '../component-detail-types'
import type { Component } from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { Ref } from 'vue'
import type { Router } from 'vue-router'

/** Dependencies for the composable */
interface UseComponentDetailRootHandlersDeps {
  component: Ref<Component | null>
  sourceKanji: Ref<Kanji | null>
  isDeleting: Ref<boolean>
  router: Router
}

/** Return type of the composable */
interface UseComponentDetailRootHandlersReturn {
  handleHeadlineSave: (data: HeadlineSaveData) => void
  handleBasicInfoSave: (data: BasicInfoSaveData) => void
  handleDescriptionSave: (value: string | null) => void
  handleDelete: () => void
}

/**
 * Provides top-level handlers for the component detail root component.
 * Handles headline/basic-info/description saves and component deletion.
 *
 * @param deps - Component ref, source kanji ref, isDeleting flag, and router
 * @returns Handlers for save and delete operations
 */
export function useComponentDetailRootHandlers(
  deps: UseComponentDetailRootHandlersDeps
): UseComponentDetailRootHandlersReturn {
  const { component, isDeleting, router, sourceKanji } = deps
  const componentRepo = useComponentRepository()
  const kanjiRepo = useKanjiRepository()
  const toast = useToast()

  return {
    handleHeadlineSave: createHeadlineSave(component, componentRepo, toast),
    handleBasicInfoSave: createBasicInfoSave(
      component,
      sourceKanji,
      componentRepo,
      kanjiRepo,
      toast
    ),
    handleDescriptionSave: createDescriptionSave(
      component,
      componentRepo,
      toast
    ),
    handleDelete: createDelete(
      component,
      isDeleting,
      componentRepo,
      router,
      toast
    )
  }
}

// ============================================================================
// Handler Factories
// ============================================================================

type CompRepo = ReturnType<typeof useComponentRepository>
type KanjiRepo = ReturnType<typeof useKanjiRepository>
type Toast = ReturnType<typeof useToast>

function createHeadlineSave(
  component: Ref<Component | null>,
  repo: CompRepo,
  toast: Toast
) {
  return (data: HeadlineSaveData): void => {
    if (!component.value) return
    try {
      repo.update(component.value.id, data)
      component.value = { ...component.value, ...data }
      toast.success('Component updated successfully')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update component'
      )
    }
  }
}

function createBasicInfoSave(
  component: Ref<Component | null>,
  sourceKanji: Ref<Kanji | null>,
  compRepo: CompRepo,
  kanjiRepo: KanjiRepo,
  toast: Toast
) {
  return (data: BasicInfoSaveData): void => {
    if (!component.value) return
    try {
      const previousSourceKanjiId = component.value.sourceKanjiId
      compRepo.update(component.value.id, data)
      component.value = { ...component.value, ...data }
      if (data.sourceKanjiId !== previousSourceKanjiId) {
        sourceKanji.value = data.sourceKanjiId
          ? (kanjiRepo.getById(data.sourceKanjiId) ?? null)
          : null
      }
      toast.success('Component updated successfully')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to update component'
      )
    }
  }
}

function createDescriptionSave(
  component: Ref<Component | null>,
  repo: CompRepo,
  toast: Toast
) {
  return (value: string | null): void => {
    if (!component.value) return
    try {
      repo.updateField(component.value.id, 'description', value)
      component.value = { ...component.value, description: value }
      toast.success('Description saved')
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to save description'
      )
    }
  }
}

function createDelete(
  component: Ref<Component | null>,
  isDeleting: Ref<boolean>,
  repo: CompRepo,
  router: Router,
  toast: Toast
) {
  return (): void => {
    if (!component.value) return
    isDeleting.value = true
    try {
      repo.remove(component.value.id)
      toast.success('Component deleted successfully')
      void router.push(ROUTES.COMPONENT_LIST)
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to delete component'
      )
    } finally {
      isDeleting.value = false
    }
  }
}
