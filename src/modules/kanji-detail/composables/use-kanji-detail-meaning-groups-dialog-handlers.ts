/**
 * use-kanji-detail-meaning-groups-dialog-handlers
 *
 * Handlers for managing reading groups and group membership in the edit dialog.
 */

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup
} from '../kanji-detail-types'
import type { Ref } from 'vue'

// ============================================================================
// Return type
// ============================================================================

interface UseKanjiDetailMeaningGroupsDialogHandlersReturn {
  addReadingGroup: () => void
  updateReadingGroupText: (index: number, value: string) => void
  moveReadingGroup: (index: number, direction: -1 | 1) => void
  removeReadingGroup: (index: number) => void
  getMeaningsInGroup: (groupId: number) => EditMeaning[]
  assignMeaningToGroup: (groupId: number, meaningId: number) => void
  removeMeaningFromGroup: (groupId: number, meaningId: number) => void
  moveMeaningInGroup: (
    groupId: number,
    index: number,
    direction: -1 | 1
  ) => void
}

// ============================================================================
// Module-scope implementation functions
// ============================================================================

function doAddReadingGroup(
  editGroups: Ref<EditReadingGroup[]>,
  nextTempId: Ref<number>
): void {
  editGroups.value.push({
    id: nextTempId.value--,
    isNew: true,
    readingText: ''
  })
}

function doMoveReadingGroup(
  editGroups: Ref<EditReadingGroup[]>,
  index: number,
  direction: -1 | 1
): void {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= editGroups.value.length) return
  const items = [...editGroups.value]
  const current = items[index]
  const target = items[newIndex]
  if (current && target) {
    items[index] = target
    items[newIndex] = current
    editGroups.value = items
  }
}

function doRemoveReadingGroup(
  editGroups: Ref<EditReadingGroup[]>,
  editMembers: Ref<EditGroupMember[]>,
  index: number
): void {
  const removed = editGroups.value[index]
  if (removed) {
    editMembers.value = editMembers.value.filter(
      (m) => m.readingGroupId !== removed.id
    )
  }
  editGroups.value.splice(index, 1)
}

function doAssignMeaningToGroup(
  editMembers: Ref<EditGroupMember[]>,
  groupId: number,
  meaningId: number
): void {
  const maxOrder = editMembers.value
    .filter((m) => m.readingGroupId === groupId)
    .reduce((max, m) => Math.max(max, m.displayOrder), -1)

  editMembers.value.push({
    displayOrder: maxOrder + 1,
    meaningId,
    readingGroupId: groupId
  })
}

function doMoveMeaningInGroup(
  editMembers: Ref<EditGroupMember[]>,
  groupId: number,
  index: number,
  direction: -1 | 1
): void {
  const groupMembers = editMembers.value
    .filter((m) => m.readingGroupId === groupId)
    .sort((a, b) => a.displayOrder - b.displayOrder)

  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= groupMembers.length) return

  const current = groupMembers[index]
  const target = groupMembers[newIndex]
  if (current && target) {
    const tempOrder = current.displayOrder
    current.displayOrder = target.displayOrder
    target.displayOrder = tempOrder
  }
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Provides handlers for managing reading groups and group membership in the edit dialog.
 *
 * @param editMeanings - Ref to the list of meanings being edited
 * @param editGroups - Ref to the list of reading groups being edited
 * @param editMembers - Ref to the group membership assignments
 * @param nextTempId - Ref providing decremented temp IDs for new items
 * @returns Handlers for all reading group and membership operations
 */
export function useKanjiDetailMeaningGroupsDialogHandlers(
  editMeanings: Ref<EditMeaning[]>,
  editGroups: Ref<EditReadingGroup[]>,
  editMembers: Ref<EditGroupMember[]>,
  nextTempId: Ref<number>
): UseKanjiDetailMeaningGroupsDialogHandlersReturn {
  return {
    addReadingGroup: () => {
      doAddReadingGroup(editGroups, nextTempId)
    },
    updateReadingGroupText: (i, v) => {
      const g = editGroups.value[i]
      if (g) g.readingText = v
    },
    moveReadingGroup: (i, d) => {
      doMoveReadingGroup(editGroups, i, d)
    },
    removeReadingGroup: (i) => {
      doRemoveReadingGroup(editGroups, editMembers, i)
    },
    getMeaningsInGroup: (groupId) => {
      const memberIds = new Set(
        editMembers.value
          .filter((m) => m.readingGroupId === groupId)
          .sort((a, b) => a.displayOrder - b.displayOrder)
          .map((m) => m.meaningId)
      )
      return editMeanings.value.filter((m) => memberIds.has(m.id))
    },
    assignMeaningToGroup: (gId, mId) => {
      doAssignMeaningToGroup(editMembers, gId, mId)
    },
    removeMeaningFromGroup: (gId, mId) => {
      editMembers.value = editMembers.value.filter(
        (m) => !(m.readingGroupId === gId && m.meaningId === mId)
      )
    },
    moveMeaningInGroup: (gId, i, d) => {
      doMoveMeaningInGroup(editMembers, gId, i, d)
    }
  }
}
