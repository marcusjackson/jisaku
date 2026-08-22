/**
 * Tests for useKanjiDetailMeaningsDialogHandlers
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useKanjiDetailMeaningsDialogHandlers } from './use-kanji-detail-meanings-dialog-handlers'

import type { EditGroupMember, EditMeaning } from '../kanji-detail-types'

describe('useKanjiDetailMeaningsDialogHandlers', () => {
  describe('meaning handlers', () => {
    it('adds a new meaning', () => {
      const editMeanings = ref<EditMeaning[]>([])
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { addMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
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
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { updateMeaningText } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
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
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { updateMeaningInfo } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
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
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { moveMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
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
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { moveMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
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
      const editMembers = ref<EditGroupMember[]>([])
      const nextTempId = ref(-1)

      const { moveMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
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
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { removeMeaning } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editMembers,
        nextTempId
      )

      removeMeaning(0)

      expect(editMeanings.value).toHaveLength(1)
      expect(editMeanings.value[0]?.meaningText).toBe('second')
      expect(editMembers.value).toHaveLength(0)
    })

    it('gets unassigned meanings excluding empty ones', () => {
      const editMeanings = ref<EditMeaning[]>([
        { additionalInfo: '', id: 1, meaningText: 'assigned' },
        { additionalInfo: '', id: 2, meaningText: 'unassigned' },
        { additionalInfo: '', id: 3, meaningText: '' },
        { additionalInfo: '', id: 4, meaningText: '  ' }
      ])
      const editMembers = ref<EditGroupMember[]>([
        { displayOrder: 0, meaningId: 1, readingGroupId: 1 }
      ])
      const nextTempId = ref(-1)

      const { getUnassignedMeanings } = useKanjiDetailMeaningsDialogHandlers(
        editMeanings,
        editMembers,
        nextTempId
      )

      const result = getUnassignedMeanings()

      expect(result).toHaveLength(1)
      expect(result[0]?.meaningText).toBe('unassigned')
    })
  })
})
