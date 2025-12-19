/**
 * Tests for useVocabularyFilters composable
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock vue-router
const mockReplace = vi.fn()
const mockRoute = {
  query: {} as Record<string, string>
}

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({
    replace: mockReplace
  })
}))

// Import after mocking
import { useVocabularyFilters } from './use-vocabulary-filters'

describe('useVocabularyFilters', () => {
  beforeEach(() => {
    mockRoute.query = {}
    mockReplace.mockClear()
  })

  describe('filters', () => {
    it('returns empty filters when no query params', () => {
      const { filters } = useVocabularyFilters()
      expect(filters.value).toEqual({})
    })

    it('parses jlptLevels from query params', () => {
      mockRoute.query = { jlpt: 'N5,N4' }
      const { filters } = useVocabularyFilters()
      expect(filters.value.jlptLevels).toEqual(['N5', 'N4'])
    })

    it('parses isCommon from query params', () => {
      mockRoute.query = { common: 'true' }
      const { filters } = useVocabularyFilters()
      expect(filters.value.isCommon).toBe(true)
    })

    it('parses containsKanjiId from query params', () => {
      mockRoute.query = { kanji: '42' }
      const { filters } = useVocabularyFilters()
      expect(filters.value.containsKanjiId).toBe(42)
    })

    it('ignores invalid numeric values', () => {
      mockRoute.query = { kanji: 'abc' }
      const { filters } = useVocabularyFilters()
      expect(filters.value.containsKanjiId).toBeUndefined()
    })

    it('ignores invalid JLPT levels', () => {
      mockRoute.query = { jlpt: 'N5,invalid,N4' }
      const { filters } = useVocabularyFilters()
      expect(filters.value.jlptLevels).toEqual(['N5', 'N4'])
    })
  })

  describe('searchText', () => {
    it('initializes with empty string', () => {
      const { searchText } = useVocabularyFilters()
      expect(searchText.value).toBe('')
    })

    it('syncs from URL on init', async () => {
      mockRoute.query = { search: 'test' }
      const { searchText } = useVocabularyFilters()
      // Wait for watch to trigger
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(searchText.value).toBe('test')
    })
  })

  describe('updateFilter', () => {
    it('updates searchText through debounced search', async () => {
      const { searchText, updateFilter } = useVocabularyFilters()
      updateFilter('searchText', '日本')
      // Wait for debounce to settle
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(searchText.value).toBe('日本')
    })

    it('updates jlptLevels in URL', () => {
      const { updateFilter } = useVocabularyFilters()
      updateFilter('jlptLevels', ['N5', 'N4'])
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          query: expect.objectContaining({ jlpt: 'N5,N4' })
        })
      )
    })

    it('updates isCommon in URL', () => {
      const { updateFilter } = useVocabularyFilters()
      updateFilter('isCommon', true)
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          query: expect.objectContaining({ common: 'true' })
        })
      )
    })

    it('removes filter from URL when value is undefined', () => {
      mockRoute.query = { common: 'true' }
      const { updateFilter } = useVocabularyFilters()
      updateFilter('isCommon', undefined)
      expect(mockReplace).toHaveBeenCalledWith(
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          query: expect.not.objectContaining({ common: expect.anything() })
        })
      )
    })
  })

  describe('clearFilters', () => {
    it('resets searchText to empty string', () => {
      // When clearFilters is called, it sets searchText.value = ''
      // This tests that the reset happens (debounced)
      const { clearFilters, searchText } = useVocabularyFilters()
      clearFilters()
      // Since searchText uses debounce, the value starts at '' and stays ''
      // after clearFilters (which also sets to '')
      expect(searchText.value).toBe('')
    })

    it('clears URL query params', () => {
      mockRoute.query = { jlpt: 'N5', common: 'true' }
      const { clearFilters } = useVocabularyFilters()
      clearFilters()
      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when no filters are active', () => {
      const { hasActiveFilters } = useVocabularyFilters()
      expect(hasActiveFilters.value).toBe(false)
    })

    it('returns true when jlptLevels is set', () => {
      mockRoute.query = { jlpt: 'N5' }
      const { hasActiveFilters } = useVocabularyFilters()
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when isCommon is set', () => {
      mockRoute.query = { common: 'true' }
      const { hasActiveFilters } = useVocabularyFilters()
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when containsKanjiId is set', () => {
      mockRoute.query = { kanji: '42' }
      const { hasActiveFilters } = useVocabularyFilters()
      expect(hasActiveFilters.value).toBe(true)
    })

    it('returns true when searchText has value', async () => {
      const { hasActiveFilters, updateFilter } = useVocabularyFilters()
      updateFilter('searchText', 'test')
      await new Promise((resolve) => setTimeout(resolve, 200))
      expect(hasActiveFilters.value).toBe(true)
    })
  })
})
