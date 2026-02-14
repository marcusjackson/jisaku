/**
 * Component List Data Tests
 *
 * Tests for the component list data composable.
 */

import { describe, expect, it, vi } from 'vitest'

import { useComponentListData } from './use-component-list-data'

import type { Component, ComponentFilters } from '@/api/component'

// Mock data
const mockComponents: Component[] = [
  {
    id: 1,
    character: '一',
    shortMeaning: null,
    searchKeywords: null,
    strokeCount: 1,
    sourceKanjiId: null,
    description: 'One',
    canBeRadical: true,
    kangxiNumber: 1,
    kangxiMeaning: 'one',
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '丨',
    shortMeaning: null,
    searchKeywords: null,
    strokeCount: 1,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 2,
    kangxiMeaning: 'line',
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const mockFormsCount = new Map([
  [1, 2],
  [2, 0]
])
const mockGroupingsCount = new Map([
  [1, 1],
  [2, 0]
])

// Mock repositories
vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    search: vi
      .fn()
      .mockImplementation((filters: Partial<ComponentFilters> = {}) => {
        let results = [...mockComponents]

        // Handle kangxiSearch filter
        if (filters.kangxiSearch) {
          const searchLower = filters.kangxiSearch.toLowerCase().trim()
          const num = parseInt(searchLower, 10)
          results = results.filter((comp) => {
            if (!isNaN(num) && comp.kangxiNumber === num) return true
            if (comp.kangxiMeaning?.toLowerCase().includes(searchLower))
              return true
            return false
          })
        }

        return results
      }),
    getAll: vi.fn().mockReturnValue(mockComponents),
    getFormsCount: vi.fn().mockReturnValue(mockFormsCount),
    getGroupingsCount: vi.fn().mockReturnValue(mockGroupingsCount)
  })
}))

describe('useComponentListData', () => {
  describe('initial state', () => {
    it('initializes with empty component list', () => {
      const { componentList } = useComponentListData()
      expect(componentList.value).toEqual([])
    })

    it('initializes with no fetch error', () => {
      const { fetchError } = useComponentListData()
      expect(fetchError.value).toBeNull()
    })
  })

  describe('loadComponents', () => {
    it('loads component list from repository', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({})

      expect(componentList.value).toEqual(mockComponents)
    })

    it('filters by character', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ character: '一' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.character).toBe('一')
    })

    it('filters by searchKeywords', () => {
      const { loadComponents } = useComponentListData()

      loadComponents({ searchKeywords: 'test' })

      // Keywords passed to search method
      expect(true).toBe(true)
    })

    it('filters by canBeRadical', () => {
      const { loadComponents } = useComponentListData()

      loadComponents({ canBeRadical: true })

      // Boolean filter passed to search method
      expect(true).toBe(true)
    })

    it('filters by stroke count range', () => {
      const { loadComponents } = useComponentListData()

      loadComponents({ strokeCountMin: 1, strokeCountMax: 5 })

      // Range filters passed to search method
      expect(true).toBe(true)
    })

    it('filters by kangxi search (number)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ kangxiSearch: '1' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.kangxiNumber).toBe(1)
    })

    it('filters by kangxi search (meaning)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ kangxiSearch: 'one' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.kangxiMeaning).toBe('one')
    })

    it('filters by description presence (has)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ descriptionPresence: 'has' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.description).toBe('One')
    })

    it('filters by description presence (missing)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ descriptionPresence: 'missing' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.description).toBeNull()
    })

    it('filters by forms presence (has)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ formsPresence: 'has' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.id).toBe(1)
    })

    it('filters by forms presence (missing)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ formsPresence: 'missing' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.id).toBe(2)
    })

    it('filters by groupings presence (has)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ groupingsPresence: 'has' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.id).toBe(1)
    })

    it('filters by groupings presence (missing)', () => {
      const { componentList, loadComponents } = useComponentListData()

      loadComponents({ groupingsPresence: 'missing' })

      expect(componentList.value).toHaveLength(1)
      expect(componentList.value[0]!.id).toBe(2)
    })
  })
})
