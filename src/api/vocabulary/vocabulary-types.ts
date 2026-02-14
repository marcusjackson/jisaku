/**
 * Vocabulary Types
 *
 * Type definitions for the vocabulary entity and related types.
 *
 * @module api/vocabulary
 */

// ============================================================================
// Vocabulary-specific Types
// ============================================================================

/**
 * JLPT level for vocabulary
 * Vocabulary supports 'non-jlpt' in addition to standard N5-N1 levels
 */
export type VocabJlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'non-jlpt'

// ============================================================================
// Entity Interfaces
// ============================================================================

/**
 * Vocabulary entity - Japanese words/phrases
 */
export interface Vocabulary {
  id: number
  word: string
  kana: string
  shortMeaning: string | null
  searchKeywords: string | null
  jlptLevel: VocabJlptLevel | null
  isCommon: boolean
  description: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Vocab-Kanji junction - links vocabulary to constituent kanji
 */
export interface VocabKanji {
  id: number
  vocabId: number
  kanjiId: number
  analysisNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Input Types - Vocabulary
// ============================================================================

/**
 * Input for creating a new vocabulary entry
 */
export interface CreateVocabularyInput {
  word: string
  kana: string
  shortMeaning?: string | null
  searchKeywords?: string | null
  jlptLevel?: VocabJlptLevel | null
  isCommon?: boolean
  description?: string | null
}

/**
 * Input for updating a vocabulary entry
 */
export type UpdateVocabularyInput = Partial<CreateVocabularyInput>

/** Description filled filter values */
export type DescriptionFilledFilter = 'filled' | 'empty' | null

/**
 * Filters for searching vocabulary
 */
export interface VocabularyFilters {
  /** Search by exact word match */
  word?: string
  /** Search in short_meaning and search_keywords */
  search?: string
  /** Search specifically in kana field */
  kana?: string
  /** Filter by JLPT levels (any of) */
  jlptLevels?: VocabJlptLevel[]
  /** Filter to common words only */
  isCommon?: boolean
  /** Filter by kanji contained in word (single) */
  containsKanjiId?: number
  /** Filter by kanji contained in word (ALL must match - AND logic) */
  containsKanjiIds?: number[]
  /** Filter by description presence */
  descriptionFilled?: DescriptionFilledFilter
}

// ============================================================================
// Input Types - VocabKanji
// ============================================================================

/**
 * Input for creating a vocab-kanji link
 */
export interface CreateVocabKanjiInput {
  vocabId: number
  kanjiId: number
  analysisNotes?: string | null
  displayOrder?: number
}

/**
 * Input for updating a vocab-kanji link
 */
export interface UpdateVocabKanjiInput {
  analysisNotes?: string | null
  displayOrder?: number
}

// ============================================================================
// Derived Types
// ============================================================================

/**
 * VocabKanji with joined Vocabulary data
 * Used for displaying vocabulary that contains a specific kanji
 */
export interface VocabKanjiWithVocabulary {
  vocabKanji: VocabKanji
  vocabulary: Vocabulary
}
