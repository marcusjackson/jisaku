/**
 * Kun-Reading Repository
 *
 * Data access layer for kun-yomi (Japanese) readings.
 * Child entity of kanji with ordering support.
 *
 * @module api/kanji
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import {
  CreateError,
  EntityNotFoundError,
  RepositoryError,
  UpdateError
} from '../api-types'
import { BaseRepository } from '../base-repository'

import { READING_LEVELS } from './reading-types'

import type { ChildRepository, Orderable } from '../api-types'
import type {
  CreateKunReadingInput,
  KunReading,
  ReadingLevel,
  UpdateKunReadingInput
} from './reading-types'

// ============================================================================
// Row Type
// ============================================================================

interface KunReadingRow {
  id: number
  kanji_id: number
  reading: string
  okurigana: string | null
  reading_level: string
  display_order: number
  created_at: string
  updated_at: string
}

// ============================================================================
// Repository Implementation
// ============================================================================

class KunReadingRepositoryImpl
  extends BaseRepository<KunReading>
  implements
    ChildRepository<KunReading, CreateKunReadingInput, UpdateKunReadingInput>,
    Orderable
{
  protected tableName = 'kun_readings'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): KunReading {
    const r = row as unknown as KunReadingRow
    if (!(READING_LEVELS as readonly string[]).includes(r.reading_level)) {
      throw new RepositoryError(
        `Invalid reading_level: '${r.reading_level}'`,
        'mapRow',
        'KunReading'
      )
    }
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      reading: r.reading,
      okurigana: r.okurigana,
      readingLevel: r.reading_level as ReadingLevel,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): KunReading | null {
    const result = this.exec('SELECT * FROM kun_readings WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): KunReading[] {
    const result = this.exec(
      'SELECT * FROM kun_readings ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByParentId(kanjiId: number): KunReading[] {
    const result = this.exec(
      'SELECT * FROM kun_readings WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return this.resultToList(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  /**
   * @throws {CreateError} If the insert fails
   */
  create(input: CreateKunReadingInput): KunReading {
    const maxOrder = this.getMaxDisplayOrder(
      'kun_readings',
      'WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.kanjiId,
        input.reading,
        input.okurigana ?? null,
        input.readingLevel ?? '小',
        displayOrder
      ]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new CreateError('KunReading')
    }

    schedulePersist()
    return created
  }

  /**
   * @throws {EntityNotFoundError} If the reading does not exist
   * @throws {UpdateError} If the update fails to return
   */
  update(id: number, input: UpdateKunReadingInput): KunReading {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('KunReading', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.reading !== undefined) {
      sets.push('reading = ?')
      values.push(input.reading)
    }
    if (input.okurigana !== undefined) {
      sets.push('okurigana = ?')
      values.push(input.okurigana)
    }
    if (input.readingLevel !== undefined) {
      sets.push('reading_level = ?')
      values.push(input.readingLevel)
    }

    if (sets.length === 0) {
      return existing
    }

    sets.push("updated_at = datetime('now')")
    values.push(id)

    this.run(`UPDATE kun_readings SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.getById(id)
    if (!updated) {
      throw new UpdateError('KunReading', id)
    }

    schedulePersist()
    return updated
  }

  /**
   * Delete a kun-reading by id.
   */
  remove(id: number): void {
    this.run('DELETE FROM kun_readings WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    this.withTransaction(() => {
      ids.forEach((id, index) => {
        this.run('UPDATE kun_readings SET display_order = ? WHERE id = ?', [
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
 * Creates a kun-reading repository instance bound to the active database.
 * @returns Repository for managing kanji kun-yomi readings (CRUD, reorder).
 * @example const repo = useKunReadingRepository(); repo.getByParentId(1)
 */
export function useKunReadingRepository(): KunReadingRepositoryImpl {
  return new KunReadingRepositoryImpl()
}
