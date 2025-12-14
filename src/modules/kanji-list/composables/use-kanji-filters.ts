/**
 * useKanjiFilters Composable
 *
 * Manages filter state for the kanji list page with URL query param sync.
 * Provides reactive filters derived from URL and methods to update them.
 */

import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDebounce } from '@/base/composables/use-debounce'

import type {
  JlptLevel,
  JoyoLevel,
  KanjiFilters
} from '@/shared/types/database-types'
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

function parseJoyoLevels(value: unknown): JoyoLevel[] | undefined {
  if (typeof value === 'string' && value.length > 0) {
    const validLevels: JoyoLevel[] = [
      'elementary1',
      'elementary2',
      'elementary3',
      'elementary4',
      'elementary5',
      'elementary6',
      'secondary',
      'non-joyo'
    ]
    const levels = value
      .split(',')
      .filter((v): v is JoyoLevel => validLevels.includes(v as JoyoLevel))
    return levels.length > 0 ? levels : undefined
  }
  return undefined
}

function parseKenteiLevels(value: unknown): string[] | undefined {
  if (typeof value === 'string' && value.length > 0) {
    const validLevels = [
      '10級',
      '9級',
      '8級',
      '7級',
      '6級',
      '5級',
      '4級',
      '3級',
      '準2級',
      '2級',
      '準1級',
      '1級'
    ]
    const levels = value.split(',').filter((v) => validLevels.includes(v))
    return levels.length > 0 ? levels : undefined
  }
  return undefined
}

// =============================================================================
// Composable
// =============================================================================

export interface UseKanjiFilters {
  /** Current filter state derived from URL */
  filters: ComputedRef<KanjiFilters>
  /** Character search with debounce (for input binding) */
  characterSearch: Ref<string>
  /** Search keywords with debounce (for input binding) */
  searchKeywords: Ref<string>
  /** Update a single filter value (pushes to URL) */
  updateFilter: (key: keyof KanjiFilters, value: unknown) => void
  /** Clear all filters (resets URL query params) */
  clearFilters: () => void
  /** Whether any filters are currently active */
  hasActiveFilters: ComputedRef<boolean>
}

export function useKanjiFilters(): UseKanjiFilters {
  const route = useRoute()
  const router = useRouter()

  // Debounced character search (150ms default)
  const characterSearch = useDebounce('', 150)
  // Debounced search keywords (150ms default)
  const searchKeywords = useDebounce('', 150)

  // Parse filters from URL query params
  const filters = computed<KanjiFilters>(() => {
    const result: KanjiFilters = {}

    const char = characterSearch.value
    if (char) {
      result.character = char
    }

    const keywords = searchKeywords.value
    if (keywords) {
      result.searchKeywords = keywords
    }

    const strokeMin = parseNumber(route.query['strokeMin'])
    if (strokeMin !== undefined) {
      result.strokeCountMin = strokeMin
    }

    const strokeMax = parseNumber(route.query['strokeMax'])
    if (strokeMax !== undefined) {
      result.strokeCountMax = strokeMax
    }

    const jlpt = parseJlptLevels(route.query['jlpt'])
    if (jlpt) {
      result.jlptLevels = jlpt
    }

    const joyo = parseJoyoLevels(route.query['joyo'])
    if (joyo) {
      result.joyoLevels = joyo
    }

    const kentei = parseKenteiLevels(route.query['kentei'])
    if (kentei) {
      result.kenteiLevels = kentei
    }

    const radicalId = parseNumber(route.query['radical'])
    if (radicalId !== undefined) {
      result.radicalId = radicalId
    }

    const componentId = parseNumber(route.query['component'])
    if (componentId !== undefined) {
      result.componentId = componentId
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

  // Sync search keywords from URL on route change
  watch(
    () => route.query['keywords'],
    (newValue) => {
      const parsed = parseString(newValue)
      // Only update if different to avoid loops
      if (parsed !== searchKeywords.value) {
        // Directly set internal value to avoid debounce on URL sync
        searchKeywords.value = parsed ?? ''
      }
    },
    { immediate: true }
  )

  // Sync debounced search keywords to URL
  watch(searchKeywords, (newValue) => {
    const currentUrlValue = parseString(route.query['keywords'])
    if (newValue !== currentUrlValue) {
      updateQueryParam('keywords', newValue || undefined)
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
    } else if (typeof value === 'string' || typeof value === 'number') {
      query[key] = String(value)
      void router.replace({ query })
    }
  }

  // Map filter keys to URL query param keys
  const filterKeyToQueryKey: Record<keyof KanjiFilters, string> = {
    character: 'character',
    searchKeywords: 'keywords',
    strokeCountMin: 'strokeMin',
    strokeCountMax: 'strokeMax',
    jlptLevels: 'jlpt',
    joyoLevels: 'joyo',
    kenteiLevels: 'kentei',
    radicalId: 'radical',
    componentId: 'component'
  }

  // Update a specific filter
  function updateFilter(key: keyof KanjiFilters, value: unknown): void {
    const queryKey = filterKeyToQueryKey[key]

    // Handle character search specially (goes through debounce)
    if (key === 'character') {
      characterSearch.value = typeof value === 'string' ? value : ''
      return
    }

    // Handle search keywords specially (goes through debounce)
    if (key === 'searchKeywords') {
      searchKeywords.value = typeof value === 'string' ? value : ''
      return
    }

    updateQueryParam(queryKey, value)
  }

  // Clear all filters
  function clearFilters(): void {
    characterSearch.value = ''
    searchKeywords.value = ''
    void router.replace({ query: {} })
  }

  // Check if any filters are active
  const hasActiveFilters = computed<boolean>(() => {
    const f = filters.value
    return Boolean(
      f.character ??
      f.searchKeywords ??
      f.strokeCountMin ??
      f.strokeCountMax ??
      (f.jlptLevels && f.jlptLevels.length > 0) ??
      (f.joyoLevels && f.joyoLevels.length > 0) ??
      (f.kenteiLevels && f.kenteiLevels.length > 0) ??
      f.radicalId ??
      f.componentId
    )
  })

  return {
    filters,
    characterSearch,
    searchKeywords,
    updateFilter,
    clearFilters,
    hasActiveFilters
  }
}
