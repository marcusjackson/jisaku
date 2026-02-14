/**
 * Component Types
 *
 * Type definitions for the component entity and related child entities.
 *
 * @module api/component
 */

// ============================================================================
// Entity Interfaces
// ============================================================================

/**
 * Component entity - building blocks of kanji
 */
export interface Component {
  id: number
  character: string
  strokeCount: number | null
  shortMeaning: string | null
  searchKeywords: string | null
  sourceKanjiId: number | null
  description: string | null
  canBeRadical: boolean
  kangxiNumber: number | null
  kangxiMeaning: string | null
  radicalNameJapanese: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Component form - visual variants of a component
 */
export interface ComponentForm {
  id: number
  componentId: number
  formCharacter: string
  formName: string | null
  strokeCount: number | null
  usageNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Component occurrence - where a component appears in a kanji
 */
export interface ComponentOccurrence {
  id: number
  kanjiId: number
  componentId: number
  componentFormId: number | null
  positionTypeId: number | null
  isRadical: boolean
  analysisNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

/**
 * Component grouping - user-created pattern groups
 */
export interface ComponentGrouping {
  id: number
  componentId: number
  name: string
  description: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Input Types - Component
// ============================================================================

/**
 * Input for creating a new component
 */
export interface CreateComponentInput {
  character: string
  strokeCount?: number | null
  shortMeaning?: string | null
  searchKeywords?: string | null
  sourceKanjiId?: number | null
  description?: string | null
  canBeRadical?: boolean
  kangxiNumber?: number | null
  kangxiMeaning?: string | null
  radicalNameJapanese?: string | null
}

/**
 * Input for updating a component
 */
export type UpdateComponentInput = Partial<CreateComponentInput>

/**
 * Filters for searching components
 */
export interface ComponentFilters {
  /** Search in character, short_meaning, search_keywords */
  search?: string
  /** Search in kangxi_meaning field */
  kangxiSearch?: string
  /** Filter to only radicals */
  canBeRadical?: boolean
  /** Filter by kangxi number */
  kangxiNumber?: number
  /** Filter by stroke count range */
  strokeCountMin?: number
  strokeCountMax?: number
}

// ============================================================================
// Input Types - Component Form
// ============================================================================

/**
 * Input for creating a component form
 */
export interface CreateComponentFormInput {
  componentId: number
  formCharacter: string
  formName?: string | null
  strokeCount?: number | null
  usageNotes?: string | null
  displayOrder?: number
}

/**
 * Input for updating a component form
 */
export interface UpdateComponentFormInput {
  formCharacter?: string
  formName?: string | null
  strokeCount?: number | null
  usageNotes?: string | null
}

// ============================================================================
// Input Types - Component Occurrence
// ============================================================================

/**
 * Input for creating a component occurrence
 */
export interface CreateComponentOccurrenceInput {
  kanjiId: number
  componentId: number
  componentFormId?: number | null
  positionTypeId?: number | null
  isRadical?: boolean
  analysisNotes?: string | null
  displayOrder?: number
}

/**
 * Input for updating a component occurrence
 */
export interface UpdateComponentOccurrenceInput {
  componentFormId?: number | null
  positionTypeId?: number | null
  isRadical?: boolean
  analysisNotes?: string | null
}

// ============================================================================
// Input Types - Component Grouping
// ============================================================================

/**
 * Input for creating a component grouping
 */
export interface CreateComponentGroupingInput {
  componentId: number
  name: string
  description?: string | null
  displayOrder?: number
}

/**
 * Input for updating a component grouping
 */
export interface UpdateComponentGroupingInput {
  name?: string
  description?: string | null
}

// ============================================================================
// Extended Types
// ============================================================================

/**
 * Component occurrence with joined kanji and position type data.
 * Used by component detail page to display occurrences with full context.
 */
export interface OccurrenceWithKanji {
  id: number
  kanjiId: number
  componentId: number
  componentFormId: number | null
  positionTypeId: number | null
  isRadical: boolean
  analysisNotes: string | null
  displayOrder: number
  createdAt: string
  updatedAt: string
  /** Joined kanji entity */
  kanji: {
    id: number
    character: string
    shortMeaning: string | null
    strokeCount: number | null
  }
  /** Joined position type (if set) */
  position: {
    id: number
    positionName: string
    nameJapanese: string | null
    nameEnglish: string | null
    description: string | null
    displayOrder: number
  } | null
}
