/**
 * Reading Types
 *
 * Type definitions for on-yomi and kun-yomi readings.
 */

// ============================================================================
// Enums / Literal Types
// ============================================================================

/** Reading proficiency levels (school grade when learned) */
export type ReadingLevel = '小' | '中' | '高' | '外'

// ============================================================================
// Entity Interfaces
// ============================================================================

/**
 * On-yomi (Chinese) reading entity
 */
export interface OnReading {
  id: number
  kanjiId: number
  reading: string
  readingLevel: ReadingLevel
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Kun-yomi (Japanese) reading entity
 */
export interface KunReading {
  id: number
  kanjiId: number
  reading: string
  okurigana: string | null
  readingLevel: ReadingLevel
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for creating an on-yomi reading
 */
export interface CreateOnReadingInput {
  kanjiId: number
  reading: string
  readingLevel?: ReadingLevel
  displayOrder?: number
}

/**
 * Input for updating an on-yomi reading
 */
export interface UpdateOnReadingInput {
  reading?: string
  readingLevel?: ReadingLevel
}

/**
 * Input for creating a kun-yomi reading
 */
export interface CreateKunReadingInput {
  kanjiId: number
  reading: string
  okurigana?: string | null
  readingLevel?: ReadingLevel
  displayOrder?: number
}

/**
 * Input for updating a kun-yomi reading
 */
export interface UpdateKunReadingInput {
  reading?: string
  okurigana?: string | null
  readingLevel?: ReadingLevel
}
