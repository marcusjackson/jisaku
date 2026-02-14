/**
 * Position Types
 *
 * Type definitions for component position types.
 * (hen, tsukuri, kanmuri, etc.)
 *
 * @module api/position
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * A position type for component placement in kanji
 * (e.g., hen/偏 = left, tsukuri/旁 = right)
 */
export interface PositionType {
  id: number
  positionName: string
  nameJapanese: string | null
  nameEnglish: string | null
  description: string | null
  displayOrder: number
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for creating a position type
 */
export interface CreatePositionTypeInput {
  positionName: string
  nameJapanese?: string | null
  nameEnglish?: string | null
  description?: string | null
  displayOrder?: number
}

/**
 * Input for updating a position type
 */
export interface UpdatePositionTypeInput {
  positionName?: string
  nameJapanese?: string | null
  nameEnglish?: string | null
  description?: string | null
}
