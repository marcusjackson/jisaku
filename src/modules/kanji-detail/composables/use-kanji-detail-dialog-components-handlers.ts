/**
 * Use Kanji Detail Dialog Components Handlers
 *
 * Handlers for dialog interactions - component selection, field updates, unlinking.
 *
 * @module modules/kanji-detail
 */

import type { EditOccurrence } from '../utils/edit-occurrence-types'
import type { Component } from '@/api/component/component-types'
import type { Ref } from 'vue'

/* eslint-disable max-lines-per-function */
export function useKanjiDetailDialogComponentsHandlers(
  editOccurrences: Ref<EditOccurrence[]>,
  allComponents: Component[],
  pendingRemoveOccurrenceId: Ref<number | null>,
  showConfirmDialog: Ref<boolean>
) {
  /** Handle component selection from search */
  function handleComponentSelect(componentId: number): void {
    const component = allComponents.find((c) => c.id === componentId)
    if (!component) return

    editOccurrences.value.push({
      id: null, // null indicates new occurrence
      componentId,
      positionTypeId: null,
      componentFormId: null,
      isRadical: false,
      component: {
        id: component.id,
        character: component.character,
        shortMeaning: component.shortMeaning
      },
      position: null,
      form: null
    })
  }

  /** Handle field update for an occurrence */
  function handleOccurrenceUpdate(
    occurrenceId: number | null,
    componentId: number,
    field: string,
    value: unknown
  ): void {
    const index = editOccurrences.value.findIndex(
      (occ) =>
        (occurrenceId !== null && occ.id === occurrenceId) ||
        (occurrenceId === null &&
          occ.componentId === componentId &&
          occ.id === null)
    )
    if (index === -1) return

    const occurrence = editOccurrences.value[index]
    if (!occurrence) return

    if (field === 'positionTypeId') {
      occurrence.positionTypeId = value as number | null
    } else if (field === 'componentFormId') {
      occurrence.componentFormId = value as number | null
    } else if (field === 'isRadical') {
      occurrence.isRadical = value as boolean
    }
  }

  /** Handle unlink request - mark for deletion */
  function handleUnlinkRequest(
    occurrenceId: number | null,
    componentId: number
  ): void {
    // For new occurrences (id=null), just remove from array
    if (occurrenceId === null) {
      editOccurrences.value = editOccurrences.value.filter(
        (occ) => !(occ.id === null && occ.componentId === componentId)
      )
      return
    }

    // For existing occurrences, show confirmation
    pendingRemoveOccurrenceId.value = occurrenceId
    showConfirmDialog.value = true
  }

  /** Handle unlink confirmation */
  function handleUnlinkConfirm(): void {
    if (pendingRemoveOccurrenceId.value === null) return

    const occurrenceId = pendingRemoveOccurrenceId.value
    editOccurrences.value = editOccurrences.value.map((occ) =>
      occ.id === occurrenceId ? { ...occ, markedForDeletion: true } : occ
    )

    showConfirmDialog.value = false
    pendingRemoveOccurrenceId.value = null
  }

  /** Get visible occurrences (not marked for deletion) */
  function getVisibleOccurrences(): EditOccurrence[] {
    return editOccurrences.value.filter((occ) => !occ.markedForDeletion)
  }

  return {
    handleComponentSelect,
    handleOccurrenceUpdate,
    handleUnlinkRequest,
    handleUnlinkConfirm,
    getVisibleOccurrences
  }
}
