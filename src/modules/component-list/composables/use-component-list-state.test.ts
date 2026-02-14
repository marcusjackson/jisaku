/**
 * Component List State Tests
 *
 * Tests for the component list state composable.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { nextTick, ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useComponentListState } from './use-component-list-state'

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

describe('useComponentListState', () => {
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
      const { filters } = useComponentListState()
      expect(filters.value).toEqual({})
    })

    it('reflects URL filter changes', () => {
      mockQuery.value = { strokeMin: '5' }
      const { filters } = useComponentListState()
      expect(filters.value.strokeCountMin).toBe(5)
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters are active', () => {
      const { hasActiveFilters } = useComponentListState()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('returns true when filters are active', () => {
      mockQuery.value = { strokeMin: '5' }
      const { hasActiveFilters } = useComponentListState()
      expect(hasActiveFilters.value).toBe(true)
    })
  })

  describe('activeFilterCount', () => {
    it('returns 0 when no filters', () => {
      const { activeFilterCount } = useComponentListState()
      expect(activeFilterCount.value).toBe(0)
    })

    it('counts active filters correctly', () => {
      mockQuery.value = {
        strokeMin: '5',
        strokeMax: '10',
        radical: 'true'
      }
      const { activeFilterCount } = useComponentListState()
      expect(activeFilterCount.value).toBe(3)
    })
  })

  describe('updateFilter', () => {
    it('updates character filter via debounced ref', async () => {
      const { characterSearch, updateFilter } = useComponentListState()

      updateFilter('character', '一')
      vi.advanceTimersByTime(150)
      await nextTick()
      expect(characterSearch.value).toBe('一')
    })

    it('updates searchKeywords filter via debounced ref', async () => {
      const { keywordsSearch, updateFilter } = useComponentListState()

      updateFilter('searchKeywords', 'one')
      vi.advanceTimersByTime(150)
      await nextTick()
      expect(keywordsSearch.value).toBe('one')
    })

    it('updates kangxiSearch filter via debounced ref', async () => {
      const { kangxiSearch, updateFilter } = useComponentListState()

      updateFilter('kangxiSearch', '1')
      vi.advanceTimersByTime(150)
      await nextTick()
      expect(kangxiSearch.value).toBe('1')
    })

    it('updates non-text filters via URL', async () => {
      const state = useComponentListState()

      state.updateFilter('strokeCountMin', 5)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ strokeMin: '5' })
      })
    })

    it('updates canBeRadical boolean filter', async () => {
      const state = useComponentListState()

      state.updateFilter('canBeRadical', true)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ radical: 'true' })
      })
    })

    it('updates presence filters', async () => {
      const state = useComponentListState()

      state.updateFilter('descriptionPresence', 'has')
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ description: 'has' })
      })
    })
  })

  describe('clearFilters', () => {
    it('clears all query params', async () => {
      mockQuery.value = { strokeMin: '5', canBeRadical: 'true' }
      const { clearFilters } = useComponentListState()

      clearFilters()
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })

  describe('refreshTrigger', () => {
    it('starts at 0', () => {
      const { refreshTrigger } = useComponentListState()
      expect(refreshTrigger.value).toBe(0)
    })

    it('increments when triggerRefresh called', () => {
      const { refreshTrigger, triggerRefresh } = useComponentListState()
      const initial = refreshTrigger.value

      triggerRefresh()

      expect(refreshTrigger.value).toBe(initial + 1)
    })
  })
})
