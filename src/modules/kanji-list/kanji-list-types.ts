/**
 * Kanji List Types
 *
 * Type definitions for the kanji list module.
 * Includes extended filter types beyond the base API filters.
 *
 * @module modules/kanji-list
 */

import type {
  JlptLevel,
  JoyoLevel,
  Kanji,
  KanjiKenteiLevel
} from '@/api/kanji/kanji-types'

// ============================================================================
// Re-exports for convenience
// ============================================================================

export type { JlptLevel, JoyoLevel, Kanji, KanjiKenteiLevel }

// ============================================================================
// Stroke Order Filter Types
// ============================================================================

/** Filter options for stroke order presence */
export type StrokeOrderFilterValue = 'has' | 'missing' | null

// ============================================================================
// Analysis Field Filter Types
// ============================================================================

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

/** Threshold character counts */
export const ANALYSIS_THRESHOLDS = {
  empty: 0,
  short: 50,
  medium: 200,
  long: 500
} as const

// ============================================================================
// Extended Filter Types
// ============================================================================

/**
 * Extended filter state for kanji list
 *
 * Includes all filters from API plus additional UI-specific filters
 */
export interface KanjiListFilters {
  /** Search by kanji character */
  character?: string
  /** Search in short meaning and search keywords */
  searchKeywords?: string
  /** Search in meanings (meaning_text only) */
  meanings?: string
  /** Search by on-yomi reading */
  onYomi?: string
  /** Search by kun-yomi reading */
  kunYomi?: string
  /** Minimum stroke count */
  strokeCountMin?: number
  /** Maximum stroke count */
  strokeCountMax?: number
  /** Filter by JLPT levels (any of) */
  jlptLevels?: JlptLevel[]
  /** Filter by Joyo levels (any of) */
  joyoLevels?: JoyoLevel[]
  /** Filter by Kentei levels (any of) */
  kenteiLevels?: KanjiKenteiLevel[]
  /** Filter by radical ID */
  radicalId?: number
  /** Filter by component IDs (ALL must match - AND logic) */
  componentIds?: number[]
  /** Filter by classification type IDs (ALL must match - AND logic) */
  classificationTypeIds?: number[]
  /** Filter by stroke order diagram presence */
  strokeOrderDiagram?: StrokeOrderFilterValue
  /** Filter by stroke order animation presence */
  strokeOrderAnimation?: StrokeOrderFilterValue
  /** Filter by analysis field content */
  analysisFilters?: AnalysisFieldFilter[]
}

// ============================================================================
// URL Query Param Keys
// ============================================================================

/**
 * Mapping of filter keys to URL query parameter keys
 */
export const FILTER_QUERY_KEYS = {
  character: 'character',
  searchKeywords: 'keywords',
  meanings: 'meanings',
  onYomi: 'onYomi',
  kunYomi: 'kunYomi',
  strokeCountMin: 'strokeMin',
  strokeCountMax: 'strokeMax',
  jlptLevels: 'jlpt',
  joyoLevels: 'joyo',
  kenteiLevels: 'kentei',
  radicalId: 'radical',
  componentIds: 'components',
  classificationTypeIds: 'classifications',
  strokeOrderDiagram: 'diagram',
  strokeOrderAnimation: 'animation',
  analysisFilters: 'analysis'
} as const satisfies Record<keyof KanjiListFilters, string>

// ============================================================================
// Display Labels
// ============================================================================

/** Joyo level display labels */
export const JOYO_LABELS: Record<JoyoLevel, string> = {
  elementary1: '小1',
  elementary2: '小2',
  elementary3: '小3',
  elementary4: '小4',
  elementary5: '小5',
  elementary6: '小6',
  secondary: '中学'
}

/** Kentei level display labels */
export const KENTEI_LABELS: Record<KanjiKenteiLevel, string> = {
  '10': '10級',
  '9': '9級',
  '8': '8級',
  '7': '7級',
  '6': '6級',
  '5': '5級',
  '4': '4級',
  '3': '3級',
  pre2: '準2級',
  '2': '2級',
  pre1: '準1級',
  '1': '1級'
}

/** Analysis field display labels */
export const ANALYSIS_FIELD_LABELS: Record<AnalysisFieldName, string> = {
  notesEtymology: '語源',
  notesSemantic: '意味解析',
  notesEducationMnemonics: '教育',
  notesPersonal: '個人'
}

/** Analysis threshold display labels */
export const ANALYSIS_THRESHOLD_LABELS: Record<
  AnalysisLengthThreshold,
  string
> = {
  empty: '空',
  short: '短い (<50字)',
  medium: '中程度 (50-200字)',
  long: '長い (>200字)'
}

// ============================================================================
// View State Types
// ============================================================================

/** Kanji with its primary classification for list display */
export interface KanjiWithClassification {
  kanji: Kanji
  primaryClassification?: {
    id: number
    typeName: string
    nameJapanese: string | null
  } | null
}
