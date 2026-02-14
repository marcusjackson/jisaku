import { nextTick, ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiFilters } from './use-kanji-filters'

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

describe('useKanjiFilters', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockQuery.value = {}
    mockReplace.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('filters', () => {
    it('returns empty filters when no query params', () => {
      const { filters } = useKanjiFilters()
      expect(filters.value).toEqual({})
    })

    it('parses strokeMin from URL', () => {
      mockQuery.value = { strokeMin: '5' }
      const { filters } = useKanjiFilters()
      expect(filters.value.strokeCountMin).toBe(5)
    })

    it('parses strokeMax from URL', () => {
      mockQuery.value = { strokeMax: '10' }
      const { filters } = useKanjiFilters()
      expect(filters.value.strokeCountMax).toBe(10)
    })

    it('parses JLPT levels from URL', () => {
      mockQuery.value = { jlpt: 'N3,N2' }
      const { filters } = useKanjiFilters()
      expect(filters.value.jlptLevels).toEqual(['N3', 'N2'])
    })

    it('parses Joyo levels from URL', () => {
      mockQuery.value = { joyo: 'elementary1,elementary2' }
      const { filters } = useKanjiFilters()
      expect(filters.value.joyoLevels).toEqual(['elementary1', 'elementary2'])
    })

    it('parses component ID from URL', () => {
      mockQuery.value = { component: '42' }
      const { filters } = useKanjiFilters()
      expect(filters.value.componentId).toBe(42)
    })

    it('ignores invalid JLPT levels', () => {
      mockQuery.value = { jlpt: 'N3,invalid,N1' }
      const { filters } = useKanjiFilters()
      expect(filters.value.jlptLevels).toEqual(['N3', 'N1'])
    })

    it('ignores invalid Joyo levels', () => {
      mockQuery.value = { joyo: 'elementary1,invalid' }
      const { filters } = useKanjiFilters()
      expect(filters.value.joyoLevels).toEqual(['elementary1'])
    })

    it('ignores non-numeric stroke counts', () => {
      mockQuery.value = { strokeMin: 'abc' }
      const { filters } = useKanjiFilters()
      expect(filters.value.strokeCountMin).toBeUndefined()
    })
  })

  describe('characterSearch', () => {
    it('initializes from URL character param after debounce', () => {
      mockQuery.value = { character: '山' }
      const { characterSearch } = useKanjiFilters()

      // Initial sync goes through debounce
      vi.advanceTimersByTime(150)

      expect(characterSearch.value).toBe('山')
    })

    it('debounces character search updates', () => {
      const { characterSearch, filters } = useKanjiFilters()

      characterSearch.value = '川'

      // Should not update immediately
      expect(filters.value.character).toBeUndefined()

      // Advance past debounce delay
      vi.advanceTimersByTime(150)

      expect(filters.value.character).toBe('川')
    })

    it('syncs character search to URL after debounce', async () => {
      const { characterSearch } = useKanjiFilters()

      characterSearch.value = '森'
      vi.advanceTimersByTime(150)

      // Wait for watcher to run
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { character: '森' }
      })
    })
  })

  describe('updateFilter', () => {
    it('updates stroke count min filter', () => {
      const { updateFilter } = useKanjiFilters()

      updateFilter('strokeCountMin', 5)

      expect(mockReplace).toHaveBeenCalledWith({
        query: { strokeMin: '5' }
      })
    })

    it('updates JLPT levels filter', () => {
      const { updateFilter } = useKanjiFilters()

      updateFilter('jlptLevels', ['N3', 'N2'])

      expect(mockReplace).toHaveBeenCalledWith({
        query: { jlpt: 'N3,N2' }
      })
    })

    it('updates character through debounce', () => {
      const { characterSearch, updateFilter } = useKanjiFilters()

      updateFilter('character', '木')

      // Character goes through debounce
      expect(characterSearch.value).toBe('')

      vi.advanceTimersByTime(150)

      expect(characterSearch.value).toBe('木')
    })

    it('removes filter when value is undefined', () => {
      mockQuery.value = { strokeMin: '5' }
      const { updateFilter } = useKanjiFilters()

      updateFilter('strokeCountMin', undefined)

      expect(mockReplace).toHaveBeenCalledWith({
        query: {}
      })
    })

    it('removes filter when array is empty', () => {
      mockQuery.value = { jlpt: 'N3,N2' }
      const { updateFilter } = useKanjiFilters()

      updateFilter('jlptLevels', [])

      expect(mockReplace).toHaveBeenCalledWith({
        query: {}
      })
    })

    it('preserves other query params when updating', () => {
      mockQuery.value = { strokeMin: '5', jlpt: 'N3' }
      const { updateFilter } = useKanjiFilters()

      updateFilter('strokeCountMax', 15)

      expect(mockReplace).toHaveBeenCalledWith({
        query: { strokeMin: '5', jlpt: 'N3', strokeMax: '15' }
      })
    })
  })

  describe('clearFilters', () => {
    it('clears all filters', () => {
      mockQuery.value = { strokeMin: '5', jlpt: 'N3' }
      const { clearFilters } = useKanjiFilters()

      clearFilters()

      expect(mockReplace).toHaveBeenCalledWith({
        query: {}
      })
    })

    it('clears character search', () => {
      mockQuery.value = { character: '山' }
      const { characterSearch, clearFilters } = useKanjiFilters()

      clearFilters()

      expect(characterSearch.value).toBe('')
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters active', () => {
      const { hasActiveFilters } = useKanjiFilters()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('returns true when stroke count filter active', () => {
      mockQuery.value = { strokeMin: '5' }
      const { hasActiveFilters } = useKanjiFilters()
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when JLPT filter active', () => {
      mockQuery.value = { jlpt: 'N3' }
      const { hasActiveFilters } = useKanjiFilters()
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when Joyo filter active', () => {
      mockQuery.value = { joyo: 'elementary1' }
      const { hasActiveFilters } = useKanjiFilters()
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when component filter active', () => {
      mockQuery.value = { component: '1' }
      const { hasActiveFilters } = useKanjiFilters()
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when character search active', () => {
      mockQuery.value = { character: '山' }
      const { characterSearch, hasActiveFilters } = useKanjiFilters()

      // Wait for character to sync from URL through debounce
      vi.advanceTimersByTime(150)

      expect(characterSearch.value).toBe('山')
      expect(hasActiveFilters.value).toBe(true)
    })
  })
})
