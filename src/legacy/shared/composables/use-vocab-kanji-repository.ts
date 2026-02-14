/**
 * Vocab-Kanji Repository Composable
 *
 * Provides data access methods for vocab-kanji junction table.
 * Manages the kanji breakdown for vocabulary entries.
 */

import { useDatabase } from '@/legacy/shared/composables/use-database'
import { useKanjiRepository } from '@/legacy/shared/composables/use-kanji-repository'
import { useVocabularyRepository } from '@/legacy/shared/composables/use-vocabulary-repository'

import type {
  VocabKanji,
  VocabKanjiWithKanji,
  VocabKanjiWithVocab
} from '@/legacy/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface VocabKanjiRow {
  id: number
  vocab_id: number
  kanji_id: number
  analysis_notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

function mapRowToVocabKanji(row: VocabKanjiRow): VocabKanji {
  return {
    id: row.id,
    vocabId: row.vocab_id,
    kanjiId: row.kanji_id,
    analysisNotes: row.analysis_notes,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToVocabKanjiList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): VocabKanji[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToVocabKanji(obj as unknown as VocabKanjiRow)
  })
}

// =============================================================================
// Composable
// =============================================================================

export interface UseVocabKanjiRepository {
  /** Get all vocab-kanji entries for a vocabulary */
  getByVocabId: (vocabId: number) => VocabKanji[]
  /** Get all vocab-kanji entries for a vocabulary with full kanji data */
  getByVocabIdWithKanji: (vocabId: number) => VocabKanjiWithKanji[]
  /** Get all vocab-kanji entries for a kanji */
  getByKanjiId: (kanjiId: number) => VocabKanji[]
  /** Get all vocab-kanji entries for a kanji with full vocabulary data */
  getByKanjiIdWithVocab: (kanjiId: number) => VocabKanjiWithVocab[]
  /** Create a new vocab-kanji link */
  create: (vocabId: number, kanjiId: number) => VocabKanji
  /** Update analysis notes */
  updateAnalysisNotes: (id: number, notes: string | null) => VocabKanji
  /** Reorder kanji in breakdown (updates display_order) */
  reorder: (vocabKanjiIds: number[]) => void
  /** Remove a vocab-kanji link */
  remove: (id: number) => void
  /** Remove a vocab-kanji link by vocab ID and kanji ID */
  removeByVocabAndKanji: (vocabId: number, kanjiId: number) => void
}

export function useVocabKanjiRepository(): UseVocabKanjiRepository {
  const { exec, run } = useDatabase()
  const kanjiRepo = useKanjiRepository()
  const vocabRepo = useVocabularyRepository()

  function getByVocabId(vocabId: number): VocabKanji[] {
    const result = exec(
      `
      SELECT id, vocab_id, kanji_id, analysis_notes, display_order,
             created_at, updated_at
      FROM vocab_kanji
      WHERE vocab_id = ?
      ORDER BY display_order
    `,
      [vocabId]
    )
    return resultToVocabKanjiList(result)
  }

  function getByVocabIdWithKanji(vocabId: number): VocabKanjiWithKanji[] {
    const vocabKanjiList = getByVocabId(vocabId)

    return vocabKanjiList.map((vk) => {
      const kanji = kanjiRepo.getById(vk.kanjiId)
      if (!kanji) {
        throw new Error(`Kanji with id ${String(vk.kanjiId)} not found`)
      }
      return { ...vk, kanji }
    })
  }

  function getByKanjiId(kanjiId: number): VocabKanji[] {
    const result = exec(
      `
      SELECT id, vocab_id, kanji_id, analysis_notes, display_order,
             created_at, updated_at
      FROM vocab_kanji
      WHERE kanji_id = ?
      ORDER BY display_order
    `,
      [kanjiId]
    )
    return resultToVocabKanjiList(result)
  }

  function getByKanjiIdWithVocab(kanjiId: number): VocabKanjiWithVocab[] {
    const vocabKanjiList = getByKanjiId(kanjiId)

    return vocabKanjiList.map((vk) => {
      const vocabulary = vocabRepo.getById(vk.vocabId)
      if (!vocabulary) {
        throw new Error(`Vocabulary with id ${String(vk.vocabId)} not found`)
      }
      return { ...vk, vocabulary }
    })
  }

  function create(vocabId: number, kanjiId: number): VocabKanji {
    // Get next display_order
    const countResult = exec(
      'SELECT COUNT(*) FROM vocab_kanji WHERE vocab_id = ?',
      [vocabId]
    )
    const nextOrder = (countResult[0]?.values[0]?.[0] ?? 0) as number

    run(
      `
      INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order)
      VALUES (?, ?, ?)
    `,
      [vocabId, kanjiId, nextOrder]
    )

    const result = exec('SELECT last_insert_rowid()')
    const id = result[0]?.values[0]?.[0] as number

    const created = exec(
      `
      SELECT id, vocab_id, kanji_id, analysis_notes, display_order,
             created_at, updated_at
      FROM vocab_kanji
      WHERE id = ?
    `,
      [id]
    )

    const list = resultToVocabKanjiList(created)
    if (!list[0]) throw new Error('Failed to create vocab_kanji')
    return list[0]
  }

  function updateAnalysisNotes(id: number, notes: string | null): VocabKanji {
    run(
      `
      UPDATE vocab_kanji
      SET analysis_notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [notes, id]
    )

    const result = exec(
      `
      SELECT id, vocab_id, kanji_id, analysis_notes, display_order,
             created_at, updated_at
      FROM vocab_kanji
      WHERE id = ?
    `,
      [id]
    )

    const list = resultToVocabKanjiList(result)
    if (!list[0]) throw new Error(`VocabKanji with id ${String(id)} not found`)
    return list[0]
  }

  function reorder(vocabKanjiIds: number[]): void {
    vocabKanjiIds.forEach((id, index) => {
      run(
        `
        UPDATE vocab_kanji
        SET display_order = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [index, id]
      )
    })
  }

  function remove(id: number): void {
    // Get vocab_id to renumber remaining items
    const result = exec('SELECT vocab_id FROM vocab_kanji WHERE id = ?', [id])
    if (!result[0]?.values[0]) return

    const vocabId = result[0].values[0][0] as number

    // Delete the entry
    run('DELETE FROM vocab_kanji WHERE id = ?', [id])

    // Renumber remaining entries
    const remaining = exec(
      `
      SELECT id FROM vocab_kanji WHERE vocab_id = ? ORDER BY display_order
    `,
      [vocabId]
    )

    if (remaining[0]?.values) {
      remaining[0].values.forEach((row, index) => {
        run('UPDATE vocab_kanji SET display_order = ? WHERE id = ?', [
          index,
          row[0]
        ])
      })
    }
  }

  function removeByVocabAndKanji(vocabId: number, kanjiId: number): void {
    // Find the entry
    const result = exec(
      'SELECT id FROM vocab_kanji WHERE vocab_id = ? AND kanji_id = ?',
      [vocabId, kanjiId]
    )
    const id = result[0]?.values[0]?.[0] as number | undefined
    if (id !== undefined) {
      remove(id)
    }
  }

  return {
    create,
    getByKanjiId,
    getByKanjiIdWithVocab,
    getByVocabId,
    getByVocabIdWithKanji,
    remove,
    removeByVocabAndKanji,
    reorder,
    updateAnalysisNotes
  }
}
