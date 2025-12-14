/**
 * useComponentFilters Composable
 *
 * Manages filter state for the component list page with URL query param sync.
 * Provides reactive filters derived from URL and methods to update them.
 */

import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDebounce } from '@/base/composables/use-debounce'

import type { ComponentFilters } from '@/shared/types/database-types'
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

// =============================================================================
// Composable
// =============================================================================

export interface UseComponentFilters {
  /** Current filter state derived from URL */
  filters: ComputedRef<ComponentFilters>
  /** Character search with debounce (for input binding) */
  characterSearch: Ref<string>
  /** Update a single filter value (pushes to URL) */
  updateFilter: (key: keyof ComponentFilters, value: unknown) => void
  /** Clear all filters (resets URL query params) */
  clearFilters: () => void
  /** Whether any filters are currently active */
  hasActiveFilters: ComputedRef<boolean>
}

export function useComponentFilters(): UseComponentFilters {
  const route = useRoute()
  const router = useRouter()

  // Debounced character search (150ms default)
  const characterSearch = useDebounce('', 150)

  // Parse filters from URL query params
  const filters = computed<ComponentFilters>(() => {
    const result: ComponentFilters = {}

    const char = characterSearch.value
    if (char) {
      result.character = char
    }

    const strokeMin = parseNumber(route.query['strokeMin'])
    if (strokeMin !== undefined) {
      result.strokeCountMin = strokeMin
    }

    const strokeMax = parseNumber(route.query['strokeMax'])
    if (strokeMax !== undefined) {
      result.strokeCountMax = strokeMax
    }

    const sourceKanjiId = parseNumber(route.query['sourceKanji'])
    if (sourceKanjiId !== undefined) {
      result.sourceKanjiId = sourceKanjiId
    }

    return result
  })

  // Sync character search from URL on route change
  watch(
    () => route.query['character'],
    (newValue) => {
      const parsed = parseString(newValue)
      // Only update if different to avoid loops
      if (parsed !== characterSearch.value) {
        // Directly set internal value to avoid debounce on URL sync
        characterSearch.value = parsed ?? ''
      }
    },
    { immediate: true }
  )

  // Sync debounced character search to URL
  watch(characterSearch, (newValue) => {
    const currentUrlValue = parseString(route.query['character'])
    if (newValue !== currentUrlValue) {
      updateQueryParam('character', newValue || undefined)
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
    } else if (typeof value === 'string' || typeof value === 'number') {
      query[key] = String(value)
      void router.replace({ query })
    }
  }

  // Map filter keys to URL query param keys
  const filterKeyToQueryKey: Record<keyof ComponentFilters, string> = {
    character: 'character',
    strokeCountMin: 'strokeMin',
    strokeCountMax: 'strokeMax',
    sourceKanjiId: 'sourceKanji'
  }

  // Update a specific filter
  function updateFilter(key: keyof ComponentFilters, value: unknown): void {
    const queryKey = filterKeyToQueryKey[key]

    // Handle character search specially (goes through debounce)
    if (key === 'character') {
      characterSearch.value = typeof value === 'string' ? value : ''
      return
    }

    updateQueryParam(queryKey, value)
  }

  // Clear all filters
  function clearFilters(): void {
    characterSearch.value = ''
    void router.replace({ query: {} })
  }

  // Check if any filters are active
  const hasActiveFilters = computed<boolean>(() => {
    const f = filters.value
    return Boolean(
      f.character ?? f.strokeCountMin ?? f.strokeCountMax ?? f.sourceKanjiId
    )
  })

  return {
    filters,
    characterSearch,
    updateFilter,
    clearFilters,
    hasActiveFilters
  }
}
