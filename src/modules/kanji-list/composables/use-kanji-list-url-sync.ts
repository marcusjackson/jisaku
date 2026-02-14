/**
 * Kanji List URL Sync Composable
 *
 * Handles bidirectional sync between filter state and URL query params.
 * Provides URL parsing, debounced text inputs, and query param updates.
 *
 * @module modules/kanji-list/composables
 */

import { watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useDebounce } from '@/base/composables'

import { FILTER_QUERY_KEYS, type KanjiListFilters } from '../kanji-list-types'

import { parseString } from './url-parsers'
import {
  parseAnalysisFiltersFromQuery,
  parseLevelFiltersFromQuery,
  parseNumericFiltersFromQuery,
  parseRelationalFiltersFromQuery,
  parseStrokeFiltersFromQuery,
  parseTextFiltersFromRefs
} from './use-kanji-list-url-sync-parsers'

import type { Ref } from 'vue'

export interface UseKanjiListUrlSync {
  characterSearch: Ref<string>
  keywordsSearch: Ref<string>
  meaningsSearch: Ref<string>
  onYomiSearch: Ref<string>
  kunYomiSearch: Ref<string>
  parseFiltersFromUrl: () => KanjiListFilters
  updateQueryParam: (key: string, value: unknown) => void
  clearQueryParams: () => void
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
    } else if (Array.isArray(value)) {
      query[key] = value.join(',')
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
 * Setup all text input sync watchers
 */
function setupAllTextInputSyncs(
  route: ReturnType<typeof useRoute>,
  searches: {
    character: Ref<string>
    keywords: Ref<string>
    meanings: Ref<string>
    onYomi: Ref<string>
    kunYomi: Ref<string>
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
    FILTER_QUERY_KEYS.meanings,
    searches.meanings,
    updateQueryParam
  )
  setupTextInputSync(
    route,
    FILTER_QUERY_KEYS.onYomi,
    searches.onYomi,
    updateQueryParam
  )
  setupTextInputSync(
    route,
    FILTER_QUERY_KEYS.kunYomi,
    searches.kunYomi,
    updateQueryParam
  )
}

/**
 * Create all debounced search refs
 */
function createSearchRefs() {
  return {
    character: useDebounce('', 150),
    keywords: useDebounce('', 150),
    meanings: useDebounce('', 150),
    onYomi: useDebounce('', 150),
    kunYomi: useDebounce('', 150)
  }
}

export function useKanjiListUrlSync(): UseKanjiListUrlSync {
  const route = useRoute()
  const router = useRouter()

  const searches = createSearchRefs()
  const updateQueryParam = createQueryParamUpdater(route, router)

  // Setup all text input syncs
  setupAllTextInputSyncs(route, searches, updateQueryParam)

  const parseFiltersFromUrl = (): KanjiListFilters => ({
    ...parseTextFiltersFromRefs(
      searches.character,
      searches.keywords,
      searches.meanings,
      searches.onYomi,
      searches.kunYomi
    ),
    ...parseNumericFiltersFromQuery(route.query),
    ...parseLevelFiltersFromQuery(route.query),
    ...parseRelationalFiltersFromQuery(route.query),
    ...parseStrokeFiltersFromQuery(route.query),
    ...parseAnalysisFiltersFromQuery(route.query)
  })

  const clearQueryParams = (): void => {
    searches.character.value = ''
    searches.keywords.value = ''
    searches.meanings.value = ''
    searches.onYomi.value = ''
    searches.kunYomi.value = ''
    void router.replace({ query: {} })
  }

  return {
    characterSearch: searches.character,
    keywordsSearch: searches.keywords,
    meaningsSearch: searches.meanings,
    onYomiSearch: searches.onYomi,
    kunYomiSearch: searches.kunYomi,
    parseFiltersFromUrl,
    updateQueryParam,
    clearQueryParams
  }
}
