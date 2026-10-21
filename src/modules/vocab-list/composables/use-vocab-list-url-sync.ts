/**
 * Vocab List URL Sync Composable
 *
 * Handles bidirectional sync between filter state and URL query params.
 * Provides URL parsing, debounced text inputs, and query param updates.
 *
 * @module modules/vocab-list/composables
 */

import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useDebounce } from '@/base/composables';

import {
  parseBoolean,
  parseDescriptionFilter,
  parseJlptLevels,
  parseKanjiIds,
  parseString,
} from '../utils/url-parsers';
import { FILTER_QUERY_KEYS, type VocabListFilters } from '../vocab-list-types';

import type { Ref } from 'vue';

export interface UseVocabListUrlSyncReturn {
  wordSearch: Ref<string>;
  searchText: Ref<string>;
  kanaSearch: Ref<string>;
  parseFiltersFromUrl: () => VocabListFilters;
  updateQueryParam: (key: string, value: unknown) => void;
  clearQueryParams: () => void;
}

// ============================================================================
// Sync Helpers
// ============================================================================

function setupTextInputSync(
  route: ReturnType<typeof useRoute>,
  queryKey: string,
  ref: Ref<string>,
  updateQueryParam: (key: string, value: unknown) => void
): void {
  watch(
    () => route.query[queryKey],
    (newValue) => {
      const parsed = parseString(newValue) ?? '';
      if (parsed !== ref.value) ref.value = parsed;
    },
    { immediate: true }
  );
  watch(ref, (newValue) => {
    const current = parseString(route.query[queryKey]);
    if (newValue !== current) updateQueryParam(queryKey, newValue || undefined);
  });
}

function createQueryParamUpdater(
  route: ReturnType<typeof useRoute>,
  router: ReturnType<typeof useRouter>
) {
  return (key: string, value: unknown): void => {
    const query: Record<string, string> = {};
    for (const [k, v] of Object.entries(route.query)) {
      if (typeof v === 'string' && k !== key) query[k] = v;
    }

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      // Key already excluded above
    } else if (Array.isArray(value)) {
      query[key] = value.join(',');
    } else if (typeof value === 'boolean') {
      query[key] = String(value);
    } else if (typeof value === 'string' || typeof value === 'number') {
      query[key] = String(value);
    }

    void router.replace({ query });
  };
}

function createFiltersParser(
  route: ReturnType<typeof useRoute>,
  wordSearch: Ref<string>,
  searchText: Ref<string>,
  kanaSearch: Ref<string>
) {
  return (): VocabListFilters => {
    const query = route.query;
    const filters: VocabListFilters = {};

    if (wordSearch.value) filters.word = wordSearch.value;
    if (searchText.value) filters.search = searchText.value;
    if (kanaSearch.value) filters.kana = kanaSearch.value;

    const jlptLevels = parseJlptLevels(query[FILTER_QUERY_KEYS.jlptLevels]);
    if (jlptLevels) filters.jlptLevels = jlptLevels;

    const isCommon = parseBoolean(query[FILTER_QUERY_KEYS.isCommon]);
    if (isCommon !== undefined) filters.isCommon = isCommon;

    const containsKanjiIds = parseKanjiIds(query[FILTER_QUERY_KEYS.containsKanjiIds]);
    if (containsKanjiIds !== undefined) filters.containsKanjiIds = containsKanjiIds;

    const descriptionFilled = parseDescriptionFilter(query[FILTER_QUERY_KEYS.descriptionFilled]);
    if (descriptionFilled) filters.descriptionFilled = descriptionFilled;

    return filters;
  };
}

// ============================================================================
// Composable Implementation
// ============================================================================

/**
 * Syncs vocabulary list filter state with URL query parameters.
 *
 * @returns Reactive filter state and URL-synchronised search helpers
 */
export function useVocabListUrlSync(): UseVocabListUrlSyncReturn {
  const route = useRoute();
  const router = useRouter();

  const wordSearch = useDebounce('', 150);
  const searchText = useDebounce('', 150);
  const kanaSearch = useDebounce('', 150);
  const updateQueryParam = createQueryParamUpdater(route, router);

  // Setup text input syncs
  setupTextInputSync(route, FILTER_QUERY_KEYS.word, wordSearch, updateQueryParam);
  setupTextInputSync(route, FILTER_QUERY_KEYS.search, searchText, updateQueryParam);
  setupTextInputSync(route, FILTER_QUERY_KEYS.kana, kanaSearch, updateQueryParam);

  const parseFiltersFromUrl = createFiltersParser(route, wordSearch, searchText, kanaSearch);

  const clearQueryParams = (): void => {
    wordSearch.value = '';
    searchText.value = '';
    kanaSearch.value = '';
    void router.replace({ query: {} });
  };

  return {
    wordSearch,
    searchText,
    kanaSearch,
    parseFiltersFromUrl,
    updateQueryParam,
    clearQueryParams,
  };
}
