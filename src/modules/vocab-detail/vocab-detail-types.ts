/**
 * Vocabulary Detail Types
 *
 * Type definitions for the vocabulary detail module.
 *
 * @module modules/vocab-detail
 */

import type {
  VocabJlptLevel,
  Vocabulary
} from '@/api/vocabulary/vocabulary-types'

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { VocabJlptLevel, Vocabulary }

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the headline section
 */
export interface HeadlineProps {
  vocab: Vocabulary
}

/**
 * Data emitted when headline fields are saved
 */
export interface HeadlineSaveData {
  word: string
  kana: string
  shortMeaning: string | null
  searchKeywords: string | null
}

/**
 * Props for the actions section
 */
export interface ActionsProps {
  /** Whether destructive mode is active */
  destructiveMode: boolean
  /** Whether delete operation is in progress */
  isDeleting: boolean
}

// ============================================================================
// Event Types
// ============================================================================

/**
 * Events emitted by the headline section
 */
export type HeadlineEmits = (e: 'save', data: HeadlineSaveData) => void

/**
 * Events emitted by the actions section
 */
export interface ActionsEmits {
  (e: 'update:destructive-mode', value: boolean): void
  (e: 'delete'): void
}
