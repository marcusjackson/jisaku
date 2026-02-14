/**
 * Vocab List State Composable
 *
 * Manages filter state for the vocabulary list.
 * Coordinates with URL sync composable.
 *
 * @module modules/vocab-list/composables
 */

import { computed, ref } from 'vue'

import { FILTER_QUERY_KEYS, type VocabListFilters } from '../vocab-list-types'

import {
  type UseVocabListUrlSync,
  useVocabListUrlSync
} from './use-vocab-list-url-sync'

import type { ComputedRef, Ref } from 'vue'

// ============================================================================
// Composable Interface
// ============================================================================

export interface UseVocabListState {
  /** Current filter state derived from URL */
  filters: ComputedRef<VocabListFilters>
  /** Whether any filters are active */
  hasActiveFilters: ComputedRef<boolean>
  /** Count of active filters for badge display */
  activeFilterCount: ComputedRef<number>
  /** Debounced word search (for input binding) */
  wordSearch: Ref<string>
  /** Debounced search text (for input binding) */
  searchText: Ref<string>
  /** Debounced kana search (for input binding) */
  kanaSearch: Ref<string>
  /** Update a filter value */
  updateFilter: <K extends keyof VocabListFilters>(
    key: K,
    value: VocabListFilters[K]
  ) => void
  /** Clear all filters */
  clearFilters: () => void
  /** Trigger for data refresh */
  refreshTrigger: Ref<number>
  /** Increment refresh trigger to force data reload */
  triggerRefresh: () => void
}

// ============================================================================
// Helper Functions
// ============================================================================

function countActiveFilters(f: VocabListFilters): number {
  const checks = [
    !!f.word,
    !!f.search,
    !!f.kana,
    !!f.jlptLevels?.length,
    f.isCommon !== undefined,
    !!f.containsKanjiIds?.length,
    !!f.descriptionFilled
  ]
  return checks.filter(Boolean).length
}

function createFilterUpdater(urlSync: UseVocabListUrlSync) {
  return <K extends keyof VocabListFilters>(
    key: K,
    value: VocabListFilters[K]
  ): void => {
    // Handle debounced text inputs through refs
    if (key === 'word') {
      urlSync.wordSearch.value = typeof value === 'string' ? value : ''
      return
    }
    if (key === 'search') {
      urlSync.searchText.value = typeof value === 'string' ? value : ''
      return
    }
    if (key === 'kana') {
      urlSync.kanaSearch.value = typeof value === 'string' ? value : ''
      return
    }

    // All other filters update URL directly
    const queryKey = FILTER_QUERY_KEYS[key]
    urlSync.updateQueryParam(queryKey, value)
  }
}

// ============================================================================
// Composable Implementation
// ============================================================================

export function useVocabListState(): UseVocabListState {
  const urlSync = useVocabListUrlSync()
  const refreshTrigger = ref(0)

  const filters = computed(() => urlSync.parseFiltersFromUrl())
  const updateFilter = createFilterUpdater(urlSync)
  const clearFilters = (): void => {
    urlSync.clearQueryParams()
  }
  const activeFilterCount = computed(() => countActiveFilters(filters.value))
  const hasActiveFilters = computed(() => activeFilterCount.value > 0)
  const triggerRefresh = (): void => {
    refreshTrigger.value++
  }

  return {
    filters,
    hasActiveFilters,
    activeFilterCount,
    wordSearch: urlSync.wordSearch,
    searchText: urlSync.searchText,
    kanaSearch: urlSync.kanaSearch,
    updateFilter,
    clearFilters,
    refreshTrigger,
    triggerRefresh
  }
}
