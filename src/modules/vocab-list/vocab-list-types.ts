/**
 * Vocab List Types
 *
 * Type definitions for the vocabulary list module.
 * Includes extended filter types beyond the base API filters.
 *
 * @module modules/vocab-list
 */

import type {
  DescriptionFilledFilter,
  VocabJlptLevel,
  Vocabulary
} from '@/api/vocabulary'

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { DescriptionFilledFilter, VocabJlptLevel, Vocabulary }

// ============================================================================
// Extended Filter Types
// ============================================================================

/**
 * Extended filter state for vocabulary list
 *
 * Includes all filters from API plus additional UI-specific filters
 */
export interface VocabListFilters {
  /** Search by word */
  word?: string
  /** Search in short meaning and search keywords */
  search?: string
  /** Search specifically in kana field */
  kana?: string
  /** Filter by JLPT levels (any of) */
  jlptLevels?: VocabJlptLevel[]
  /** Filter to common words only */
  isCommon?: boolean
  /** Filter by kanji contained in word (ALL must match - AND logic) */
  containsKanjiIds?: number[]
  /** Filter by description presence */
  descriptionFilled?: DescriptionFilledFilter
}

// ============================================================================
// URL Query Param Keys
// ============================================================================

/**
 * Mapping of filter keys to URL query parameter keys
 */
export const FILTER_QUERY_KEYS = {
  word: 'word',
  search: 'search',
  kana: 'kana',
  jlptLevels: 'jlpt',
  isCommon: 'common',
  containsKanjiIds: 'kanji',
  descriptionFilled: 'description'
} as const satisfies Record<keyof VocabListFilters, string>

// ============================================================================
// Display Labels
// ============================================================================

/** JLPT level display labels */
export const JLPT_LABELS: Record<VocabJlptLevel, string> = {
  N5: 'N5',
  N4: 'N4',
  N3: 'N3',
  N2: 'N2',
  N1: 'N1',
  'non-jlpt': '非JLPT'
}

/** Description filter display labels */
export const DESCRIPTION_FILTER_LABELS: Record<
  NonNullable<DescriptionFilledFilter>,
  string
> = {
  filled: 'Has description',
  empty: 'No description'
}
