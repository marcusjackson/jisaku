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
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { ChildRepository, Orderable } from '../types'
import type {
  CreateKunReadingInput,
  KunReading,
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
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      reading: r.reading,
      okurigana: r.okurigana,
      readingLevel: r.reading_level as KunReading['readingLevel'],
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

  create(input: CreateKunReadingInput): KunReading {
    // Get max display_order for this kanji
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM kun_readings WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
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
      throw new Error('Failed to retrieve created kun-reading')
    }

    schedulePersist()
    return created
  }

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

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(`UPDATE kun_readings SET ${sets.join(', ')} WHERE id = ?`, values)

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('KunReading disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM kun_readings WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run('UPDATE kun_readings SET display_order = ? WHERE id = ?', [
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

export function useKunReadingRepository(): KunReadingRepositoryImpl {
  return new KunReadingRepositoryImpl()
}

export type { CreateKunReadingInput, KunReading, UpdateKunReadingInput }
