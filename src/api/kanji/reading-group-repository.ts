/**
 * Kanji Meaning Reading Group Repository
 *
 * Data access layer for reading groups that organize kanji meanings.
 * Child entity of kanji with ordering support.
 *
 * @module api/kanji
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { CreateError, EntityNotFoundError, UpdateError } from '../api-types'
import { BaseRepository } from '../base-repository'

import type { ChildRepository, Orderable } from '../api-types'
import type {
  CreateReadingGroupInput,
  KanjiMeaningReadingGroup,
  UpdateReadingGroupInput
} from './reading-group-types'

// ============================================================================
// Row Type
// ============================================================================

interface ReadingGroupRow {
  id: number
  kanji_id: number
  reading_text: string
  display_order: number
  created_at: string
  updated_at: string
}

// ============================================================================
// Repository Implementation
// ============================================================================

class ReadingGroupRepositoryImpl
  extends BaseRepository<KanjiMeaningReadingGroup>
  implements
    ChildRepository<
      KanjiMeaningReadingGroup,
      CreateReadingGroupInput,
      UpdateReadingGroupInput
    >,
    Orderable
{
  protected tableName = 'kanji_meaning_reading_groups'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): KanjiMeaningReadingGroup {
    const r = row as unknown as ReadingGroupRow
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      readingText: r.reading_text,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): KanjiMeaningReadingGroup | null {
    const result = this.exec(
      'SELECT * FROM kanji_meaning_reading_groups WHERE id = ?',
      [id]
    )
    return this.resultToEntity(result)
  }

  getAll(): KanjiMeaningReadingGroup[] {
    const result = this.exec(
      'SELECT * FROM kanji_meaning_reading_groups ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByParentId(kanjiId: number): KanjiMeaningReadingGroup[] {
    const result = this.exec(
      'SELECT * FROM kanji_meaning_reading_groups WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return this.resultToList(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateReadingGroupInput): KanjiMeaningReadingGroup {
    // Get current max display_order for this kanji
    const maxOrder = this.getMaxDisplayOrder(
      'kanji_meaning_reading_groups',
      'WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order)
      VALUES (?, ?, ?)
    `
    this.run(sql, [input.kanjiId, input.readingText, displayOrder])

    // Get the newly created group
    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = this.getById(newId)
    if (!created) {
      throw new CreateError('KanjiMeaningReadingGroup')
    }

    schedulePersist()
    return created
  }

  update(id: number, input: UpdateReadingGroupInput): KanjiMeaningReadingGroup {
    // Check if group exists
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('KanjiMeaningReadingGroup', id)
    }

    // Build update query
    const sets: string[] = []
    const values: unknown[] = []

    if (input.readingText !== undefined) {
      sets.push('reading_text = ?')
      values.push(input.readingText)
    }

    // If no fields to update, return unchanged
    if (sets.length === 0) {
      return existing
    }

    sets.push("updated_at = datetime('now')")
    values.push(id)
    const sql = `UPDATE kanji_meaning_reading_groups SET ${sets.join(', ')} WHERE id = ?`
    this.run(sql, values)

    const updated = this.getById(id)
    if (!updated) {
      throw new UpdateError('KanjiMeaningReadingGroup', id)
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.withTransaction(() => {
      this.run(
        'DELETE FROM kanji_meaning_group_members WHERE reading_group_id = ?',
        [id]
      )
      this.run('DELETE FROM kanji_meaning_reading_groups WHERE id = ?', [id])
    })
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    this.withTransaction(() => {
      ids.forEach((id, index) => {
        this.run(
          'UPDATE kanji_meaning_reading_groups SET display_order = ? WHERE id = ?',
          [index, id]
        )
      })
    })
    schedulePersist()
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a reading group repository instance bound to the active database.
 * @returns Repository for managing kanji meaning reading groups (CRUD, reorder).
 * @example const repo = useReadingGroupRepository(); repo.getByParentId(1)
 */
export function useReadingGroupRepository(): ReadingGroupRepositoryImpl {
  return new ReadingGroupRepositoryImpl()
}
