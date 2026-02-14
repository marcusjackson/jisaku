/**
 * Kanji List State Composable
 *
 * Manages filter state and data fetching for the kanji list.
 * Coordinates with URL sync composable and kanji repository.
 *
 * @module modules/kanji-list/composables
 */

import { computed, ref } from 'vue'

import {
  type AnalysisFieldFilter,
  FILTER_QUERY_KEYS,
  type KanjiListFilters
} from '../kanji-list-types'

import {
  type UseKanjiListUrlSync,
  useKanjiListUrlSync
} from './use-kanji-list-url-sync'

import type { ComputedRef, Ref } from 'vue'

// ============================================================================
// Composable Interface
// ============================================================================

export interface UseKanjiListState {
  /** Current filter state derived from URL */
  filters: ComputedRef<KanjiListFilters>
  /** Whether any filters are active */
  hasActiveFilters: ComputedRef<boolean>
  /** Count of active filters for badge display */
  activeFilterCount: ComputedRef<number>
  /** Debounced character search (for input binding) */
  characterSearch: Ref<string>
  /** Debounced keywords search (for input binding) */
  keywordsSearch: Ref<string>
  /** Debounced meanings search (for input binding) */
  meaningsSearch: Ref<string>
  /** Debounced on-yomi search (for input binding) */
  onYomiSearch: Ref<string>
  /** Debounced kun-yomi search (for input binding) */
  kunYomiSearch: Ref<string>
  /** Update a filter value */
  updateFilter: <K extends keyof KanjiListFilters>(
    key: K,
    value: KanjiListFilters[K]
  ) => void
  /** Clear all filters */
  clearFilters: () => void
  /** Trigger for data refresh */
  refreshTrigger: Ref<number>
  /** Increment refresh trigger to force data reload */
  triggerRefresh: () => void
}

// ============================================================================
// Composable Implementation
// ============================================================================

/**
 * Count how many filters are currently active
 */
function countActiveFilters(f: KanjiListFilters): number {
  const checks = [
    !!f.character,
    !!f.searchKeywords,
    !!f.meanings,
    !!f.onYomi,
    !!f.kunYomi,
    f.strokeCountMin !== undefined,
    f.strokeCountMax !== undefined,
    !!f.jlptLevels?.length,
    !!f.joyoLevels?.length,
    !!f.kenteiLevels?.length,
    !!f.radicalId,
    !!f.componentIds?.length,
    !!f.classificationTypeIds?.length,
    !!f.strokeOrderDiagram,
    !!f.strokeOrderAnimation,
    !!f.analysisFilters?.length
  ]
  return checks.filter(Boolean).length
}

/**
 * Create filter update handler function
 */
function createFilterUpdater(urlSync: UseKanjiListUrlSync) {
  return <K extends keyof KanjiListFilters>(
    key: K,
    value: KanjiListFilters[K]
  ): void => {
    // Handle debounced text inputs through refs
    if (key === 'character') {
      urlSync.characterSearch.value = typeof value === 'string' ? value : ''
      return
    }
    if (key === 'searchKeywords') {
      urlSync.keywordsSearch.value = typeof value === 'string' ? value : ''
      return
    }
    if (key === 'meanings') {
      urlSync.meaningsSearch.value = typeof value === 'string' ? value : ''
      return
    }
    if (key === 'onYomi') {
      urlSync.onYomiSearch.value = typeof value === 'string' ? value : ''
      return
    }
    if (key === 'kunYomi') {
      urlSync.kunYomiSearch.value = typeof value === 'string' ? value : ''
      return
    }

    // Handle analysis filters specially (serialize to string)
    if (key === 'analysisFilters' && Array.isArray(value)) {
      const analysisFilters = value as AnalysisFieldFilter[]
      const serialized = analysisFilters
        .map((f) => `${f.field}:${f.threshold}`)
        .join(',')
      urlSync.updateQueryParam(
        FILTER_QUERY_KEYS.analysisFilters,
        serialized || undefined
      )
      return
    }

    // All other filters update URL directly
    const queryKey = FILTER_QUERY_KEYS[key]
    urlSync.updateQueryParam(queryKey, value)
  }
}

export function useKanjiListState(): UseKanjiListState {
  const urlSync = useKanjiListUrlSync()
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
    characterSearch: urlSync.characterSearch,
    keywordsSearch: urlSync.keywordsSearch,
    meaningsSearch: urlSync.meaningsSearch,
    onYomiSearch: urlSync.onYomiSearch,
    kunYomiSearch: urlSync.kunYomiSearch,
    updateFilter,
    clearFilters,
    refreshTrigger,
    triggerRefresh
  }
}
