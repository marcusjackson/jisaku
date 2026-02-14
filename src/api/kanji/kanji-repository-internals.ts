/**
 * Kanji Repository Internals
 *
 * Internal utilities for kanji repository - row mapping and helpers.
 * Not exported from the module.
 *
 * @internal
 */

import type { CreateKanjiInput, Kanji, KanjiFilters } from './kanji-types'

// ============================================================================
// Row Type (database representation)
// ============================================================================

export interface KanjiRow {
  id: number
  character: string
  stroke_count: number | null
  short_meaning: string | null
  search_keywords: string | null
  radical_id: number | null
  jlpt_level: string | null
  joyo_level: string | null
  kanji_kentei_level: string | null
  stroke_diagram_image: Uint8Array | null
  stroke_gif_image: Uint8Array | null
  notes_etymology: string | null
  notes_semantic: string | null
  notes_education_mnemonics: string | null
  notes_personal: string | null
  identifier: number | null
  radical_stroke_count: number | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Row Mapping
// ============================================================================

/**
 * Convert database row to Kanji entity
 */
export function mapKanjiRow(row: Record<string, unknown>): Kanji {
  const r = row as unknown as KanjiRow
  return {
    id: r.id,
    character: r.character,
    strokeCount: r.stroke_count,
    shortMeaning: r.short_meaning,
    searchKeywords: r.search_keywords,
    radicalId: r.radical_id,
    jlptLevel: r.jlpt_level as Kanji['jlptLevel'],
    joyoLevel: r.joyo_level as Kanji['joyoLevel'],
    kanjiKenteiLevel: r.kanji_kentei_level as Kanji['kanjiKenteiLevel'],
    strokeDiagramImage: r.stroke_diagram_image,
    strokeGifImage: r.stroke_gif_image,
    notesEtymology: r.notes_etymology,
    notesSemantic: r.notes_semantic,
    notesEducationMnemonics: r.notes_education_mnemonics,
    notesPersonal: r.notes_personal,
    identifier: r.identifier,
    radicalStrokeCount: r.radical_stroke_count,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }
}

// ============================================================================
// Input Mapping
// ============================================================================

/**
 * Map CreateKanjiInput to SQL parameter values
 */
export function mapKanjiInputToValues(input: CreateKanjiInput): unknown[] {
  // Helper to coalesce undefined to null for SQL
  const n = <T>(v: T | undefined): T | null => v ?? null

  return [
    input.character,
    n(input.strokeCount),
    n(input.shortMeaning),
    n(input.searchKeywords),
    n(input.radicalId),
    n(input.jlptLevel),
    n(input.joyoLevel),
    n(input.kanjiKenteiLevel),
    n(input.strokeDiagramImage),
    n(input.strokeGifImage),
    n(input.notesEtymology),
    n(input.notesSemantic),
    n(input.notesEducationMnemonics),
    n(input.notesPersonal),
    n(input.identifier),
    n(input.radicalStrokeCount)
  ]
}

// ============================================================================
// Filter Building
// ============================================================================

export interface SearchConditions {
  conditions: string[]
  params: unknown[]
}

/** Threshold character counts for analysis field filters */
const ANALYSIS_THRESHOLDS = {
  empty: 0,
  short: 50,
  medium: 200,
  long: 500
} as const

/** Map analysis field names to database columns */
const ANALYSIS_FIELD_COLUMNS: Record<string, string> = {
  notesEtymology: 'notes_etymology',
  notesSemantic: 'notes_semantic',
  notesEducationMnemonics: 'notes_education_mnemonics',
  notesPersonal: 'notes_personal'
}

/**
 * Build SQL WHERE conditions from KanjiFilters
 */
export function buildKanjiSearchConditions(
  filters: KanjiFilters
): SearchConditions {
  const conditions: string[] = []
  const params: unknown[] = []

  addTextSearchConditions(filters, conditions, params)
  addReadingSearchConditions(filters, conditions, params)
  addStrokeCountConditions(filters, conditions, params)
  addLevelConditions(filters, conditions, params)
  addComponentConditions(filters, conditions, params)
  addClassificationConditions(filters, conditions, params)
  addStrokeDiagramConditions(filters, conditions, params)
  addAnalysisFieldConditions(filters, conditions, params)

  return { conditions, params }
}

/**
 * Add text search conditions (character, keywords, general search)
 */
function addTextSearchConditions(
  filters: KanjiFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.search) {
    conditions.push(
      '(character LIKE ? OR short_meaning LIKE ? OR search_keywords LIKE ?)'
    )
    const pattern = `%${filters.search}%`
    params.push(pattern, pattern, pattern)
  }

  if (filters.character) {
    conditions.push('character = ?')
    params.push(filters.character)
  }

  if (filters.searchKeywords) {
    conditions.push('(short_meaning LIKE ? OR search_keywords LIKE ?)')
    const pattern = `%${filters.searchKeywords}%`
    params.push(pattern, pattern)
  }

  if (filters.meanings) {
    conditions.push(
      'id IN (SELECT kanji_id FROM kanji_meanings WHERE meaning_text LIKE ?)'
    )
    params.push(`%${filters.meanings}%`)
  }
}

/**
 * Add reading search conditions (on-yomi, kun-yomi)
 */
function addReadingSearchConditions(
  filters: KanjiFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.onYomi) {
    conditions.push(
      'id IN (SELECT kanji_id FROM on_readings WHERE reading LIKE ?)'
    )
    params.push(`%${filters.onYomi}%`)
  }

  if (filters.kunYomi) {
    conditions.push(
      `id IN (SELECT kanji_id FROM kun_readings WHERE (reading || COALESCE(okurigana, '')) LIKE ?)`
    )
    params.push(`%${filters.kunYomi}%`)
  }
}

/**
 * Add stroke count range conditions
 */
function addStrokeCountConditions(
  filters: KanjiFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.strokeCountMin !== undefined) {
    conditions.push('stroke_count >= ?')
    params.push(filters.strokeCountMin)
  }
  if (filters.strokeCountMax !== undefined) {
    conditions.push('stroke_count <= ?')
    params.push(filters.strokeCountMax)
  }
}

/**
 * Add JLPT, Joyo, and Kentei level conditions
 */
function addLevelConditions(
  filters: KanjiFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.jlptLevels?.length) {
    const placeholders = filters.jlptLevels.map(() => '?').join(', ')
    conditions.push(`jlpt_level IN (${placeholders})`)
    params.push(...filters.jlptLevels)
  }

  if (filters.joyoLevels?.length) {
    const placeholders = filters.joyoLevels.map(() => '?').join(', ')
    conditions.push(`joyo_level IN (${placeholders})`)
    params.push(...filters.joyoLevels)
  }

  if (filters.kenteiLevels?.length) {
    const placeholders = filters.kenteiLevels.map(() => '?').join(', ')
    conditions.push(`kanji_kentei_level IN (${placeholders})`)
    params.push(...filters.kenteiLevels)
  }

  if (filters.radicalId !== undefined) {
    conditions.push('radical_id = ?')
    params.push(filters.radicalId)
  }
}

/**
 * Add component filter conditions
 */
function addComponentConditions(
  filters: KanjiFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.componentId !== undefined) {
    conditions.push(
      'id IN (SELECT kanji_id FROM component_occurrences WHERE component_id = ?)'
    )
    params.push(filters.componentId)
  }

  if (filters.componentIds?.length) {
    for (const compId of filters.componentIds) {
      conditions.push(
        'id IN (SELECT kanji_id FROM component_occurrences WHERE component_id = ?)'
      )
      params.push(compId)
    }
  }
}

/**
 * Add classification type filter conditions
 */
function addClassificationConditions(
  filters: KanjiFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.classificationTypeId !== undefined) {
    conditions.push(
      'id IN (SELECT kanji_id FROM kanji_classifications WHERE classification_type_id = ?)'
    )
    params.push(filters.classificationTypeId)
  }

  if (filters.classificationTypeIds?.length) {
    for (const typeId of filters.classificationTypeIds) {
      conditions.push(
        'id IN (SELECT kanji_id FROM kanji_classifications WHERE classification_type_id = ?)'
      )
      params.push(typeId)
    }
  }
}

/**
 * Add stroke diagram/animation presence conditions
 */
function addStrokeDiagramConditions(
  filters: KanjiFilters,
  conditions: string[],
  _params: unknown[]
): void {
  if (filters.strokeOrderDiagram === 'has') {
    conditions.push('stroke_diagram_image IS NOT NULL')
  } else if (filters.strokeOrderDiagram === 'missing') {
    conditions.push('stroke_diagram_image IS NULL')
  }

  if (filters.strokeOrderAnimation === 'has') {
    conditions.push('stroke_gif_image IS NOT NULL')
  } else if (filters.strokeOrderAnimation === 'missing') {
    conditions.push('stroke_gif_image IS NULL')
  }
}

/**
 * Add analysis field filter conditions (notes fields with length thresholds)
 */
function addAnalysisFieldConditions(
  filters: KanjiFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.analysisFilters?.length) {
    for (const af of filters.analysisFilters) {
      const column = ANALYSIS_FIELD_COLUMNS[af.field]
      if (!column) continue

      if (af.threshold === 'empty') {
        conditions.push(`(${column} IS NULL OR ${column} = '')`)
      } else {
        const minLen = ANALYSIS_THRESHOLDS[af.threshold]
        conditions.push(`LENGTH(${column}) >= ?`)
        params.push(minLen)
      }
    }
  }
}

// ============================================================================
// Field Mapping
// ============================================================================

/**
 * Mapping of camelCase field names to snake_case column names
 */
export const KANJI_FIELD_COLUMNS: readonly (readonly [
  keyof CreateKanjiInput,
  string
])[] = [
  ['character', 'character'],
  ['strokeCount', 'stroke_count'],
  ['shortMeaning', 'short_meaning'],
  ['searchKeywords', 'search_keywords'],
  ['radicalId', 'radical_id'],
  ['jlptLevel', 'jlpt_level'],
  ['joyoLevel', 'joyo_level'],
  ['kanjiKenteiLevel', 'kanji_kentei_level'],
  ['strokeDiagramImage', 'stroke_diagram_image'],
  ['strokeGifImage', 'stroke_gif_image'],
  ['notesEtymology', 'notes_etymology'],
  ['notesSemantic', 'notes_semantic'],
  ['notesEducationMnemonics', 'notes_education_mnemonics'],
  ['notesPersonal', 'notes_personal'],
  ['identifier', 'identifier'],
  ['radicalStrokeCount', 'radical_stroke_count']
] as const
