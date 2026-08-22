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

// ============================================================================
// Return type
// ============================================================================

interface UseKanjiDetailDialogComponentsHandlersReturn {
  handleComponentSelect: (componentId: number) => void
  handleOccurrenceUpdate: (
    occurrenceId: number | null,
    componentId: number,
    field: string,
    value: unknown
  ) => void
  handleUnlinkRequest: (
    occurrenceId: number | null,
    componentId: number
  ) => void
  handleUnlinkConfirm: () => void
  getVisibleOccurrences: () => EditOccurrence[]
}

// ============================================================================
// Module-scope implementation functions
// ============================================================================

function selectComponent(
  componentId: number,
  allComponents: Component[],
  editOccurrences: Ref<EditOccurrence[]>
): void {
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

function updateOccurrenceField(
  occurrenceId: number | null,
  componentId: number,
  field: string,
  value: unknown,
  editOccurrences: Ref<EditOccurrence[]>
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

function requestUnlink(
  occurrenceId: number | null,
  componentId: number,
  editOccurrences: Ref<EditOccurrence[]>,
  pendingRemoveOccurrenceId: Ref<number | null>,
  showConfirmDialog: Ref<boolean>
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

function confirmUnlink(
  pendingRemoveOccurrenceId: Ref<number | null>,
  showConfirmDialog: Ref<boolean>,
  editOccurrences: Ref<EditOccurrence[]>
): void {
  if (pendingRemoveOccurrenceId.value === null) return

  const occurrenceId = pendingRemoveOccurrenceId.value
  editOccurrences.value = editOccurrences.value.map((occ) =>
    occ.id === occurrenceId ? { ...occ, markedForDeletion: true } : occ
  )

  showConfirmDialog.value = false
  pendingRemoveOccurrenceId.value = null
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Provides handlers for the KanjiDetailDialogComponents dialog.
 *
 * @param editOccurrences - Ref to the list of occurrences being edited
 * @param allComponents - All available components for search/link
 * @param pendingRemoveOccurrenceId - Ref tracking which occurrence is pending removal
 * @param showConfirmDialog - Ref controlling confirm dialog visibility
 * @returns Handlers for component selection, field updates, and unlinking
 */
export function useKanjiDetailDialogComponentsHandlers(
  editOccurrences: Ref<EditOccurrence[]>,
  allComponents: Component[],
  pendingRemoveOccurrenceId: Ref<number | null>,
  showConfirmDialog: Ref<boolean>
): UseKanjiDetailDialogComponentsHandlersReturn {
  return {
    handleComponentSelect: (componentId: number) => {
      selectComponent(componentId, allComponents, editOccurrences)
    },
    handleOccurrenceUpdate: (
      occurrenceId: number | null,
      componentId: number,
      field: string,
      value: unknown
    ) => {
      updateOccurrenceField(
        occurrenceId,
        componentId,
        field,
        value,
        editOccurrences
      )
    },
    handleUnlinkRequest: (occurrenceId: number | null, componentId: number) => {
      requestUnlink(
        occurrenceId,
        componentId,
        editOccurrences,
        pendingRemoveOccurrenceId,
        showConfirmDialog
      )
    },
    handleUnlinkConfirm: () => {
      confirmUnlink(
        pendingRemoveOccurrenceId,
        showConfirmDialog,
        editOccurrences
      )
    },
    getVisibleOccurrences: () =>
      editOccurrences.value.filter((occ) => !occ.markedForDeletion)
  }
}
