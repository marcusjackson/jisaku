/**
 * Tests for use-kanji-detail-meanings-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailMeaningsHandlers } from './use-kanji-detail-meanings-handlers'

import type { MeaningsSaveData } from '../kanji-detail-types'
import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/api/kanji'
import type { Ref } from 'vue'

function mockMeaning(overrides: Partial<KanjiMeaning> = {}): KanjiMeaning {
  return {
    id: 1,
    kanjiId: 1,
    meaningText: 'bright',
    additionalInfo: null,
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

function mockReadingGroup(
  overrides: Partial<KanjiMeaningReadingGroup> = {}
): KanjiMeaningReadingGroup {
  return {
    id: 1,
    kanjiId: 1,
    readingText: 'メイ',
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

function mockGroupMember(
  overrides: Partial<KanjiMeaningGroupMember> = {}
): KanjiMeaningGroupMember {
  return {
    id: 1,
    readingGroupId: 1,
    meaningId: 1,
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

describe('useKanjiDetailMeaningsHandlers', () => {
  let kanjiId: Ref<number>
  let meanings: Ref<KanjiMeaning[]>
  let readingGroups: Ref<KanjiMeaningReadingGroup[]>
  let groupMembers: Ref<KanjiMeaningGroupMember[]>
  let mockMeaningRepo: {
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
    reorder: ReturnType<typeof vi.fn>
    getByParentId: ReturnType<typeof vi.fn>
  }
  let mockReadingGroupRepo: {
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
    reorder: ReturnType<typeof vi.fn>
    getByParentId: ReturnType<typeof vi.fn>
  }
  let mockGroupMemberRepo: {
    create: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
    removeAllByGroupId: ReturnType<typeof vi.fn>
    getByKanjiId: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    kanjiId = ref(1)
    meanings = ref<KanjiMeaning[]>([mockMeaning({ id: 1 })])
    readingGroups = ref<KanjiMeaningReadingGroup[]>([])
    groupMembers = ref<KanjiMeaningGroupMember[]>([])

    mockMeaningRepo = {
      create: vi.fn().mockReturnValue(mockMeaning({ id: 2 })),
      update: vi.fn().mockReturnValue(mockMeaning()),
      remove: vi.fn(),
      reorder: vi.fn(),
      getByParentId: vi.fn().mockReturnValue([mockMeaning()])
    }

    mockReadingGroupRepo = {
      create: vi.fn().mockReturnValue(mockReadingGroup({ id: 2 })),
      update: vi.fn().mockReturnValue(mockReadingGroup()),
      remove: vi.fn(),
      reorder: vi.fn(),
      getByParentId: vi.fn().mockReturnValue([])
    }

    mockGroupMemberRepo = {
      create: vi.fn().mockReturnValue(mockGroupMember({ id: 2 })),
      remove: vi.fn(),
      removeAllByGroupId: vi.fn(),
      getByKanjiId: vi.fn().mockReturnValue([])
    }
  })

  describe('handleSaveMeanings', () => {
    it('creates new meanings', () => {
      const { handleSaveMeanings } = useKanjiDetailMeaningsHandlers(
        { kanjiId, meanings, readingGroups, groupMembers },
        {
          meaningRepo: mockMeaningRepo as never,
          readingGroupRepo: mockReadingGroupRepo as never,
          groupMemberRepo: mockGroupMemberRepo as never
        }
      )

      const saveData: MeaningsSaveData = {
        meanings: [
          { id: 1, meaningText: 'bright', additionalInfo: '' },
          {
            id: -1,
            meaningText: 'light',
            additionalInfo: 'illumination',
            isNew: true
          }
        ],
        readingGroups: [],
        groupMembers: [],
        groupingEnabled: false,
        groupingDisabled: false
      }

      handleSaveMeanings(saveData)

      expect(mockMeaningRepo.create).toHaveBeenCalledWith({
        kanjiId: 1,
        meaningText: 'light',
        additionalInfo: 'illumination',
        displayOrder: 1
      })
    })

    it('updates existing meanings', () => {
      const { handleSaveMeanings } = useKanjiDetailMeaningsHandlers(
        { kanjiId, meanings, readingGroups, groupMembers },
        {
          meaningRepo: mockMeaningRepo as never,
          readingGroupRepo: mockReadingGroupRepo as never,
          groupMemberRepo: mockGroupMemberRepo as never
        }
      )

      const saveData: MeaningsSaveData = {
        meanings: [
          { id: 1, meaningText: 'brilliant', additionalInfo: 'shining' }
        ],
        readingGroups: [],
        groupMembers: [],
        groupingEnabled: false,
        groupingDisabled: false
      }

      handleSaveMeanings(saveData)

      expect(mockMeaningRepo.update).toHaveBeenCalledWith(1, {
        meaningText: 'brilliant',
        additionalInfo: 'shining'
      })
    })

    it('removes deleted meanings', () => {
      meanings.value = [mockMeaning({ id: 1 }), mockMeaning({ id: 2 })]

      const { handleSaveMeanings } = useKanjiDetailMeaningsHandlers(
        { kanjiId, meanings, readingGroups, groupMembers },
        {
          meaningRepo: mockMeaningRepo as never,
          readingGroupRepo: mockReadingGroupRepo as never,
          groupMemberRepo: mockGroupMemberRepo as never
        }
      )

      const saveData: MeaningsSaveData = {
        meanings: [{ id: 1, meaningText: 'bright', additionalInfo: '' }],
        readingGroups: [],
        groupMembers: [],
        groupingEnabled: false,
        groupingDisabled: false
      }

      handleSaveMeanings(saveData)

      expect(mockMeaningRepo.remove).toHaveBeenCalledWith(2)
    })

    it('handles disabling grouping', () => {
      readingGroups.value = [mockReadingGroup({ id: 1 })]
      groupMembers.value = [mockGroupMember({ id: 1 })]

      const { handleSaveMeanings } = useKanjiDetailMeaningsHandlers(
        { kanjiId, meanings, readingGroups, groupMembers },
        {
          meaningRepo: mockMeaningRepo as never,
          readingGroupRepo: mockReadingGroupRepo as never,
          groupMemberRepo: mockGroupMemberRepo as never
        }
      )

      const saveData: MeaningsSaveData = {
        meanings: [{ id: 1, meaningText: 'bright', additionalInfo: '' }],
        readingGroups: [],
        groupMembers: [],
        groupingEnabled: false,
        groupingDisabled: true
      }

      handleSaveMeanings(saveData)

      expect(mockGroupMemberRepo.remove).toHaveBeenCalledWith(1)
      expect(mockReadingGroupRepo.remove).toHaveBeenCalledWith(1)
    })
  })

  describe('reloadMeanings', () => {
    it('reloads all meaning data from repositories', () => {
      const newMeanings = [mockMeaning({ id: 3, meaningText: 'new' })]
      mockMeaningRepo.getByParentId.mockReturnValue(newMeanings)

      const { reloadMeanings } = useKanjiDetailMeaningsHandlers(
        { kanjiId, meanings, readingGroups, groupMembers },
        {
          meaningRepo: mockMeaningRepo as never,
          readingGroupRepo: mockReadingGroupRepo as never,
          groupMemberRepo: mockGroupMemberRepo as never
        }
      )

      reloadMeanings()

      expect(meanings.value).toEqual(newMeanings)
      expect(mockReadingGroupRepo.getByParentId).toHaveBeenCalledWith(1)
      expect(mockGroupMemberRepo.getByKanjiId).toHaveBeenCalledWith(1)
    })
  })
})
