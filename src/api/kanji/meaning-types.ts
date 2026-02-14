/**
 * Kanji Meaning Types
 *
 * Type definitions for kanji meanings.
 *
 * @module api/kanji
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * A meaning/definition for a kanji
 */
export interface KanjiMeaning {
  id: number
  kanjiId: number
  meaningText: string
  additionalInfo: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for creating a new meaning
 */
export interface CreateKanjiMeaningInput {
  kanjiId: number
  meaningText: string
  additionalInfo?: string | null
  displayOrder?: number
}

/**
 * Input for updating a meaning
 */
export interface UpdateKanjiMeaningInput {
  meaningText?: string
  additionalInfo?: string | null
}
