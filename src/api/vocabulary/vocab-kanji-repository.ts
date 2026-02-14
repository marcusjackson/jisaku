/**
 * Vocab-Kanji Repository
 *
 * Data access layer for vocab-kanji junction table.
 * Links vocabulary entries to their constituent kanji.
 *
 * @module api/vocabulary
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { ChildRepository, Orderable } from '../types'
import type {
  CreateVocabKanjiInput,
  UpdateVocabKanjiInput,
  VocabKanji,
  VocabKanjiWithVocabulary,
  Vocabulary
} from './vocabulary-types'

// ============================================================================
// Row Type
// ============================================================================

interface VocabKanjiRow {
  id: number
  vocab_id: number
  kanji_id: number
  analysis_notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

interface VocabKanjiWithVocabularyRow extends VocabKanjiRow {
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

// ============================================================================
// Repository Implementation
// ============================================================================

class VocabKanjiRepositoryImpl
  extends BaseRepository<VocabKanji>
  implements
    ChildRepository<VocabKanji, CreateVocabKanjiInput, UpdateVocabKanjiInput>,
    Orderable
{
  protected tableName = 'vocab_kanji'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): VocabKanji {
    const r = row as unknown as VocabKanjiRow
    return {
      id: r.id,
      vocabId: r.vocab_id,
      kanjiId: r.kanji_id,
      analysisNotes: r.analysis_notes,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): VocabKanji | null {
    const result = this.exec('SELECT * FROM vocab_kanji WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): VocabKanji[] {
    const result = this.exec(
      'SELECT * FROM vocab_kanji ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByParentId(vocabId: number): VocabKanji[] {
    const result = this.exec(
      'SELECT * FROM vocab_kanji WHERE vocab_id = ? ORDER BY display_order ASC',
      [vocabId]
    )
    return this.resultToList(result)
  }

  getByKanjiId(kanjiId: number): VocabKanji[] {
    const result = this.exec(
      'SELECT * FROM vocab_kanji WHERE kanji_id = ? ORDER BY vocab_id, display_order',
      [kanjiId]
    )
    return this.resultToList(result)
  }

  private mapJoinedRow(
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
        jlptLevel: row.v_jlpt_level as Vocabulary['jlptLevel'],
        isCommon: Boolean(row.v_is_common),
        description: row.v_description,
        createdAt: row.v_created_at,
        updatedAt: row.v_updated_at
      }
    }
  }

  getByKanjiIdWithVocabulary(kanjiId: number): VocabKanjiWithVocabulary[] {
    const result = this.exec(
      `SELECT 
        vk.id, vk.vocab_id, vk.kanji_id, vk.analysis_notes, vk.display_order,
        vk.created_at, vk.updated_at,
        v.id as v_id, v.word as v_word, v.kana as v_kana, 
        v.short_meaning as v_short_meaning, v.search_keywords as v_search_keywords,
        v.jlpt_level as v_jlpt_level, v.is_common as v_is_common,
        v.description as v_description, v.created_at as v_created_at, 
        v.updated_at as v_updated_at
      FROM vocab_kanji vk
      INNER JOIN vocabulary v ON vk.vocab_id = v.id
      WHERE vk.kanji_id = ?
      ORDER BY v.word ASC`,
      [kanjiId]
    )

    if (!result[0]?.values.length) {
      return []
    }

    const columns = result[0].columns
    const rows = result[0].values

    return rows.map((row) => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col, idx) => {
        obj[col] = row[idx]
      })
      return this.mapJoinedRow(obj as unknown as VocabKanjiWithVocabularyRow)
    })
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateVocabKanjiInput): VocabKanji {
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM vocab_kanji WHERE vocab_id = ?',
      [input.vocabId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO vocab_kanji (vocab_id, kanji_id, analysis_notes, display_order)
       VALUES (?, ?, ?, ?)`,
      [input.vocabId, input.kanjiId, input.analysisNotes ?? null, displayOrder]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) throw new Error('Failed to retrieve created vocab-kanji link')

    schedulePersist()
    return created
  }

  update(id: number, input: UpdateVocabKanjiInput): VocabKanji {
    const existing = this.getById(id)
    if (!existing) throw new EntityNotFoundError('VocabKanji', id)

    const sets: string[] = []
    const values: unknown[] = []

    if (input.analysisNotes !== undefined) {
      sets.push('analysis_notes = ?')
      values.push(input.analysisNotes)
    }
    if (input.displayOrder !== undefined) {
      sets.push('display_order = ?')
      values.push(input.displayOrder)
    }
    if (sets.length === 0) return existing

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(`UPDATE vocab_kanji SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.getById(id)
    if (!updated) throw new Error('VocabKanji disappeared after update')

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM vocab_kanji WHERE id = ?', [id])
    schedulePersist()
  }

  removeByVocabId(vocabId: number): void {
    this.run('DELETE FROM vocab_kanji WHERE vocab_id = ?', [vocabId])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run('UPDATE vocab_kanji SET display_order = ? WHERE id = ?', [
        index,
        id
      ])
    })
    schedulePersist()
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function useVocabKanjiRepository(): VocabKanjiRepositoryImpl {
  return new VocabKanjiRepositoryImpl()
}

export type {
  CreateVocabKanjiInput,
  UpdateVocabKanjiInput,
  VocabKanji,
  VocabKanjiWithVocabulary
}
