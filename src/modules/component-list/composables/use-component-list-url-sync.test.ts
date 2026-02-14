/**
 * Component List URL Sync Tests
 *
 * Tests for URL synchronization composable.
 */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { nextTick, ref } from 'vue'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useComponentListUrlSync } from './use-component-list-url-sync'

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

describe('useComponentListUrlSync', () => {
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
      const { parseFiltersFromUrl } = useComponentListUrlSync()
      const filters = parseFiltersFromUrl()
      expect(filters).toEqual({})
    })

    it('parses stroke filters from URL', () => {
      mockQuery.value = { strokeMin: '5', strokeMax: '10' }
      const { parseFiltersFromUrl } = useComponentListUrlSync()
      const filters = parseFiltersFromUrl()

      expect(filters.strokeCountMin).toBe(5)
      expect(filters.strokeCountMax).toBe(10)
    })

    it('parses canBeRadical from URL', () => {
      mockQuery.value = { radical: 'true' }
      const { parseFiltersFromUrl } = useComponentListUrlSync()
      const filters = parseFiltersFromUrl()

      expect(filters.canBeRadical).toBe(true)
    })

    it('parses presence filters from URL', () => {
      mockQuery.value = {
        description: 'has',
        forms: 'missing',
        groupings: 'has'
      }
      const { parseFiltersFromUrl } = useComponentListUrlSync()
      const filters = parseFiltersFromUrl()

      expect(filters.descriptionPresence).toBe('has')
      expect(filters.formsPresence).toBe('missing')
      expect(filters.groupingsPresence).toBe('has')
    })
  })

  describe('characterSearch', () => {
    it('initializes from URL after debounce', () => {
      mockQuery.value = { character: '一' }
      const { characterSearch } = useComponentListUrlSync()

      vi.advanceTimersByTime(150)

      expect(characterSearch.value).toBe('一')
    })

    it('updates URL when character search changes', async () => {
      const { characterSearch } = useComponentListUrlSync()

      characterSearch.value = '丨'
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ character: '丨' })
      })
    })
  })

  describe('keywordsSearch', () => {
    it('initializes from URL after debounce', () => {
      mockQuery.value = { keywords: 'one' }
      const { keywordsSearch } = useComponentListUrlSync()

      vi.advanceTimersByTime(150)

      expect(keywordsSearch.value).toBe('one')
    })

    it('updates URL when keywords search changes', async () => {
      const { keywordsSearch } = useComponentListUrlSync()

      keywordsSearch.value = 'line'
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ keywords: 'line' })
      })
    })
  })

  describe('kangxiSearch', () => {
    it('initializes from URL after debounce', () => {
      mockQuery.value = { kangxi: '1' }
      const { kangxiSearch } = useComponentListUrlSync()

      vi.advanceTimersByTime(150)

      expect(kangxiSearch.value).toBe('1')
    })

    it('updates URL when kangxi search changes', async () => {
      const { kangxiSearch } = useComponentListUrlSync()

      kangxiSearch.value = '2'
      await nextTick()
      vi.advanceTimersByTime(150)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ kangxi: '2' })
      })
    })
  })

  describe('updateQueryParam', () => {
    it('updates URL with string value', async () => {
      const urlSync = useComponentListUrlSync()

      urlSync.updateQueryParam('strokeMin', '5')
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ strokeMin: '5' })
      })
    })

    it('updates URL with boolean value', async () => {
      const urlSync = useComponentListUrlSync()

      urlSync.updateQueryParam('canBeRadical', true)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: expect.objectContaining({ canBeRadical: 'true' })
      })
    })

    it('removes param when value is undefined', async () => {
      mockQuery.value = { strokeMin: '5', strokeMax: '10' }
      const urlSync = useComponentListUrlSync()

      urlSync.updateQueryParam('strokeMin', undefined)
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: { strokeMax: '10' }
      })
    })

    it('removes param when value is empty string', async () => {
      mockQuery.value = { strokeMin: '5' }
      const urlSync = useComponentListUrlSync()

      urlSync.updateQueryParam('strokeMin', '')
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: {}
      })
    })

    it('removes param when value is empty array', async () => {
      mockQuery.value = { components: '1,2,3' }
      const urlSync = useComponentListUrlSync()

      urlSync.updateQueryParam('components', [])
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({
        query: {}
      })
    })
  })

  describe('clearQueryParams', () => {
    it('sets text search refs to empty string', async () => {
      const {
        characterSearch,
        clearQueryParams,
        kangxiSearch,
        keywordsSearch
      } = useComponentListUrlSync()

      // Clear should set to empty (debounce delay applies)
      clearQueryParams()
      vi.advanceTimersByTime(150)
      await nextTick()

      // After debounce, values should be cleared
      expect(characterSearch.value).toBe('')
      expect(keywordsSearch.value).toBe('')
      expect(kangxiSearch.value).toBe('')
    })

    it('replaces URL with empty query', async () => {
      mockQuery.value = { strokeMin: '5', canBeRadical: 'true' }
      const { clearQueryParams } = useComponentListUrlSync()

      clearQueryParams()
      await nextTick()

      expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })
  })
})
