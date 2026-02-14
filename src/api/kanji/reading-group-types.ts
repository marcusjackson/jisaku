/**
 * Kanji Meaning Reading Group Types
 *
 * Type definitions for optional reading groupings of kanji meanings.
 * Reading groups allow meanings to be organized by different pronunciations.
 *
 * @module api/kanji
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * A reading group for organizing kanji meanings
 *
 * Example: For 明 (bright), separate groups for あか (akari) and めい (mei) readings
 */
export interface KanjiMeaningReadingGroup {
  id: number
  kanjiId: number
  readingText: string
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for creating a new reading group
 */
export interface CreateReadingGroupInput {
  kanjiId: number
  readingText: string
  displayOrder?: number
}

/**
 * Input for updating a reading group
 */
export interface UpdateReadingGroupInput {
  readingText?: string
}
