/**
 * Classification Types
 *
 * Type definitions for kanji classification types
 * (pictograph, ideograph, etc.)
 *
 * @module api/classification
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * A classification type (e.g., pictograph, ideograph)
 */
export interface ClassificationType {
  id: number
  typeName: string
  nameJapanese: string | null
  nameEnglish: string | null
  description: string | null
  descriptionShort: string | null
  displayOrder: number
}

/**
 * A kanji's assignment to a classification type
 */
export interface KanjiClassification {
  id: number
  kanjiId: number
  classificationTypeId: number
  displayOrder: number
  // Joined data for convenience
  classificationType?: ClassificationType
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for creating a classification type
 */
export interface CreateClassificationTypeInput {
  typeName: string
  nameJapanese?: string | null
  nameEnglish?: string | null
  description?: string | null
  descriptionShort?: string | null
  displayOrder?: number
}

/**
 * Input for updating a classification type
 */
export interface UpdateClassificationTypeInput {
  typeName?: string
  nameJapanese?: string | null
  nameEnglish?: string | null
  description?: string | null
  descriptionShort?: string | null
}

/**
 * Input for assigning a classification to a kanji
 */
export interface CreateKanjiClassificationInput {
  kanjiId: number
  classificationTypeId: number
  displayOrder?: number
}
