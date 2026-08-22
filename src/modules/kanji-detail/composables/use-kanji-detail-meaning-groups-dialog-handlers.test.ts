/**
 * Tests for useKanjiDetailMeaningGroupsDialogHandlers
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useKanjiDetailMeaningGroupsDialogHandlers } from './use-kanji-detail-meaning-groups-dialog-handlers'

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup
} from '../kanji-detail-types'

describe('useKanjiDetailMeaningGroupsDialogHandlers', () => {
  describe('reading group handlers', () => {
    it('adds a new reading group', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { addReadingGroup } = useKanjiDetailMeaningGroupsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      addReadingGroup()

      expect(editGroups.value).toHaveLength(1)
      expect(editGroups.value[0]).toEqual({
        id: -1,
        isNew: true,
        readingText: ''
      })
      expect(nextTempId.value).toBe(-2)
    })

    it('updates reading group text', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([
        { id: 1, readingText: 'old' }
      ])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { updateReadingGroupText } =
        useKanjiDetailMeaningGroupsDialogHandlers(
          editMeanings,
          editGroups,
          editMembers,
          nextTempId
        )

      updateReadingGroupText(0, 'new')

      expect(editGroups.value[0]?.readingText).toBe('new')
    })

    it('moves reading group up', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([
        { id: 1, readingText: 'first' },
        { id: 2, readingText: 'second' }
      ])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { moveReadingGroup } = useKanjiDetailMeaningGroupsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      moveReadingGroup(1, -1)

      expect(editGroups.value[0]?.readingText).toBe('second')
      expect(editGroups.value[1]?.readingText).toBe('first')
    })

    it('removes reading group and associated members', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([
        { id: 1, readingText: 'first' },
        { id: 2, readingText: 'second' }
      ])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 },
        { displayOrder: 1, meaningId: 2, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { removeReadingGroup } = useKanjiDetailMeaningGroupsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      removeReadingGroup(0)

      expect(editGroups.value).toHaveLength(1)
      expect(editGroups.value[0]?.readingText).toBe('second')
      expect(editMembers.value).toHaveLength(0)
    })
  })

  describe('group member handlers', () => {
    it('gets meanings in a group', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'first' },
        { additionalInfo: '', id: 2, meaningText: 'second' },
        { additionalInfo: '', id: 3, meaningText: 'third' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 },
        { displayOrder: 1, meaningId: 3, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { getMeaningsInGroup } = useKanjiDetailMeaningGroupsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      const result = getMeaningsInGroup(1)

      expect(result).toHaveLength(2)
      expect(result[0]?.meaningText).toBe('first')
      expect(result[1]?.meaningText).toBe('third')
    })

    it('returns empty array for group with no meanings', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'first' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { getMeaningsInGroup } = useKanjiDetailMeaningGroupsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      const result = getMeaningsInGroup(1)

      expect(result).toHaveLength(0)
    })

    it('assigns meaning to group', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'test' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { assignMeaningToGroup } =
        useKanjiDetailMeaningGroupsDialogHandlers(
          editMeanings,
          editGroups,
          editMembers,
          nextTempId
        )

      assignMeaningToGroup(1, 1)

      expect(editMembers.value).toHaveLength(1)
      expect(editMembers.value[0]).toEqual({
        displayOrder: 0,
        meaningId: 1,
        readingGroupId: 1
      })
    })

    it('assigns meaning to group with correct display order', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'first' },
        { additionalInfo: '', id: 2, meaningText: 'second' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { assignMeaningToGroup } =
        useKanjiDetailMeaningGroupsDialogHandlers(
          editMeanings,
          editGroups,
          editMembers,
          nextTempId
        )

      assignMeaningToGroup(1, 2)

      expect(editMembers.value).toHaveLength(2)
      expect(editMembers.value[1]?.displayOrder).toBe(1)
    })

    it('removes meaning from group', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 },
        { displayOrder: 1, meaningId: 2, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { removeMeaningFromGroup } =
        useKanjiDetailMeaningGroupsDialogHandlers(
          editMeanings,
          editGroups,
          editMembers,
          nextTempId
        )

      removeMeaningFromGroup(1, 1)

      expect(editMembers.value).toHaveLength(1)
      expect(editMembers.value[0]?.meaningId).toBe(2)
    })

    it('moves meaning within group up', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 },
        { displayOrder: 1, meaningId: 2, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { moveMeaningInGroup } = useKanjiDetailMeaningGroupsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      moveMeaningInGroup(1, 1, -1)

      const member1 = editMembers.value.find((m) => m.meaningId === 1)
      const member2 = editMembers.value.find((m) => m.meaningId === 2)
      expect(member1?.displayOrder).toBe(1)
      expect(member2?.displayOrder).toBe(0)
    })

    it('does not move meaning within group beyond boundaries', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { moveMeaningInGroup } = useKanjiDetailMeaningGroupsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      moveMeaningInGroup(1, 0, -1)

      const member = editMembers.value.find((m) => m.meaningId === 1)
      expect(member?.displayOrder).toBe(0)
    })
  })
})
