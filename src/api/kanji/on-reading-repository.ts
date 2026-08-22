/**
 * On-Reading Repository
 *
 * Data access layer for on-yomi (Chinese) readings.
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
  CreateOnReadingInput,
  OnReading,
  ReadingLevel,
  UpdateOnReadingInput
} from './reading-types'

// ============================================================================
// Row Type
// ============================================================================

interface OnReadingRow {
  id: number
  kanji_id: number
  reading: string
  reading_level: string
  display_order: number
  created_at: string
  updated_at: string
}

// ============================================================================
// Repository Implementation
// ============================================================================

class OnReadingRepositoryImpl
  extends BaseRepository<OnReading>
  implements
    ChildRepository<OnReading, CreateOnReadingInput, UpdateOnReadingInput>,
    Orderable
{
  protected tableName = 'on_readings'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): OnReading {
    const r = row as unknown as OnReadingRow
    if (!(READING_LEVELS as readonly string[]).includes(r.reading_level)) {
      throw new RepositoryError(
        `Invalid reading_level: '${r.reading_level}'`,
        'mapRow',
        'OnReading'
      )
    }
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      reading: r.reading,
      readingLevel: r.reading_level as ReadingLevel,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): OnReading | null {
    const result = this.exec('SELECT * FROM on_readings WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): OnReading[] {
    const result = this.exec(
      'SELECT * FROM on_readings ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByParentId(kanjiId: number): OnReading[] {
    const result = this.exec(
      'SELECT * FROM on_readings WHERE kanji_id = ? ORDER BY display_order ASC',
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
  create(input: CreateOnReadingInput): OnReading {
    const maxOrder = this.getMaxDisplayOrder(
      'on_readings',
      'WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO on_readings (kanji_id, reading, reading_level, display_order)
       VALUES (?, ?, ?, ?)`,
      [input.kanjiId, input.reading, input.readingLevel ?? '小', displayOrder]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new CreateError('OnReading')
    }

    schedulePersist()
    return created
  }

  /**
   * @throws {EntityNotFoundError} If the reading does not exist
   * @throws {UpdateError} If the update fails to return
   */
  update(id: number, input: UpdateOnReadingInput): OnReading {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('OnReading', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.reading !== undefined) {
      sets.push('reading = ?')
      values.push(input.reading)
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

    this.run(`UPDATE on_readings SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.getById(id)
    if (!updated) {
      throw new UpdateError('OnReading', id)
    }

    schedulePersist()
    return updated
  }

  /**
   * Delete an on-reading by id.
   */
  remove(id: number): void {
    this.run('DELETE FROM on_readings WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    this.withTransaction(() => {
      ids.forEach((id, index) => {
        this.run('UPDATE on_readings SET display_order = ? WHERE id = ?', [
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
 * Creates an on-reading repository instance bound to the active database.
 * @returns Repository for managing kanji on-yomi readings (CRUD, reorder).
 * @example const repo = useOnReadingRepository(); repo.getByParentId(1)
 */
export function useOnReadingRepository(): OnReadingRepositoryImpl {
  return new OnReadingRepositoryImpl()
}
