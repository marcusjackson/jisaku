/**
 * use-kanji-detail-meanings-dialog-handlers
 *
 * Handlers for managing meanings in the edit dialog.
 */

import type { EditGroupMember, EditMeaning } from '../kanji-detail-types'
import type { Ref } from 'vue'

// ============================================================================
// Return type
// ============================================================================

interface UseKanjiDetailMeaningsDialogHandlersReturn {
  addMeaning: () => void
  updateMeaningText: (index: number, value: string) => void
  updateMeaningInfo: (index: number, value: string) => void
  moveMeaning: (index: number, direction: -1 | 1) => void
  removeMeaning: (index: number) => void
  getUnassignedMeanings: () => EditMeaning[]
}

// ============================================================================
// Module-scope implementation functions
// ============================================================================

function doAddMeaning(
  editMeanings: Ref<EditMeaning[]>,
  nextTempId: Ref<number>
): void {
  editMeanings.value.push({
    additionalInfo: '',
    id: nextTempId.value--,
    isNew: true,
    meaningText: ''
  })
}

function doMoveMeaning(
  editMeanings: Ref<EditMeaning[]>,
  index: number,
  direction: -1 | 1
): void {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= editMeanings.value.length) return
  const items = [...editMeanings.value]
  const current = items[index]
  const target = items[newIndex]
  if (current && target) {
    items[index] = target
    items[newIndex] = current
    editMeanings.value = items
  }
}

function doRemoveMeaning(
  editMeanings: Ref<EditMeaning[]>,
  editMembers: Ref<EditGroupMember[]>,
  index: number
): void {
  const removed = editMeanings.value[index]
  if (removed) {
    editMembers.value = editMembers.value.filter(
      (m) => m.meaningId !== removed.id
    )
  }
  editMeanings.value.splice(index, 1)
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Provides handlers for managing meanings in the edit dialog.
 *
 * @param editMeanings - Ref to the list of meanings being edited
 * @param editMembers - Ref to the group membership assignments
 * @param nextTempId - Ref providing decremented temp IDs for new items
 * @returns Handlers for meaning CRUD and unassigned meaning query
 */
export function useKanjiDetailMeaningsDialogHandlers(
  editMeanings: Ref<EditMeaning[]>,
  editMembers: Ref<EditGroupMember[]>,
  nextTempId: Ref<number>
): UseKanjiDetailMeaningsDialogHandlersReturn {
  return {
    addMeaning: () => {
      doAddMeaning(editMeanings, nextTempId)
    },
    updateMeaningText: (i, v) => {
      const m = editMeanings.value[i]
      if (m) m.meaningText = v
    },
    updateMeaningInfo: (i, v) => {
      const m = editMeanings.value[i]
      if (m) m.additionalInfo = v
    },
    moveMeaning: (i, d) => {
      doMoveMeaning(editMeanings, i, d)
    },
    removeMeaning: (i) => {
      doRemoveMeaning(editMeanings, editMembers, i)
    },
    getUnassignedMeanings: () => {
      const assignedIds = new Set(editMembers.value.map((m) => m.meaningId))
      return editMeanings.value.filter(
        (m) => !assignedIds.has(m.id) && m.meaningText.trim() !== ''
      )
    }
  }
}
