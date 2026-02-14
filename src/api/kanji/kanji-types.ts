/**
 * Kanji Types
 *
 * Type definitions for the kanji entity and related operations.
 */

// ============================================================================
// Enums / Literal Types
// ============================================================================

/** JLPT proficiency levels */
export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1'

/** Joyo grade levels */
export type JoyoLevel =
  | 'elementary1'
  | 'elementary2'
  | 'elementary3'
  | 'elementary4'
  | 'elementary5'
  | 'elementary6'
  | 'secondary'

/** Kanji Kentei levels */
export type KanjiKenteiLevel =
  | '10'
  | '9'
  | '8'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | 'pre2'
  | '2'
  | 'pre1'
  | '1'

// ============================================================================
// Entity Interface
// ============================================================================

/**
 * Kanji entity
 *
 * Represents a single kanji entry in the database.
 */
export interface Kanji {
  id: number
  character: string
  strokeCount: number | null
  shortMeaning: string | null
  searchKeywords: string | null
  radicalId: number | null
  jlptLevel: JlptLevel | null
  joyoLevel: JoyoLevel | null
  kanjiKenteiLevel: KanjiKenteiLevel | null
  strokeDiagramImage: Uint8Array | null
  strokeGifImage: Uint8Array | null
  notesEtymology: string | null
  notesSemantic: string | null
  notesEducationMnemonics: string | null
  notesPersonal: string | null
  identifier: number | null
  radicalStrokeCount: number | null
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Input Types
// ============================================================================

/**
 * Input for creating a new kanji
 *
 * Only character is required; all other fields are optional.
 */
export interface CreateKanjiInput {
  character: string
  strokeCount?: number | null
  shortMeaning?: string | null
  searchKeywords?: string | null
  radicalId?: number | null
  jlptLevel?: JlptLevel | null
  joyoLevel?: JoyoLevel | null
  kanjiKenteiLevel?: KanjiKenteiLevel | null
  strokeDiagramImage?: Uint8Array | null
  strokeGifImage?: Uint8Array | null
  notesEtymology?: string | null
  notesSemantic?: string | null
  notesEducationMnemonics?: string | null
  notesPersonal?: string | null
  identifier?: number | null
  radicalStrokeCount?: number | null
}

/**
 * Input for updating an existing kanji
 *
 * All fields optional - only specified fields will be updated.
 */
export type UpdateKanjiInput = Partial<CreateKanjiInput>

// ============================================================================
// Filter Types
// ============================================================================

/** Filter options for stroke order presence */
export type StrokeOrderFilterValue = 'has' | 'missing' | null

/** Analysis field length threshold options */
export type AnalysisLengthThreshold = 'empty' | 'short' | 'medium' | 'long'

/** Analysis field names */
export type AnalysisFieldName =
  | 'notesEtymology'
  | 'notesSemantic'
  | 'notesEducationMnemonics'
  | 'notesPersonal'

/** Filter configuration for a single analysis field */
export interface AnalysisFieldFilter {
  field: AnalysisFieldName
  threshold: AnalysisLengthThreshold
}

/**
 * Filters for searching/listing kanji
 */
export interface KanjiFilters {
  /** Search in character, short_meaning, search_keywords */
  search?: string
  /** Search by exact character match */
  character?: string
  /** Search in short_meaning and search_keywords */
  searchKeywords?: string
  /** Search in meanings (meaning_text only) */
  meanings?: string
  /** Search by on-yomi reading */
  onYomi?: string
  /** Search by kun-yomi reading */
  kunYomi?: string
  /** Filter by JLPT levels (any of) */
  jlptLevels?: JlptLevel[]
  /** Filter by Joyo levels (any of) */
  joyoLevels?: JoyoLevel[]
  /** Filter by Kentei levels (any of) */
  kenteiLevels?: KanjiKenteiLevel[]
  /** Filter by stroke count range */
  strokeCountMin?: number
  strokeCountMax?: number
  /** Filter by radical */
  radicalId?: number
  /** Filter by component (via component_occurrences) - single component */
  componentId?: number
  /** Filter by components (ALL must match - AND logic) */
  componentIds?: number[]
  /** Filter by classification type - single type */
  classificationTypeId?: number
  /** Filter by classification types (ALL must match - AND logic) */
  classificationTypeIds?: number[]
  /** Filter by stroke order diagram presence */
  strokeOrderDiagram?: StrokeOrderFilterValue
  /** Filter by stroke order animation presence */
  strokeOrderAnimation?: StrokeOrderFilterValue
  /** Filter by analysis field content */
  analysisFilters?: AnalysisFieldFilter[]
}

/**
 * Sort options for kanji list
 */
export type KanjiSortField =
  | 'character'
  | 'strokeCount'
  | 'jlptLevel'
  | 'joyoLevel'
  | 'identifier'
  | 'createdAt'
  | 'updatedAt'

export type SortDirection = 'asc' | 'desc'

export interface KanjiSortOptions {
  field: KanjiSortField
  direction: SortDirection
}
