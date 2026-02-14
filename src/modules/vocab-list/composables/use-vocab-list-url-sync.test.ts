/**
 * Vocab List URL Sync Tests
 */

import { ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useVocabListUrlSync } from './use-vocab-list-url-sync'

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

describe('useVocabListUrlSync', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockQuery.value = {}
    mockReplace.mockClear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('searchText', () => {
    it('provides a debounced text ref', () => {
      const { searchText } = useVocabListUrlSync()
      expect(searchText.value).toBe('')
      // searchText syncs to URL via watch - tested via integration
    })
  })

  describe('kanaSearch', () => {
    it('provides a debounced text ref', () => {
      const { kanaSearch } = useVocabListUrlSync()
      expect(kanaSearch.value).toBe('')
    })
  })

  describe('parseFiltersFromUrl', () => {
    it('parses empty URL', () => {
      const { parseFiltersFromUrl } = useVocabListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters).toEqual({})
    })

    it('parses JLPT levels', () => {
      mockQuery.value = { jlpt: 'N5,N4' }
      const { parseFiltersFromUrl } = useVocabListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters.jlptLevels).toEqual(['N5', 'N4'])
    })

    it('parses common filter', () => {
      mockQuery.value = { common: 'true' }
      const { parseFiltersFromUrl } = useVocabListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters.isCommon).toBe(true)
    })

    it('parses kanji IDs', () => {
      mockQuery.value = { kanji: '5,7' }
      const { parseFiltersFromUrl } = useVocabListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters.containsKanjiIds).toEqual([5, 7])
    })

    it('parses description filter', () => {
      mockQuery.value = { description: 'filled' }
      const { parseFiltersFromUrl } = useVocabListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters.descriptionFilled).toBe('filled')
    })
  })

  describe('updateQueryParam', () => {
    it('updates URL with string value', () => {
      const { updateQueryParam } = useVocabListUrlSync()
      updateQueryParam('search', 'test')

      expect(mockReplace).toHaveBeenCalled()
      const calls = mockReplace.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const callArg = calls[0]![0] as { query: unknown }
      expect(callArg.query).toMatchObject({ search: 'test' })
    })

    it('updates URL with array value', () => {
      const { updateQueryParam } = useVocabListUrlSync()
      updateQueryParam('jlpt', ['N5', 'N4'])

      expect(mockReplace).toHaveBeenCalled()
      const calls = mockReplace.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      const callArg = calls[0]![0] as { query: unknown }
      expect(callArg.query).toMatchObject({ jlpt: 'N5,N4' })
    })
  })

  describe('clearQueryParams', () => {
    it('clears all params', () => {
      mockQuery.value = { jlpt: 'N5', common: 'true' }
      const { clearQueryParams } = useVocabListUrlSync()
      clearQueryParams()

      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })
})
