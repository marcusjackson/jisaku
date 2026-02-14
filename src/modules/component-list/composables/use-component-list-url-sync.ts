/**
 * Component List URL Sync Composable
 *
 * Handles bidirectional sync between filter state and URL query params.
 * Provides URL parsing, debounced text inputs, and query param updates.
 *
 * @module modules/component-list/composables
 */

import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDebounce } from '@/base/composables'

import {
  type ComponentListFilters,
  FILTER_QUERY_KEYS,
  type PresenceFilterValue
} from '../component-list-types'

import type { Ref } from 'vue'

export interface UseComponentListUrlSync {
  characterSearch: Ref<string>
  keywordsSearch: Ref<string>
  kangxiSearch: Ref<string>
  parseFiltersFromUrl: () => ComponentListFilters
  updateQueryParam: (key: string, value: unknown) => void
  clearQueryParams: () => void
}

/** Parse a string value from query param */
function parseString(value: unknown): string | undefined {
  if (typeof value === 'string' && value !== '') return value
  return undefined
}

/** Parse a number value from query param */
function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'string') {
    const num = parseInt(value, 10)
    if (!isNaN(num)) return num
  }
  return undefined
}

/** Parse a boolean value from query param */
function parseBoolean(value: unknown): boolean | undefined {
  if (value === 'true') return true
  if (value === 'false') return false
  return undefined
}

/** Parse a presence filter value from query param */
function parsePresence(value: unknown): PresenceFilterValue {
  if (value === 'has' || value === 'missing') return value
  return null
}

/**
 * Setup bidirectional sync between URL query param and debounced ref
 */
function setupTextInputSync(
  route: ReturnType<typeof useRoute>,
  queryKey: string,
  ref: Ref<string>,
  updateQueryParam: (key: string, value: unknown) => void
): void {
  watch(
    () => route.query[queryKey],
    (newValue) => {
      const parsed = parseString(newValue) ?? ''
      if (parsed !== ref.value) ref.value = parsed
    },
    { immediate: true }
  )
  watch(ref, (newValue) => {
    const current = parseString(route.query[queryKey])
    if (newValue !== current) updateQueryParam(queryKey, newValue || undefined)
  })
}

/**
 * Create query param updater function
 */
function createQueryParamUpdater(
  route: ReturnType<typeof useRoute>,
  router: ReturnType<typeof useRouter>
) {
  return (key: string, value: unknown): void => {
    const query: Record<string, string> = {}
    for (const [k, v] of Object.entries(route.query)) {
      if (typeof v === 'string' && k !== key) query[k] = v
    }

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      // Key already excluded above
    } else if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      query[key] = String(value)
    }

    void router.replace({ query })
  }
}

/**
 * Setup all text input syncs
 */
function setupAllTextInputSyncs(
  route: ReturnType<typeof useRoute>,
  searches: {
    character: Ref<string>
    keywords: Ref<string>
    kangxi: Ref<string>
  },
  updateQueryParam: (key: string, value: unknown) => void
): void {
  setupTextInputSync(
    route,
    FILTER_QUERY_KEYS.character,
    searches.character,
    updateQueryParam
  )
  setupTextInputSync(
    route,
    FILTER_QUERY_KEYS.searchKeywords,
    searches.keywords,
    updateQueryParam
  )
  setupTextInputSync(
    route,
    FILTER_QUERY_KEYS.kangxiSearch,
    searches.kangxi,
    updateQueryParam
  )
}

/**
 * Parse filters from URL query params
 */
function createParseFiltersFromUrl(
  route: ReturnType<typeof useRoute>,
  searches: {
    character: Ref<string>
    keywords: Ref<string>
    kangxi: Ref<string>
  }
) {
  return (): ComponentListFilters => {
    const q = route.query
    const filters: ComponentListFilters = {}

    // Text search filters
    if (searches.character.value) {
      filters.character = searches.character.value
    }
    if (searches.keywords.value) {
      filters.searchKeywords = searches.keywords.value
    }
    if (searches.kangxi.value) {
      filters.kangxiSearch = searches.kangxi.value
    }

    // Numeric filters
    const strokeMin = parseNumber(q[FILTER_QUERY_KEYS.strokeCountMin])
    const strokeMax = parseNumber(q[FILTER_QUERY_KEYS.strokeCountMax])
    if (strokeMin !== undefined) filters.strokeCountMin = strokeMin
    if (strokeMax !== undefined) filters.strokeCountMax = strokeMax

    // Boolean filter
    const canBeRadical = parseBoolean(q[FILTER_QUERY_KEYS.canBeRadical])
    if (canBeRadical !== undefined) filters.canBeRadical = canBeRadical

    // Presence filters
    const descPres = parsePresence(q[FILTER_QUERY_KEYS.descriptionPresence])
    const formsPres = parsePresence(q[FILTER_QUERY_KEYS.formsPresence])
    const groupPres = parsePresence(q[FILTER_QUERY_KEYS.groupingsPresence])
    if (descPres !== null) filters.descriptionPresence = descPres
    if (formsPres !== null) filters.formsPresence = formsPres
    if (groupPres !== null) filters.groupingsPresence = groupPres

    return filters
  }
}

export function useComponentListUrlSync(): UseComponentListUrlSync {
  const route = useRoute()
  const router = useRouter()

  const searches = {
    character: useDebounce('', 150),
    keywords: useDebounce('', 150),
    kangxi: useDebounce('', 150)
  }

  const updateQueryParam = createQueryParamUpdater(route, router)
  setupAllTextInputSyncs(route, searches, updateQueryParam)

  const clearQueryParams = (): void => {
    searches.character.value = ''
    searches.keywords.value = ''
    searches.kangxi.value = ''
    void router.replace({ query: {} })
  }

  return {
    characterSearch: searches.character,
    keywordsSearch: searches.keywords,
    kangxiSearch: searches.kangxi,
    parseFiltersFromUrl: createParseFiltersFromUrl(route, searches),
    updateQueryParam,
    clearQueryParams
  }
}
