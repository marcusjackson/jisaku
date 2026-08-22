/**
 * Tests for use-manage-members composable
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useComponentDetailManageMembers } from './use-component-detail-manage-members'

import type {
  ComponentGroupingMember,
  OccurrenceWithKanji
} from '@/api/component'

function createMember(
  overrides: Partial<ComponentGroupingMember> & {
    id: number
    occurrenceId: number
    displayOrder: number
  }
): ComponentGroupingMember {
  return {
    groupingId: 1,
    ...overrides
  }
}

function createOccurrence(
  overrides: Partial<OccurrenceWithKanji> & { id: number }
): OccurrenceWithKanji {
  return {
    kanjiId: overrides.id,
    componentId: 1,
    componentFormId: null,
    positionTypeId: null,
    isRadical: false,
    analysisNotes: null,
    displayOrder: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    kanji: {
      id: overrides.id,
      character: '漢',
      shortMeaning: 'test',
      strokeCount: null
    },
    position: null,
    ...overrides
  }
}

describe('useComponentDetailManageMembers', () => {
  const members = ref<ComponentGroupingMember[]>([])
  const occurrences = ref<OccurrenceWithKanji[]>([])

  function setup() {
    return useComponentDetailManageMembers({
      members: () => members.value,
      occurrences: () => occurrences.value,
      groupingName: () => 'Test Group'
    })
  }

  describe('memberOccurrences', () => {
    it('returns members joined with occurrence data sorted by displayOrder', () => {
      const occ1 = createOccurrence({ id: 10 })
      const occ2 = createOccurrence({ id: 20 })
      occurrences.value = [occ1, occ2]
      members.value = [
        createMember({ id: 1, occurrenceId: 20, displayOrder: 1 }),
        createMember({ id: 2, occurrenceId: 10, displayOrder: 2 })
      ]

      const { memberOccurrences } = setup()
      expect(memberOccurrences.value).toHaveLength(2)
      expect(memberOccurrences.value[0]?.occurrence.id).toBe(20)
      expect(memberOccurrences.value[1]?.occurrence.id).toBe(10)
    })

    it('filters out members without matching occurrences', () => {
      occurrences.value = [createOccurrence({ id: 10 })]
      members.value = [
        createMember({ id: 1, occurrenceId: 10, displayOrder: 1 }),
        createMember({ id: 2, occurrenceId: 999, displayOrder: 2 })
      ]

      const { memberOccurrences } = setup()
      expect(memberOccurrences.value).toHaveLength(1)
    })
  })

  describe('availableOccurrences', () => {
    it('returns occurrences not in any member', () => {
      occurrences.value = [
        createOccurrence({ id: 10 }),
        createOccurrence({ id: 20 }),
        createOccurrence({ id: 30 })
      ]
      members.value = [
        createMember({ id: 1, occurrenceId: 10, displayOrder: 1 })
      ]

      const { availableOccurrences } = setup()
      expect(availableOccurrences.value).toHaveLength(2)
      expect(availableOccurrences.value.map((o) => o.id)).toEqual([20, 30])
    })
  })

  describe('dialogTitle', () => {
    it('includes the grouping name', () => {
      members.value = []
      occurrences.value = []
      const { dialogTitle } = setup()
      expect(dialogTitle.value).toBe('Manage Members — Test Group')
    })
  })

  describe('getReorderedIds', () => {
    it('returns null when moving first item up', () => {
      occurrences.value = [
        createOccurrence({ id: 10 }),
        createOccurrence({ id: 20 })
      ]
      members.value = [
        createMember({ id: 1, occurrenceId: 10, displayOrder: 1 }),
        createMember({ id: 2, occurrenceId: 20, displayOrder: 2 })
      ]

      const { getReorderedIds } = setup()
      expect(getReorderedIds(0, 'up')).toBeNull()
    })

    it('returns null when moving last item down', () => {
      occurrences.value = [
        createOccurrence({ id: 10 }),
        createOccurrence({ id: 20 })
      ]
      members.value = [
        createMember({ id: 1, occurrenceId: 10, displayOrder: 1 }),
        createMember({ id: 2, occurrenceId: 20, displayOrder: 2 })
      ]

      const { getReorderedIds } = setup()
      expect(getReorderedIds(1, 'down')).toBeNull()
    })

    it('swaps items when moving up', () => {
      occurrences.value = [
        createOccurrence({ id: 10 }),
        createOccurrence({ id: 20 })
      ]
      members.value = [
        createMember({ id: 1, occurrenceId: 10, displayOrder: 1 }),
        createMember({ id: 2, occurrenceId: 20, displayOrder: 2 })
      ]

      const { getReorderedIds } = setup()
      expect(getReorderedIds(1, 'up')).toEqual([20, 10])
    })

    it('swaps items when moving down', () => {
      occurrences.value = [
        createOccurrence({ id: 10 }),
        createOccurrence({ id: 20 })
      ]
      members.value = [
        createMember({ id: 1, occurrenceId: 10, displayOrder: 1 }),
        createMember({ id: 2, occurrenceId: 20, displayOrder: 2 })
      ]

      const { getReorderedIds } = setup()
      expect(getReorderedIds(0, 'down')).toEqual([20, 10])
    })
  })
})
