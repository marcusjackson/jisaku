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

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { Component } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji/kanji-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'
import type { Ref } from 'vue'

interface State {
  kanji: Ref<Kanji | null>
  componentOccurrences: Ref<ComponentOccurrenceWithDetails[]>
}

// eslint-disable-next-line max-lines-per-function -- Handler collection composable
export function useKanjiDetailComponentsHandlers(state: State) {
  const toast = useToast()
  const componentRepository = useComponentRepository()
  const occurrenceRepository = useComponentOccurrenceRepository()
  const positionRepository = usePositionTypeRepository()
  const formRepository = useComponentFormRepository()

  /**
   * All available components (for search/link)
   */
  const allComponents = computed<Component[]>(() =>
    componentRepository.getAll()
  )

  /**
   * Linked component occurrences (for display)
   */
  const linkedOccurrences = computed<ComponentOccurrenceWithDetails[]>(
    () => state.componentOccurrences.value
  )

  /**
   * Refresh component occurrences from database with details
   */
  function refreshOccurrences(): void {
    const kanjiVal = state.kanji.value
    if (!kanjiVal) return

    const occurrences = occurrenceRepository.getByParentId(kanjiVal.id)

    // Populate details for each occurrence
    state.componentOccurrences.value = occurrences.map((occ) => {
      const component = componentRepository.getById(occ.componentId)
      const position = occ.positionTypeId
        ? positionRepository.getById(occ.positionTypeId)
        : null
      const form = occ.componentFormId
        ? formRepository.getById(occ.componentFormId)
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

  /**
   * Save all component changes (link new, update existing, delete marked)
   */
  // eslint-disable-next-line max-lines-per-function -- Needs full change handling
  function handleSave(changes: {
    toLink: {
      componentId: number
      positionTypeId: number | null
      componentFormId: number | null
      isRadical: boolean
    }[]
    toUpdate: {
      id: number
      positionTypeId: number | null
      componentFormId: number | null
      isRadical: boolean
    }[]
    toDelete: number[]
  }): void {
    const kanjiVal = state.kanji.value
    if (!kanjiVal) {
      toast.error('No kanji selected')
      return
    }

    try {
      // Link new components
      changes.toLink.forEach((link) => {
        occurrenceRepository.create({
          kanjiId: kanjiVal.id,
          componentId: link.componentId,
          positionTypeId: link.positionTypeId,
          componentFormId: link.componentFormId,
          isRadical: link.isRadical,
          analysisNotes: null
        })
      })

      // Update existing occurrences
      changes.toUpdate.forEach((update) => {
        occurrenceRepository.update(update.id, {
          positionTypeId: update.positionTypeId,
          componentFormId: update.componentFormId,
          isRadical: update.isRadical
        })
      })

      // Delete marked occurrences
      changes.toDelete.forEach((id) => {
        occurrenceRepository.remove(id)
      })

      refreshOccurrences()

      // Show appropriate success message
      const total =
        changes.toLink.length +
        changes.toUpdate.length +
        changes.toDelete.length
      if (total > 0) {
        toast.success('Component changes saved successfully')
      }
    } catch (error) {
      toast.error('Failed to save component changes')
      console.error('Save component changes error:', error)
    }
  }

  /**
   * Create new component and refresh list (user will link it manually)
   */
  function handleCreate(data: QuickCreateComponentData): void {
    try {
      // Create component
      componentRepository.create({
        character: data.character,
        shortMeaning:
          data.shortMeaning && data.shortMeaning.trim() !== ''
            ? data.shortMeaning
            : null
      })

      toast.success(`Created component "${data.character}"`)

      // Component is now available in the search dropdown
      // User can link it manually from the dialog
    } catch (error) {
      toast.error('Failed to create component')
      console.error('Create component error:', error)
    }
  }

  return {
    allComponents,
    linkedOccurrences,
    handleSave,
    handleCreate,
    refreshOccurrences
  }
}
