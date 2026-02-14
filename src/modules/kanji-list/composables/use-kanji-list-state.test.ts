/**
 * Kanji List State Tests
 *
 * Tests for the kanji list state composable.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { nextTick, ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiListState } from './use-kanji-list-state'

// Mock vue-router
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

describe('useKanjiListState', () => {
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
      const { filters } = useKanjiListState()
      expect(filters.value).toEqual({})
    })

    it('reflects URL filter changes', () => {
      mockQuery.value = { strokeMin: '5' }
      const { filters } = useKanjiListState()
      expect(filters.value.strokeCountMin).toBe(5)
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters are active', () => {
      const { hasActiveFilters } = useKanjiListState()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('returns true when filters are active', () => {
      mockQuery.value = { strokeMin: '5' }
      const { hasActiveFilters } = useKanjiListState()
      expect(hasActiveFilters.value).toBe(true)
    })
  })

  describe('activeFilterCount', () => {
    it('returns 0 when no filters', () => {
      const { activeFilterCount } = useKanjiListState()
      expect(activeFilterCount.value).toBe(0)
    })

    it('counts active filters correctly', () => {
      mockQuery.value = { strokeMin: '5', strokeMax: '10', jlpt: 'N5' }
      const { activeFilterCount } = useKanjiListState()
      expect(activeFilterCount.value).toBe(3)
    })
  })

  describe('updateFilter', () => {
    it('updates character filter via debounced ref', async () => {
      const { characterSearch, updateFilter } = useKanjiListState()

      updateFilter('character', '山')
      vi.advanceTimersByTime(150)
      await nextTick()
      expect(characterSearch.value).toBe('山')
    })

    it('updates searchKeywords filter via debounced ref', async () => {
      const { keywordsSearch, updateFilter } = useKanjiListState()

      updateFilter('searchKeywords', 'mountain')
      vi.advanceTimersByTime(150)
      await nextTick()
      expect(keywordsSearch.value).toBe('mountain')
    })

    it('updates non-text filters via URL', async () => {
      const state = useKanjiListState()

      state.updateFilter('strokeCountMin', 5)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ strokeMin: '5' })
      })
    })

    it('updates JLPT levels array filter', async () => {
      const state = useKanjiListState()

      state.updateFilter('jlptLevels', ['N5', 'N4'])
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ jlpt: 'N5,N4' })
      })
    })

    it('updates analysis filters with serialization', async () => {
      const state = useKanjiListState()

      state.updateFilter('analysisFilters', [
        { field: 'notesEtymology', threshold: 'short' }
      ])
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ analysis: 'notesEtymology:short' })
      })
    })
  })

  describe('clearFilters', () => {
    it('clears all query params', async () => {
      mockQuery.value = { strokeMin: '5', jlpt: 'N5' }
      const { clearFilters } = useKanjiListState()

      clearFilters()
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })

  describe('refreshTrigger', () => {
    it('starts at 0', () => {
      const { refreshTrigger } = useKanjiListState()
      expect(refreshTrigger.value).toBe(0)
    })

    it('increments on triggerRefresh', () => {
      const { refreshTrigger, triggerRefresh } = useKanjiListState()

      triggerRefresh()
      expect(refreshTrigger.value).toBe(1)

      triggerRefresh()
      expect(refreshTrigger.value).toBe(2)
    })
  })
})
