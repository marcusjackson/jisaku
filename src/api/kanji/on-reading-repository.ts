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
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { ChildRepository, Orderable } from '../types'
import type {
  CreateOnReadingInput,
  OnReading,
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
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      reading: r.reading,
      readingLevel: r.reading_level as OnReading['readingLevel'],
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

  create(input: CreateOnReadingInput): OnReading {
    // Get max display_order for this kanji
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM on_readings WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
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
      throw new Error('Failed to retrieve created on-reading')
    }

    schedulePersist()
    return created
  }

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

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(`UPDATE on_readings SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('OnReading disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM on_readings WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run('UPDATE on_readings SET display_order = ? WHERE id = ?', [
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

export function useOnReadingRepository(): OnReadingRepositoryImpl {
  return new OnReadingRepositoryImpl()
}

export type { CreateOnReadingInput, OnReading, UpdateOnReadingInput }
