/**
 * Tests for useComponentFilters composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock vue-router
const mockReplace = vi.fn()
const mockRoute = {
  query: {}
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    replace: mockReplace
  })
}))

// Import after mocking
import { useComponentFilters } from './use-component-filters'

describe('useComponentFilters', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockReplace.mockClear()
  })

  describe('filters', () => {
    it('returns empty filters when no query params', () => {
      const { filters } = useComponentFilters()
      expect(filters.value).toEqual({})
    })

    it('parses strokeCountMin from query params', () => {
      mockRoute.query = { strokeMin: '5' }
      const { filters } = useComponentFilters()
      expect(filters.value.strokeCountMin).toBe(5)
    })

    it('parses strokeCountMax from query params', () => {
      mockRoute.query = { strokeMax: '10' }
      const { filters } = useComponentFilters()
      expect(filters.value.strokeCountMax).toBe(10)
    })

    it('parses sourceKanjiId from query params', () => {
      mockRoute.query = { sourceKanji: '42' }
      const { filters } = useComponentFilters()
      expect(filters.value.sourceKanjiId).toBe(42)
    })

    it('ignores invalid numeric values', () => {
      mockRoute.query = { strokeMin: 'abc', strokeMax: 'xyz' }
      const { filters } = useComponentFilters()
      expect(filters.value.strokeCountMin).toBeUndefined()
      expect(filters.value.strokeCountMax).toBeUndefined()
    })
  })

  describe('characterSearch', () => {
    it('initializes with empty string', () => {
      const { characterSearch } = useComponentFilters()
      expect(characterSearch.value).toBe('')
    })

    it('syncs from URL on init', async () => {
      mockRoute.query = { character: '水' }
      const { characterSearch } = useComponentFilters()
      // Wait for watch to trigger and debounce to settle (150ms default + buffer)
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(characterSearch.value).toBe('水')
    })
  })

  describe('searchKeywords', () => {
    it('initializes with empty string', () => {
      const { searchKeywords } = useComponentFilters()
      expect(searchKeywords.value).toBe('')
    })

    it('syncs from URL on init', async () => {
      mockRoute.query = { keywords: 'test' }
      const { searchKeywords } = useComponentFilters()
      // Wait for watch to trigger and debounce to settle (150ms default + buffer)
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(searchKeywords.value).toBe('test')
    })
  })

  describe('updateFilter', () => {
    it('updates character through debounced search', async () => {
      const { characterSearch, updateFilter } = useComponentFilters()
      updateFilter('character', '日')
      // Wait for debounce to settle
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(characterSearch.value).toBe('日')
    })

    it('updates searchKeywords through debounced search', async () => {
      const { searchKeywords, updateFilter } = useComponentFilters()
      updateFilter('searchKeywords', 'test')
      // Wait for debounce to settle
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(searchKeywords.value).toBe('test')
    })

    it('updates strokeCountMin in URL', () => {
      const { updateFilter } = useComponentFilters()
      updateFilter('strokeCountMin', 5)
      expect(mockReplace).toHaveBeenCalledWith({
        query: { strokeMin: '5' }
      })
    })

    it('updates strokeCountMax in URL', () => {
      const { updateFilter } = useComponentFilters()
      updateFilter('strokeCountMax', 10)
      expect(mockReplace).toHaveBeenCalledWith({
        query: { strokeMax: '10' }
      })
    })

    it('updates sourceKanjiId in URL', () => {
      const { updateFilter } = useComponentFilters()
      updateFilter('sourceKanjiId', 42)
      expect(mockReplace).toHaveBeenCalledWith({
        query: { sourceKanji: '42' }
      })
    })
  })

  describe('clearFilters', () => {
    it('clears all filters', () => {
      mockRoute.query = { character: '水', strokeMin: '5' }
      const { characterSearch, clearFilters, searchKeywords } =
        useComponentFilters()
      clearFilters()
      expect(characterSearch.value).toBe('')
      expect(searchKeywords.value).toBe('')
      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters active', () => {
      const { hasActiveFilters } = useComponentFilters()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('returns true when character filter active', async () => {
      mockRoute.query = { character: '水' }
      const { hasActiveFilters } = useComponentFilters()
      // Wait for watch to trigger
      await new Promise((resolve) => setTimeout(resolve, 10))
      // Character search should sync from URL
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when strokeCountMin active', () => {
      mockRoute.query = { strokeMin: '5' }
      const { hasActiveFilters } = useComponentFilters()
      expect(hasActiveFilters.value).toBe(true)
    })
  })
})
