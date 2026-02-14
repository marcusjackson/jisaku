/**
 * Vocab List State Tests
 */

import { ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useVocabListState } from './use-vocab-list-state'

const mockQuery = ref<Record<string, string>>({})
const mockReplace = vi.fn()

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: mockQuery.value
  }),
  useRouter: () => ({
    replace: mockReplace
  })
}))

describe('useVocabListState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockQuery.value = {}
    mockReplace.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('filters', () => {
    it('returns empty filters when no URL params', () => {
      const { filters } = useVocabListState()
      expect(filters.value).toEqual({})
    })

    it('parses JLPT levels from URL', () => {
      mockQuery.value = { jlpt: 'N5,N4' }
      const { filters } = useVocabListState()
      expect(filters.value.jlptLevels).toEqual(['N5', 'N4'])
    })

    it('parses common filter from URL', () => {
      mockQuery.value = { common: 'true' }
      const { filters } = useVocabListState()
      expect(filters.value.isCommon).toBe(true)
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters', () => {
      const { hasActiveFilters } = useVocabListState()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('returns true when JLPT filter is active', () => {
      mockQuery.value = { jlpt: 'N5' }
      const { hasActiveFilters } = useVocabListState()
      expect(hasActiveFilters.value).toBe(true)
    })
  })

  describe('activeFilterCount', () => {
    it('returns 0 when no filters', () => {
      const { activeFilterCount } = useVocabListState()
      expect(activeFilterCount.value).toBe(0)
    })

    it('counts active filters', () => {
      mockQuery.value = { jlpt: 'N5', common: 'true' }
      const { activeFilterCount } = useVocabListState()
      expect(activeFilterCount.value).toBe(2)
    })
  })

  describe('updateFilter', () => {
    it('updates URL with JLPT levels', async () => {
      const { updateFilter } = useVocabListState()
      updateFilter('jlptLevels', ['N5', 'N4'])

      await vi.runAllTimersAsync()

      expect(mockReplace).toHaveBeenCalled()
    })
  })

  describe('clearFilters', () => {
    it('clears all URL params', async () => {
      mockQuery.value = { jlpt: 'N5', common: 'true' }
      const { clearFilters } = useVocabListState()
      clearFilters()

      await vi.runAllTimersAsync()

      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })
})
