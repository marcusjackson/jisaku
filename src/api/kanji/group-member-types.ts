/**
 * Kanji Meaning Group Member Types
 *
 * Type definitions for junction table linking meanings to reading groups.
 * Allows organizing meanings under specific reading groups.
 *
 * @module api/kanji
 */

// ============================================================================
// Entity Types
// ============================================================================

/**
 * Junction entity linking a meaning to a reading group
 *
 * Allows a meaning to be assigned to a reading group with its own display order
 */
export interface KanjiMeaningGroupMember {
  id: number
  readingGroupId: number
  meaningId: number
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for adding a meaning to a reading group
 */
export interface CreateGroupMemberInput {
  readingGroupId: number
  meaningId: number
  displayOrder?: number
}
