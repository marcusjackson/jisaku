/**
 * Kanji Repository
 *
 * Data access layer for kanji entities.
 * Implements CRUD operations, field-level updates, and search.
 *
 * @module api/kanji
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import {
  buildKanjiSearchConditions,
  KANJI_FIELD_COLUMNS,
  mapKanjiInputToValues,
  mapKanjiRow
} from './kanji-repository-internals'

import type { FieldUpdatable, Repository, UpdatableField } from '../types'
import type {
  CreateKanjiInput,
  Kanji,
  KanjiFilters,
  KanjiSortOptions,
  UpdateKanjiInput
} from './kanji-types'

// ============================================================================
// Repository Implementation
// ============================================================================

class KanjiRepositoryImpl
  extends BaseRepository<Kanji>
  implements
    Repository<Kanji, CreateKanjiInput, UpdateKanjiInput>,
    FieldUpdatable<Kanji>
{
  protected tableName = 'kanjis'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): Kanji {
    return mapKanjiRow(row)
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): Kanji | null {
    const result = this.exec('SELECT * FROM kanjis WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): Kanji[] {
    const result = this.exec('SELECT * FROM kanjis ORDER BY id DESC')
    return this.resultToList(result)
  }

  getByCharacter(character: string): Kanji | null {
    const result = this.exec('SELECT * FROM kanjis WHERE character = ?', [
      character
    ])
    return this.resultToEntity(result)
  }

  getByIds(ids: number[]): Kanji[] {
    if (ids.length === 0) return []
    const placeholders = ids.map(() => '?').join(', ')
    const result = this.exec(
      `SELECT * FROM kanjis WHERE id IN (${placeholders}) ORDER BY id`,
      ids
    )
    return this.resultToList(result)
  }

  /**
   * Search kanji with filters
   */
  search(filters?: KanjiFilters, sort?: KanjiSortOptions): Kanji[] {
    if (!filters || Object.keys(filters).length === 0) {
      return this.getAll()
    }

    const { conditions, params } = buildKanjiSearchConditions(filters)

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    let orderBy = 'ORDER BY created_at DESC'
    if (sort) {
      const column = this.camelToSnake(sort.field)
      orderBy = `ORDER BY ${column} ${sort.direction.toUpperCase()}`
    }

    const sql = `SELECT * FROM kanjis ${whereClause} ${orderBy}`
    const result = this.exec(sql, params)
    return this.resultToList(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateKanjiInput): Kanji {
    const sql = `
      INSERT INTO kanjis (
        character, stroke_count, short_meaning, search_keywords,
        radical_id, jlpt_level, joyo_level, kanji_kentei_level,
        stroke_diagram_image, stroke_gif_image,
        notes_etymology, notes_semantic, notes_education_mnemonics, notes_personal,
        identifier, radical_stroke_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    this.run(sql, mapKanjiInputToValues(input))

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created kanji')
    }

    schedulePersist()
    return created
  }

  update(id: number, input: UpdateKanjiInput): Kanji {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('Kanji', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    for (const [key, column] of KANJI_FIELD_COLUMNS) {
      if (input[key] !== undefined) {
        sets.push(`${column} = ?`)
        values.push(input[key])
      }
    }

    if (sets.length === 0) {
      return existing
    }

    sets.push('updated_at = datetime("now")')
    values.push(id)

    const sql = `UPDATE kanjis SET ${sets.join(', ')} WHERE id = ?`
    this.run(sql, values)

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('Kanji disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    // Delete related records first (cascade)
    this.run('DELETE FROM component_occurrences WHERE kanji_id = ?', [id])
    this.run('DELETE FROM kanji_classifications WHERE kanji_id = ?', [id])
    this.run('DELETE FROM on_readings WHERE kanji_id = ?', [id])
    this.run('DELETE FROM kun_readings WHERE kanji_id = ?', [id])
    this.run('DELETE FROM kanji_meanings WHERE kanji_id = ?', [id])
    this.run('DELETE FROM vocab_kanji WHERE kanji_id = ?', [id])

    // Delete the kanji
    this.run('DELETE FROM kanjis WHERE id = ?', [id])

    schedulePersist()
  }

  // ==========================================================================
  // Field-Level Updates
  // ==========================================================================

  updateField<K extends UpdatableField<Kanji>>(
    id: number,
    field: K,
    value: Kanji[K]
  ): Kanji {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('Kanji', id)
    }

    const column = this.camelToSnake(field as string)
    const sql = `UPDATE kanjis SET ${column} = ?, updated_at = datetime("now") WHERE id = ?`
    this.run(sql, [value, id])

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('Kanji disappeared after field update')
    }

    schedulePersist()
    return updated
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a kanji repository instance
 *
 * @example
 * const kanjiRepo = useKanjiRepository()
 * const allKanji = kanjiRepo.getAll()
 * const kanji = kanjiRepo.getByCharacter('日')
 */
export function useKanjiRepository(): KanjiRepositoryImpl {
  return new KanjiRepositoryImpl()
}

// Re-export types
export type { CreateKanjiInput, Kanji, KanjiFilters, UpdateKanjiInput }
