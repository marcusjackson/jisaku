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
import { CreateError, EntityNotFoundError, UpdateError } from '../api-types'
import { BaseRepository } from '../base-repository'

import {
  mapJoinedRow,
  mapWithKanjiRow
} from './vocab-kanji-repository-internals'

import type { ChildRepository, Orderable } from '../api-types'
import type {
  VocabKanjiRow,
  VocabKanjiWithKanjiRow,
  VocabKanjiWithVocabularyRow
} from './vocab-kanji-repository-internals'
import type {
  CreateVocabKanjiInput,
  UpdateVocabKanjiInput,
  VocabKanji,
  VocabKanjiWithKanji,
  VocabKanjiWithVocabulary
} from './vocabulary-types'

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

  getByVocabIdWithKanji(vocabId: number): VocabKanjiWithKanji[] {
    const result = this.exec(
      `SELECT
        vk.id, vk.vocab_id, vk.kanji_id, vk.analysis_notes, vk.display_order,
        vk.created_at, vk.updated_at,
        k.id as k_id, k.character as k_character,
        k.stroke_count as k_stroke_count, k.short_meaning as k_short_meaning,
        k.search_keywords as k_search_keywords, k.radical_id as k_radical_id,
        k.jlpt_level as k_jlpt_level, k.joyo_level as k_joyo_level,
        k.kanji_kentei_level as k_kanji_kentei_level,
        k.stroke_diagram_image as k_stroke_diagram_image,
        k.stroke_gif_image as k_stroke_gif_image,
        k.notes_etymology as k_notes_etymology,
        k.notes_semantic as k_notes_semantic,
        k.notes_education_mnemonics as k_notes_education_mnemonics,
        k.notes_personal as k_notes_personal,
        k.identifier as k_identifier,
        k.radical_stroke_count as k_radical_stroke_count,
        k.created_at as k_created_at, k.updated_at as k_updated_at
      FROM vocab_kanji vk
      JOIN kanjis k ON k.id = vk.kanji_id
      WHERE vk.vocab_id = ?
      ORDER BY vk.display_order`,
      [vocabId]
    )
    if (!result[0]) return []
    const { columns, values } = result[0]
    return values.map((row) =>
      mapWithKanjiRow(
        this.rowToObject({
          columns,
          values: [row]
        }) as unknown as VocabKanjiWithKanjiRow
      )
    )
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

    const firstResult = result[0]
    return firstResult.values.map((row) =>
      mapJoinedRow(
        this.rowToObject({
          columns: firstResult.columns,
          values: [row]
        }) as unknown as VocabKanjiWithVocabularyRow
      )
    )
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateVocabKanjiInput): VocabKanji {
    const maxOrder = this.getMaxDisplayOrder(
      'vocab_kanji',
      'WHERE vocab_id = ?',
      [input.vocabId]
    )
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO vocab_kanji (vocab_id, kanji_id, analysis_notes, display_order)
       VALUES (?, ?, ?, ?)`,
      [input.vocabId, input.kanjiId, input.analysisNotes ?? null, displayOrder]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) throw new CreateError('VocabKanji')

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

    sets.push("updated_at = datetime('now')")
    values.push(id)

    this.run(`UPDATE vocab_kanji SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.getById(id)
    if (!updated) throw new UpdateError('VocabKanji', id)

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
    this.withTransaction(() => {
      ids.forEach((id, index) => {
        this.run('UPDATE vocab_kanji SET display_order = ? WHERE id = ?', [
          index,
          id
        ])
      })
    })
    schedulePersist()
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a vocab-kanji repository instance bound to the active database.
 * @returns Repository for managing kanji links within vocabulary entries (CRUD, reorder).
 * @example const repo = useVocabKanjiRepository(); repo.getByParentId(1)
 */
export function useVocabKanjiRepository(): VocabKanjiRepositoryImpl {
  return new VocabKanjiRepositoryImpl()
}
