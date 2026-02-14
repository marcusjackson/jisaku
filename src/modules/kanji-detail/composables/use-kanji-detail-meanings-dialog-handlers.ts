/**
 * use-kanji-detail-meanings-dialog-handlers
 *
 * Handlers for managing meanings and reading groups in the edit dialog.
 * Extracted from KanjiDetailDialogMeanings to keep file size under limit.
 */

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup
} from '../kanji-detail-types'
import type { Ref } from 'vue'

// eslint-disable-next-line max-lines-per-function -- Handler collection composable
export function useKanjiDetailMeaningsDialogHandlers(
  editMeanings: Ref<EditMeaning[]>,
  editGroups: Ref<EditReadingGroup[]>,
  editMembers: Ref<EditGroupMember[]>,
  nextTempId: Ref<number>
) {
  // Meaning handlers
  function addMeaning(): void {
    editMeanings.value.push({
      additionalInfo: '',
      id: nextTempId.value--,
      isNew: true,
      meaningText: ''
    })
  }

  function updateMeaningText(index: number, value: string): void {
    const meaning = editMeanings.value[index]
    if (meaning) meaning.meaningText = value
  }

  function updateMeaningInfo(index: number, value: string): void {
    const meaning = editMeanings.value[index]
    if (meaning) meaning.additionalInfo = value
  }

  function moveMeaning(index: number, direction: -1 | 1): void {
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

  function removeMeaning(index: number): void {
    const removed = editMeanings.value[index]
    if (removed) {
      editMembers.value = editMembers.value.filter(
        (m) => m.meaningId !== removed.id
      )
    }
    editMeanings.value.splice(index, 1)
  }

  // Reading group handlers
  function addReadingGroup(): void {
    editGroups.value.push({
      id: nextTempId.value--,
      isNew: true,
      readingText: ''
    })
  }

  function updateReadingGroupText(index: number, value: string): void {
    const group = editGroups.value[index]
    if (group) group.readingText = value
  }

  function moveReadingGroup(index: number, direction: -1 | 1): void {
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

  function removeReadingGroup(index: number): void {
    const removed = editGroups.value[index]
    if (removed) {
      // Remove all members from this group
      editMembers.value = editMembers.value.filter(
        (m) => m.readingGroupId !== removed.id
      )
    }
    editGroups.value.splice(index, 1)
  }

  // Group member handlers
  function getMeaningsInGroup(groupId: number): EditMeaning[] {
    const memberIds = editMembers.value
      .filter((m) => m.readingGroupId === groupId)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((m) => m.meaningId)
    return editMeanings.value.filter((m) => memberIds.includes(m.id))
  }

  function getUnassignedMeanings(): EditMeaning[] {
    const assignedIds = new Set(editMembers.value.map((m) => m.meaningId))
    return editMeanings.value.filter(
      (m) => !assignedIds.has(m.id) && m.meaningText.trim() !== ''
    )
  }

  function assignMeaningToGroup(groupId: number, meaningId: number): void {
    const maxOrder = editMembers.value
      .filter((m) => m.readingGroupId === groupId)
      .reduce((max, m) => Math.max(max, m.displayOrder), -1)

    editMembers.value.push({
      displayOrder: maxOrder + 1,
      meaningId,
      readingGroupId: groupId
    })
  }

  function removeMeaningFromGroup(groupId: number, meaningId: number): void {
    editMembers.value = editMembers.value.filter(
      (m) => !(m.readingGroupId === groupId && m.meaningId === meaningId)
    )
  }

  function moveMeaningInGroup(
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
      // Swap display orders
      const tempOrder = current.displayOrder
      current.displayOrder = target.displayOrder
      target.displayOrder = tempOrder
    }
  }

  return {
    addMeaning,
    addReadingGroup,
    assignMeaningToGroup,
    getMeaningsInGroup,
    getUnassignedMeanings,
    moveMeaning,
    moveMeaningInGroup,
    moveReadingGroup,
    removeMeaning,
    removeMeaningFromGroup,
    removeReadingGroup,
    updateMeaningInfo,
    updateMeaningText,
    updateReadingGroupText
  }
}
