/**
 * Component Occurrence Repository Internals
 *
 * Internal row types and mapping utilities for the occurrence repository.
 *
 * @internal
 */

import type { OccurrenceWithKanji } from './component-types'

// ============================================================================
// Row Types
// ============================================================================

/** Row type for component_occurrences table */
export interface ComponentOccurrenceRow {
  id: number
  kanji_id: number
  component_id: number
  component_form_id: number | null
  position_type_id: number | null
  is_radical: number
  analysis_notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

/** Typed row for the joined occurrence+kanji+position query */
export interface OccurrenceWithKanjiRow extends ComponentOccurrenceRow {
  k_id: number
  k_character: string
  k_short_meaning: string | null
  k_stroke_count: number | null
  pt_id: number | null
  position_name: string | null
  name_japanese: string | null
  name_english: string | null
  pt_description: string | null
  pt_display_order: number | null
  pt_created_at: string | null
  pt_updated_at: string | null
}

// ============================================================================
// Row Mapper
// ============================================================================

/** Map a typed joined row to OccurrenceWithKanji */
export function mapOccurrenceWithKanjiRow(
  r: OccurrenceWithKanjiRow
): OccurrenceWithKanji {
  return {
    id: r.id,
    kanjiId: r.kanji_id,
    componentId: r.component_id,
    componentFormId: r.component_form_id,
    positionTypeId: r.position_type_id,
    isRadical: Boolean(r.is_radical),
    analysisNotes: r.analysis_notes,
    displayOrder: r.display_order,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    kanji: {
      id: r.k_id,
      character: r.k_character,
      shortMeaning: r.k_short_meaning,
      strokeCount: r.k_stroke_count
    },
    position:
      r.pt_id === null
        ? null
        : {
            id: r.pt_id,
            positionName: r.position_name ?? '',
            nameJapanese: r.name_japanese,
            nameEnglish: r.name_english,
            description: r.pt_description,
            displayOrder: r.pt_display_order ?? 0,
            createdAt: r.pt_created_at ?? '',
            updatedAt: r.pt_updated_at ?? ''
          }
  }
}
