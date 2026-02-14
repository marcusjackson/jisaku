/**
 * Component Detail Types
 *
 * Type definitions for the component detail module.
 *
 * @module modules/component-detail
 */

import type { Component } from '@/api/component/component-types'

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { Component }

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Props for the headline section
 */
export interface HeadlineProps {
  component: Component
}

/**
 * Data emitted when headline fields are saved
 */
export interface HeadlineSaveData {
  character: string
  shortMeaning: string | null
  searchKeywords: string | null
}

/**
 * Data emitted when basic info fields are saved
 */
export interface BasicInfoSaveData {
  strokeCount: number | null
  sourceKanjiId: number | null
  canBeRadical: boolean
  kangxiNumber: number | null
  kangxiMeaning: string | null
  radicalNameJapanese: string | null
}

/**
 * Data emitted when form dialog is submitted
 */
export interface FormSubmitData {
  formCharacter: string
  formName: string | null
  strokeCount: number | null
  usageNotes: string | null
}

/**
 * Data emitted when occurrence edit dialog is submitted
 */
export interface OccurrenceUpdateData {
  positionTypeId: number | null
  componentFormId: number | null
  isRadical: boolean
  analysisNotes: string | null
}
