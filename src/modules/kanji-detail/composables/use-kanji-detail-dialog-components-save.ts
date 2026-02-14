/**
 * Use Kanji Detail Dialog Components Save
 *
 * Manages save logic for component dialog - calculating differences and emitting save event.
 *
 * @module modules/kanji-detail
 */

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { EditOccurrence } from '../utils/edit-occurrence-types'
import type { Ref } from 'vue'

export function useKanjiDetailDialogComponentsSave(
  editOccurrences: Ref<EditOccurrence[]>,
  originalOccurrences: Ref<ComponentOccurrenceWithDetails[]>
) {
  /**
   * Calculate changes and return save data
   */
  function calculateSaveData() {
    const original = originalOccurrences.value
    const edited = editOccurrences.value.filter((occ) => !occ.markedForDeletion)

    // Newly linked components
    const toLink = edited
      .filter((occ) => occ.id === null)
      .map((occ) => ({
        componentId: occ.componentId,
        positionTypeId: occ.positionTypeId,
        componentFormId: occ.componentFormId,
        isRadical: occ.isRadical
      }))

    // Updated occurrences
    const toUpdate = edited
      .filter((occ): occ is EditOccurrence & { id: number } => occ.id !== null)
      .filter((occ) => {
        const orig = original.find((o) => o.id === occ.id)
        if (!orig) return false
        return (
          orig.positionTypeId !== occ.positionTypeId ||
          orig.componentFormId !== occ.componentFormId ||
          orig.isRadical !== occ.isRadical
        )
      })
      .map((occ) => ({
        id: occ.id,
        positionTypeId: occ.positionTypeId,
        componentFormId: occ.componentFormId,
        isRadical: occ.isRadical
      }))

    // Deleted occurrences
    const toDelete = editOccurrences.value
      .filter(
        (occ): occ is EditOccurrence & { id: number } =>
          occ.markedForDeletion === true && occ.id !== null
      )
      .map((occ) => occ.id)

    return { toLink, toUpdate, toDelete }
  }

  return {
    calculateSaveData
  }
}
