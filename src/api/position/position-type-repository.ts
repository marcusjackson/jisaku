/**
 * Position Type Repository
 *
 * Data access layer for component position types (reference data).
 * These define where components appear in kanji (hen, tsukuri, etc.)
 *
 * @module api/position
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { Orderable, Repository } from '../types'
import type {
  CreatePositionTypeInput,
  PositionType,
  UpdatePositionTypeInput
} from './position-types'

// ============================================================================
// Row Type
// ============================================================================

interface PositionTypeRow {
  id: number
  position_name: string
  name_japanese: string | null
  name_english: string | null
  description: string | null
  display_order: number
}

// ============================================================================
// Repository Implementation
// ============================================================================

class PositionTypeRepositoryImpl
  extends BaseRepository<PositionType>
  implements
    Repository<PositionType, CreatePositionTypeInput, UpdatePositionTypeInput>,
    Orderable
{
  protected tableName = 'position_types'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): PositionType {
    const r = row as unknown as PositionTypeRow
    return {
      id: r.id,
      positionName: r.position_name,
      nameJapanese: r.name_japanese,
      nameEnglish: r.name_english,
      description: r.description,
      displayOrder: r.display_order
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): PositionType | null {
    const result = this.exec('SELECT * FROM position_types WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): PositionType[] {
    const result = this.exec(
      'SELECT * FROM position_types ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByPositionName(positionName: string): PositionType | null {
    const result = this.exec(
      'SELECT * FROM position_types WHERE position_name = ?',
      [positionName]
    )
    return this.resultToEntity(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreatePositionTypeInput): PositionType {
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM position_types'
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO position_types 
       (position_name, name_japanese, name_english, description, display_order)
       VALUES (?, ?, ?, ?, ?)`,
      [
        input.positionName,
        input.nameJapanese ?? null,
        input.nameEnglish ?? null,
        input.description ?? null,
        displayOrder
      ]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created position type')
    }

    schedulePersist()
    return created
  }

  update(id: number, input: UpdatePositionTypeInput): PositionType {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('PositionType', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.positionName !== undefined) {
      sets.push('position_name = ?')
      values.push(input.positionName)
    }
    if (input.nameJapanese !== undefined) {
      sets.push('name_japanese = ?')
      values.push(input.nameJapanese)
    }
    if (input.nameEnglish !== undefined) {
      sets.push('name_english = ?')
      values.push(input.nameEnglish)
    }
    if (input.description !== undefined) {
      sets.push('description = ?')
      values.push(input.description)
    }

    if (sets.length === 0) {
      return existing
    }

    values.push(id)
    this.run(
      `UPDATE position_types SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('PositionType disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM position_types WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run('UPDATE position_types SET display_order = ? WHERE id = ?', [
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

export function usePositionTypeRepository(): PositionTypeRepositoryImpl {
  return new PositionTypeRepositoryImpl()
}

export type { CreatePositionTypeInput, PositionType, UpdatePositionTypeInput }
