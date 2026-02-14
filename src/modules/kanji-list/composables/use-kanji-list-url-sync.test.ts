/**
 * Kanji List URL Sync Tests
 *
 * Tests for URL synchronization composable.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { nextTick, ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiListUrlSync } from './use-kanji-list-url-sync'
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
describe('useKanjiListUrlSync', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockQuery.value = {}
    mockReplace.mockClear()
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
  describe('parseFiltersFromUrl', () => {
    it('returns empty filters when no query params', () => {
      const { parseFiltersFromUrl } = useKanjiListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters).toEqual({})
    })
    it('parses stroke filters from URL', () => {
      mockQuery.value = { strokeMin: '5', strokeMax: '10' }
      const { parseFiltersFromUrl } = useKanjiListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters.strokeCountMin).toBe(5)
      expect(filters.strokeCountMax).toBe(10)
    })
    it('parses JLPT levels from URL', () => {
      mockQuery.value = { jlpt: 'N5,N4' }
      const { parseFiltersFromUrl } = useKanjiListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters.jlptLevels).toEqual(['N5', 'N4'])
    })
    it('parses component IDs from URL', () => {
      mockQuery.value = { components: '1,2,3' }
      const { parseFiltersFromUrl } = useKanjiListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters.componentIds).toEqual([1, 2, 3])
    })
  })
  describe('characterSearch', () => {
    it('initializes from URL after debounce', () => {
      mockQuery.value = { character: '山' }
      const { characterSearch } = useKanjiListUrlSync()
      vi.advanceTimersByTime(150)
      expect(characterSearch.value).toBe('山')
    })
    it('updates URL when character search changes', async () => {
      const { characterSearch } = useKanjiListUrlSync()
      characterSearch.value = '川'
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()
      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ character: '川' })
      })
    })
  })
  describe('updateQueryParam', () => {
    it('updates URL with string value', async () => {
      const urlSync = useKanjiListUrlSync()
      urlSync.updateQueryParam('strokeMin', '5')
      await nextTick()
      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ strokeMin: '5' })
      })
    })
    it('updates URL with array value (comma-separated)', async () => {
      const urlSync = useKanjiListUrlSync()
      urlSync.updateQueryParam('components', [1, 2, 3])
      await nextTick()
      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ components: '1,2,3' })
      })
    })
    it('removes param when value is undefined', async () => {
      mockQuery.value = { strokeMin: '5', strokeMax: '10' }
      const urlSync = useKanjiListUrlSync()
      urlSync.updateQueryParam('strokeMin', undefined)
      await nextTick()
      expect(mockReplace).toHaveBeenCalledWith({
        query: { strokeMax: '10' }
      })
    })
    it('removes param when value is empty string', async () => {
      mockQuery.value = { strokeMin: '5' }
      const urlSync = useKanjiListUrlSync()
      urlSync.updateQueryParam('strokeMin', '')
      await nextTick()
      expect(mockReplace).toHaveBeenCalledWith({
        query: {}
      })
    })
    it('removes param when value is empty array', async () => {
      mockQuery.value = { components: '1,2,3' }
      const urlSync = useKanjiListUrlSync()
      urlSync.updateQueryParam('components', [])
      await nextTick()
      expect(mockReplace).toHaveBeenCalledWith({
        query: {}
      })
    })
  })
  describe('clearQueryParams', () => {
    it('sets text search refs to empty string', async () => {
      const { characterSearch, clearQueryParams, keywordsSearch } =
        useKanjiListUrlSync()
      // Clear should set to empty (debounce delay applies)
      clearQueryParams()
      vi.advanceTimersByTime(150)
      await nextTick()
      // After debounce, values should be cleared
      expect(characterSearch.value).toBe('')
      expect(keywordsSearch.value).toBe('')
    })
    it('replaces URL with empty query', async () => {
      mockQuery.value = { strokeMin: '5', jlpt: 'N5' }
      const { clearQueryParams } = useKanjiListUrlSync()
      clearQueryParams()
      await nextTick()
      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })
})
