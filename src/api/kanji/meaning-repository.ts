/**
 * Kanji Meaning Repository
 *
 * Data access layer for kanji meanings/definitions.
 * Child entity of kanji with ordering support.
 *
 * @module api/kanji
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { ChildRepository, Orderable } from '../types'
import type {
  CreateKanjiMeaningInput,
  KanjiMeaning,
  UpdateKanjiMeaningInput
} from './meaning-types'

// ============================================================================
// Row Type
// ============================================================================

interface KanjiMeaningRow {
  id: number
  kanji_id: number
  meaning_text: string
  additional_info: string | null
  display_order: number
  created_at: string
  updated_at: string
}

// ============================================================================
// Repository Implementation
// ============================================================================

class KanjiMeaningRepositoryImpl
  extends BaseRepository<KanjiMeaning>
  implements
    ChildRepository<
      KanjiMeaning,
      CreateKanjiMeaningInput,
      UpdateKanjiMeaningInput
    >,
    Orderable
{
  protected tableName = 'kanji_meanings'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): KanjiMeaning {
    const r = row as unknown as KanjiMeaningRow
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      meaningText: r.meaning_text,
      additionalInfo: r.additional_info,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): KanjiMeaning | null {
    const result = this.exec('SELECT * FROM kanji_meanings WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): KanjiMeaning[] {
    const result = this.exec(
      'SELECT * FROM kanji_meanings ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByParentId(kanjiId: number): KanjiMeaning[] {
    const result = this.exec(
      'SELECT * FROM kanji_meanings WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return this.resultToList(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateKanjiMeaningInput): KanjiMeaning {
    // Get max display_order for this kanji
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM kanji_meanings WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order)
       VALUES (?, ?, ?, ?)`,
      [
        input.kanjiId,
        input.meaningText,
        input.additionalInfo ?? null,
        displayOrder
      ]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created meaning')
    }

    schedulePersist()
    return created
  }

  update(id: number, input: UpdateKanjiMeaningInput): KanjiMeaning {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('KanjiMeaning', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.meaningText !== undefined) {
      sets.push('meaning_text = ?')
      values.push(input.meaningText)
    }
    if (input.additionalInfo !== undefined) {
      sets.push('additional_info = ?')
      values.push(input.additionalInfo)
    }

    if (sets.length === 0) {
      return existing
    }

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(
      `UPDATE kanji_meanings SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('KanjiMeaning disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM kanji_meanings WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run('UPDATE kanji_meanings SET display_order = ? WHERE id = ?', [
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

export function useKanjiMeaningRepository(): KanjiMeaningRepositoryImpl {
  return new KanjiMeaningRepositoryImpl()
}

export type { CreateKanjiMeaningInput, KanjiMeaning, UpdateKanjiMeaningInput }
