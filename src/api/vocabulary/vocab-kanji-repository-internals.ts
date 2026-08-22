/**
 * Vocab-Kanji Repository Internals
 *
 * Internal row types and mapping utilities for the vocab-kanji repository.
 *
 * @internal
 */

import {
  JLPT_LEVELS,
  JOYO_LEVELS,
  KANJI_KENTEI_LEVELS
} from '../kanji/kanji-types'

import { VOCAB_JLPT_LEVELS } from './vocabulary-types'

import type {
  JlptLevel,
  JoyoLevel,
  KanjiKenteiLevel
} from '../kanji/kanji-types'
import type {
  VocabJlptLevel,
  VocabKanjiWithKanji,
  VocabKanjiWithVocabulary
} from './vocabulary-types'

// ============================================================================
// Row Types
// ============================================================================

export interface VocabKanjiRow {
  id: number
  vocab_id: number
  kanji_id: number
  analysis_notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

export interface VocabKanjiWithVocabularyRow extends VocabKanjiRow {
  v_id: number
  v_word: string
  v_kana: string
  v_short_meaning: string | null
  v_search_keywords: string | null
  v_jlpt_level: string | null
  v_is_common: number
  v_description: string | null
  v_created_at: string
  v_updated_at: string
}

export interface VocabKanjiWithKanjiRow extends VocabKanjiRow {
  k_id: number
  k_character: string
  k_stroke_count: number | null
  k_short_meaning: string | null
  k_search_keywords: string | null
  k_radical_id: number | null
  k_jlpt_level: string | null
  k_joyo_level: string | null
  k_kanji_kentei_level: string | null
  k_stroke_diagram_image: Uint8Array | null
  k_stroke_gif_image: Uint8Array | null
  k_notes_etymology: string | null
  k_notes_semantic: string | null
  k_notes_education_mnemonics: string | null
  k_notes_personal: string | null
  k_identifier: number | null
  k_radical_stroke_count: number | null
  k_created_at: string
  k_updated_at: string
}

// ============================================================================
// Row Mappers
// ============================================================================

export function mapWithKanjiRow(
  row: VocabKanjiWithKanjiRow
): VocabKanjiWithKanji {
  return {
    id: row.id,
    vocabId: row.vocab_id,
    kanjiId: row.kanji_id,
    analysisNotes: row.analysis_notes,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    kanji: {
      id: row.k_id,
      character: row.k_character,
      strokeCount: row.k_stroke_count,
      shortMeaning: row.k_short_meaning,
      searchKeywords: row.k_search_keywords,
      radicalId: row.k_radical_id,
      jlptLevel:
        row.k_jlpt_level != null &&
        (JLPT_LEVELS as readonly string[]).includes(row.k_jlpt_level)
          ? (row.k_jlpt_level as JlptLevel)
          : null,
      joyoLevel:
        row.k_joyo_level != null &&
        (JOYO_LEVELS as readonly string[]).includes(row.k_joyo_level)
          ? (row.k_joyo_level as JoyoLevel)
          : null,
      kanjiKenteiLevel:
        row.k_kanji_kentei_level != null &&
        (KANJI_KENTEI_LEVELS as readonly string[]).includes(
          row.k_kanji_kentei_level
        )
          ? (row.k_kanji_kentei_level as KanjiKenteiLevel)
          : null,
      strokeDiagramImage: row.k_stroke_diagram_image,
      strokeGifImage: row.k_stroke_gif_image,
      notesEtymology: row.k_notes_etymology,
      notesSemantic: row.k_notes_semantic,
      notesEducationMnemonics: row.k_notes_education_mnemonics,
      notesPersonal: row.k_notes_personal,
      identifier: row.k_identifier,
      radicalStrokeCount: row.k_radical_stroke_count,
      createdAt: row.k_created_at,
      updatedAt: row.k_updated_at
    }
  }
}

export function mapJoinedRow(
  row: VocabKanjiWithVocabularyRow
): VocabKanjiWithVocabulary {
  return {
    vocabKanji: {
      id: row.id,
      vocabId: row.vocab_id,
      kanjiId: row.kanji_id,
      analysisNotes: row.analysis_notes,
      displayOrder: row.display_order,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    },
    vocabulary: {
      id: row.v_id,
      word: row.v_word,
      kana: row.v_kana,
      shortMeaning: row.v_short_meaning,
      searchKeywords: row.v_search_keywords,
      jlptLevel:
        row.v_jlpt_level !== null &&
        (VOCAB_JLPT_LEVELS as readonly string[]).includes(row.v_jlpt_level)
          ? (row.v_jlpt_level as VocabJlptLevel)
          : null,
      isCommon: Boolean(row.v_is_common),
      description: row.v_description,
      createdAt: row.v_created_at,
      updatedAt: row.v_updated_at
    }
  }
}
