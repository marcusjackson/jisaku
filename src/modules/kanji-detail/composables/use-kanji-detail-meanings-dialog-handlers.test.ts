/**
 * Tests for useKanjiDetailMeaningsDialogHandlers
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useKanjiDetailMeaningsDialogHandlers } from './use-kanji-detail-meanings-dialog-handlers'

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup
} from '../kanji-detail-types'

describe('useKanjiDetailMeaningsDialogHandlers', () => {
  describe('meaning handlers', () => {
    it('adds a new meaning', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { addMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      addMeaning()

      expect(editMeanings.value).toHaveLength(1)
      expect(editMeanings.value[0]).toEqual({
        additionalInfo: '',
        id: -1,
        isNew: true,
        meaningText: ''
      })
      expect(nextTempId.value).toBe(-2)
    })

    it('updates meaning text', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'old' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { updateMeaningText } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      updateMeaningText(0, 'new')

      expect(editMeanings.value[0]?.meaningText).toBe('new')
    })

    it('updates meaning additional info', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'test' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { updateMeaningInfo } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      updateMeaningInfo(0, 'additional info')

      expect(editMeanings.value[0]?.additionalInfo).toBe('additional info')
    })

    it('moves meaning up', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'first' },
        { additionalInfo: '', id: 2, meaningText: 'second' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { moveMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      moveMeaning(1, -1)

      expect(editMeanings.value[0]?.meaningText).toBe('second')
      expect(editMeanings.value[1]?.meaningText).toBe('first')
    })

    it('moves meaning down', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'first' },
        { additionalInfo: '', id: 2, meaningText: 'second' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { moveMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      moveMeaning(0, 1)

      expect(editMeanings.value[0]?.meaningText).toBe('second')
      expect(editMeanings.value[1]?.meaningText).toBe('first')
    })

    it('does not move meaning beyond boundaries', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'first' },
        { additionalInfo: '', id: 2, meaningText: 'second' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { moveMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      moveMeaning(0, -1)
      expect(editMeanings.value[0]?.meaningText).toBe('first')

      moveMeaning(1, 1)
      expect(editMeanings.value[1]?.meaningText).toBe('second')
    })

    it('removes meaning and associated group members', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'first' },
        { additionalInfo: '', id: 2, meaningText: 'second' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { removeMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      removeMeaning(0)

      expect(editMeanings.value).toHaveLength(1)
      expect(editMeanings.value[0]?.meaningText).toBe('second')
      expect(editMembers.value).toHaveLength(0)
    })
  })

  describe('reading group handlers', () => {
    it('adds a new reading group', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { addReadingGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { updateReadingGroupText } = useKanjiDetailMeaningsDialogHandlers(
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

      const { moveReadingGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { removeReadingGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { getMeaningsInGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { getMeaningsInGroup } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      const result = getMeaningsInGroup(1)

      expect(result).toHaveLength(0)
    })

    it('gets unassigned meanings excluding empty ones', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'assigned' },
        { additionalInfo: '', id: 2, meaningText: 'unassigned' },
        { additionalInfo: '', id: 3, meaningText: '' },
        { additionalInfo: '', id: 4, meaningText: '  ' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { getUnassignedMeanings } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editGroups,
        editMembers,
        nextTempId
      )

      const result = getUnassignedMeanings()

      expect(result).toHaveLength(1)
      expect(result[0]?.meaningText).toBe('unassigned')
    })

    it('assigns meaning to group', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'test' }
      ])
      const editGroups = ref<EditReadingGroup[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { assignMeaningToGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { assignMeaningToGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { removeMeaningFromGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { moveMeaningInGroup } = useKanjiDetailMeaningsDialogHandlers(
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

      const { moveMeaningInGroup } = useKanjiDetailMeaningsDialogHandlers(
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
