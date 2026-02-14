/**
 * Component List State Composable
 *
 * Manages filter state for the component list.
 * Coordinates with URL sync composable.
 *
 * @module modules/component-list/composables
 */

import { computed, ref } from 'vue'

import {
  type ComponentListFilters,
  FILTER_QUERY_KEYS
} from '../component-list-types'

import {
  type UseComponentListUrlSync,
  useComponentListUrlSync
} from './use-component-list-url-sync'

import type { ComputedRef, Ref } from 'vue'

// ============================================================================
// Composable Interface
// ============================================================================

export interface UseComponentListState {
  /** Current filter state derived from URL */
  filters: ComputedRef<ComponentListFilters>
  /** Whether any filters are active */
  hasActiveFilters: ComputedRef<boolean>
  /** Count of active filters for badge display */
  activeFilterCount: ComputedRef<number>
  /** Debounced character search (for input binding) */
  characterSearch: Ref<string>
  /** Debounced keywords search (for input binding) */
  keywordsSearch: Ref<string>
  /** Debounced kangxi search (for input binding) */
  kangxiSearch: Ref<string>
  /** Update a filter value */
  updateFilter: <K extends keyof ComponentListFilters>(
    key: K,
    value: ComponentListFilters[K]
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
function countActiveFilters(f: ComponentListFilters): number {
  const checks = [
    !!f.character,
    !!f.searchKeywords,
    !!f.kangxiSearch,
    f.strokeCountMin !== undefined,
    f.strokeCountMax !== undefined,
    f.canBeRadical !== undefined,
    !!f.descriptionPresence,
    !!f.formsPresence,
    !!f.groupingsPresence
  ]
  return checks.filter(Boolean).length
}

/**
 * Create filter update handler function
 */
function createFilterUpdater(urlSync: UseComponentListUrlSync) {
  return <K extends keyof ComponentListFilters>(
    key: K,
    value: ComponentListFilters[K]
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
    if (key === 'kangxiSearch') {
      urlSync.kangxiSearch.value = typeof value === 'string' ? value : ''
      return
    }

    // All other filters update URL directly
    const queryKey = FILTER_QUERY_KEYS[key]
    urlSync.updateQueryParam(queryKey, value)
  }
}

export function useComponentListState(): UseComponentListState {
  const urlSync = useComponentListUrlSync()
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
    kangxiSearch: urlSync.kangxiSearch,
    updateFilter,
    clearFilters,
    refreshTrigger,
    triggerRefresh
  }
}
