/**
 * useVocabularyFilters Composable
 *
 * Manages filter state for the vocabulary list page with URL query param sync.
 * Provides reactive filters derived from URL and methods to update them.
 */

import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDebounce } from '@/legacy/base/composables/use-debounce'

import type {
  JlptLevel,
  VocabularyFilters
} from '@/legacy/shared/types/database-types'
import type { ComputedRef, Ref } from 'vue'

// =============================================================================
// URL Parsing Helpers
// =============================================================================

function parseString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) {
    return value
  }
  return undefined
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'string') {
    const num = parseInt(value, 10)
    if (!isNaN(num)) {
      return num
    }
  }
  return undefined
}

function parseBoolean(value: unknown): boolean | undefined {
  if (typeof value === 'string') {
    if (value === 'true' || value === '1') {
      return true
    }
    if (value === 'false' || value === '0') {
      return false
    }
  }
  return undefined
}

function parseJlptLevels(value: unknown): JlptLevel[] | undefined {
  if (typeof value === 'string' && value.length > 0) {
    const validLevels: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt']
    const levels = value
      .split(',')
      .filter((v): v is JlptLevel => validLevels.includes(v as JlptLevel))
    return levels.length > 0 ? levels : undefined
  }
  return undefined
}

// =============================================================================
// Composable
// =============================================================================

export interface UseVocabularyFilters {
  /** Current filter state derived from URL */
  filters: ComputedRef<VocabularyFilters>
  /** Search text with debounce (for input binding) */
  searchText: Ref<string>
  /** Update a single filter value (pushes to URL) */
  updateFilter: (key: keyof VocabularyFilters, value: unknown) => void
  /** Clear all filters (resets URL query params) */
  clearFilters: () => void
  /** Whether any filters are currently active */
  hasActiveFilters: ComputedRef<boolean>
}

export function useVocabularyFilters(): UseVocabularyFilters {
  const route = useRoute()
  const router = useRouter()

  // Debounced search text (150ms default)
  const searchText = useDebounce('', 150)

  // Parse filters from URL query params
  const filters = computed<VocabularyFilters>(() => {
    const result: VocabularyFilters = {}

    const search = searchText.value
    if (search) {
      result.searchText = search
    }

    const jlpt = parseJlptLevels(route.query['jlpt'])
    if (jlpt) {
      result.jlptLevels = jlpt
    }

    const isCommon = parseBoolean(route.query['common'])
    if (isCommon !== undefined) {
      result.isCommon = isCommon
    }

    const containsKanjiId = parseNumber(route.query['kanji'])
    if (containsKanjiId !== undefined) {
      result.containsKanjiId = containsKanjiId
    }

    return result
  })

  // Sync search text from URL on route change
  watch(
    () => route.query['search'],
    (newValue) => {
      const parsed = parseString(newValue)
      // Only update if different to avoid loops
      if (parsed !== searchText.value) {
        // Directly set internal value to avoid debounce on URL sync
        searchText.value = parsed ?? ''
      }
    },
    { immediate: true }
  )

  // Sync debounced search text to URL
  watch(searchText, (newValue) => {
    const currentUrlValue = parseString(route.query['search'])
    if (newValue !== currentUrlValue) {
      updateQueryParam('search', newValue || undefined)
    }
  })

  // Update a single query param in the URL
  function updateQueryParam(key: string, value: unknown): void {
    const query: Record<string, string> = {}

    // Copy existing query params
    for (const [k, v] of Object.entries(route.query)) {
      if (typeof v === 'string') {
        query[k] = v
      }
    }

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      // Remove the key by not including it
      const { [key]: _, ...rest } = query
      void router.replace({ query: rest })
    } else if (Array.isArray(value)) {
      query[key] = value.join(',')
      void router.replace({ query })
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      query[key] = String(value)
      void router.replace({ query })
    }
  }

  // Map filter keys to URL query param keys
  const filterKeyToQueryKey: Record<keyof VocabularyFilters, string> = {
    searchText: 'search',
    jlptLevels: 'jlpt',
    isCommon: 'common',
    containsKanjiId: 'kanji'
  }

  // Update a specific filter
  function updateFilter(key: keyof VocabularyFilters, value: unknown): void {
    const queryKey = filterKeyToQueryKey[key]

    // Handle search text specially (goes through debounce)
    if (key === 'searchText') {
      searchText.value = typeof value === 'string' ? value : ''
      return
    }

    updateQueryParam(queryKey, value)
  }

  // Clear all filters
  function clearFilters(): void {
    searchText.value = ''
    void router.replace({ query: {} })
  }

  // Check if any filters are active
  const hasActiveFilters = computed<boolean>(() => {
    const f = filters.value
    return Boolean(
      f.searchText ??
      (f.jlptLevels && f.jlptLevels.length > 0) ??
      f.isCommon ??
      f.containsKanjiId
    )
  })

  return {
    clearFilters,
    filters,
    hasActiveFilters,
    searchText,
    updateFilter
  }
}
