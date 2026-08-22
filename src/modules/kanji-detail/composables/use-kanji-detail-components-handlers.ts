/**
 * Use Kanji Detail Components Handlers
 *
 * Handles link/unlink/create/update operations for component occurrences.
 *
 * @module modules/kanji-detail
 */

import { computed } from 'vue'

import {
  useComponentFormRepository,
  useComponentOccurrenceRepository,
  useComponentRepository
} from '@/api/component'
import { usePositionTypeRepository } from '@/api/position'

import { useToast } from '@/shared/composables/use-toast'

import type {
  ComponentLinkPayload,
  ComponentOccurrenceWithDetails,
  ComponentUpdatePayload,
  DialogComponentChanges
} from '../kanji-detail-types'
import type { Component } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji/kanji-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'
import type { ComputedRef, Ref } from 'vue'

// ============================================================================
// Types
// ============================================================================

interface State {
  kanji: Ref<Kanji | null>
  componentOccurrences: Ref<ComponentOccurrenceWithDetails[]>
}

interface ComponentsContext {
  state: State
  toast: ReturnType<typeof useToast>
  componentRepo: ReturnType<typeof useComponentRepository>
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>
  positionRepo: ReturnType<typeof usePositionTypeRepository>
  formRepo: ReturnType<typeof useComponentFormRepository>
}

interface UseKanjiDetailComponentsHandlersReturn {
  allComponents: ComputedRef<Component[]>
  linkedOccurrences: ComputedRef<ComponentOccurrenceWithDetails[]>
  handleSave: (changes: DialogComponentChanges) => void
  handleCreate: (data: QuickCreateComponentData) => void
  refreshOccurrences: () => void
}

// ============================================================================
// Module-scope implementation functions
// ============================================================================

function doRefreshOccurrences(ctx: ComponentsContext): void {
  const kanjiVal = ctx.state.kanji.value
  if (!kanjiVal) return

  const occurrences = ctx.occurrenceRepo.getByParentId(kanjiVal.id)
  ctx.state.componentOccurrences.value = occurrences.map((occ) => {
    const component = ctx.componentRepo.getById(occ.componentId)
    const position = occ.positionTypeId
      ? ctx.positionRepo.getById(occ.positionTypeId)
      : null
    const form = occ.componentFormId
      ? ctx.formRepo.getById(occ.componentFormId)
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

function doHandleSave(
  changes: DialogComponentChanges,
  ctx: ComponentsContext
): void {
  const kanjiVal = ctx.state.kanji.value
  if (!kanjiVal) {
    ctx.toast.error('No kanji selected')
    return
  }
  try {
    changes.toLink.forEach((link: ComponentLinkPayload) => {
      ctx.occurrenceRepo.create({
        kanjiId: kanjiVal.id,
        componentId: link.componentId,
        positionTypeId: link.positionTypeId,
        componentFormId: link.componentFormId,
        isRadical: link.isRadical,
        analysisNotes: null
      })
    })
    changes.toUpdate.forEach((update: ComponentUpdatePayload) => {
      ctx.occurrenceRepo.update(update.id, {
        positionTypeId: update.positionTypeId,
        componentFormId: update.componentFormId,
        isRadical: update.isRadical
      })
    })
    changes.toDelete.forEach((id) => {
      ctx.occurrenceRepo.remove(id)
    })
    doRefreshOccurrences(ctx)
    ctx.toast.success('Component changes saved successfully')
  } catch {
    ctx.toast.error('Failed to save component changes')
  }
}

function doHandleCreate(
  data: QuickCreateComponentData,
  ctx: ComponentsContext
): void {
  try {
    ctx.componentRepo.create({
      character: data.character,
      shortMeaning:
        data.shortMeaning && data.shortMeaning.trim() !== ''
          ? data.shortMeaning
          : null
    })
    ctx.toast.success(`Created component "${data.character}"`)
  } catch {
    ctx.toast.error('Failed to create component')
  }
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Provides handlers for managing component occurrences on a kanji.
 *
 * @param state - Reactive kanji detail state (kanji + componentOccurrences refs)
 * @returns Handlers and computed values for component occurrence management
 */
export function useKanjiDetailComponentsHandlers(
  state: State
): UseKanjiDetailComponentsHandlersReturn {
  const ctx: ComponentsContext = {
    state,
    toast: useToast(),
    componentRepo: useComponentRepository(),
    occurrenceRepo: useComponentOccurrenceRepository(),
    positionRepo: usePositionTypeRepository(),
    formRepo: useComponentFormRepository()
  }

  const allComponents = computed<Component[]>(() => ctx.componentRepo.getAll())

  const linkedOccurrences = computed<ComponentOccurrenceWithDetails[]>(
    () => state.componentOccurrences.value
  )

  return {
    allComponents,
    linkedOccurrences,
    handleSave: (changes) => {
      doHandleSave(changes, ctx)
    },
    handleCreate: (data) => {
      doHandleCreate(data, ctx)
    },
    refreshOccurrences: () => {
      doRefreshOccurrences(ctx)
    }
  }
}
