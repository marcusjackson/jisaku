/**
 * Kanji Meaning Group Member Repository
 *
 * Data access layer for the junction table linking meanings to reading groups.
 * Manages many-to-many relationships with ordering support within groups.
 *
 * @module api/kanji
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { CreateError } from '../api-types'
import { BaseRepository } from '../base-repository'

import type { Orderable } from '../api-types'
import type {
  CreateGroupMemberInput,
  KanjiMeaningGroupMember
} from './group-member-types'

// ============================================================================
// Row Type
// ============================================================================

interface GroupMemberRow {
  id: number
  reading_group_id: number
  meaning_id: number
  display_order: number
  created_at: string
  updated_at: string
}

// ============================================================================
// Repository Implementation
// ============================================================================

class GroupMemberRepositoryImpl
  extends BaseRepository<KanjiMeaningGroupMember>
  implements Orderable
{
  protected tableName = 'kanji_meaning_group_members'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): KanjiMeaningGroupMember {
    const r = row as unknown as GroupMemberRow
    return {
      id: r.id,
      readingGroupId: r.reading_group_id,
      meaningId: r.meaning_id,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): KanjiMeaningGroupMember | null {
    const result = this.exec(
      'SELECT * FROM kanji_meaning_group_members WHERE id = ?',
      [id]
    )
    return this.resultToEntity(result)
  }

  getAll(): KanjiMeaningGroupMember[] {
    const result = this.exec(
      'SELECT * FROM kanji_meaning_group_members ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  /**
   * Get all members for a specific reading group
   */
  getByGroupId(groupId: number): KanjiMeaningGroupMember[] {
    const result = this.exec(
      'SELECT * FROM kanji_meaning_group_members WHERE reading_group_id = ? ORDER BY display_order ASC',
      [groupId]
    )
    return this.resultToList(result)
  }

  /**
   * Get all members for a kanji (across all its reading groups)
   */
  getByKanjiId(kanjiId: number): KanjiMeaningGroupMember[] {
    const sql = `
      SELECT gmm.* 
      FROM kanji_meaning_group_members gmm
      JOIN kanji_meaning_reading_groups rg ON rg.id = gmm.reading_group_id
      WHERE rg.kanji_id = ?
      ORDER BY gmm.reading_group_id ASC, gmm.display_order ASC
    `
    const result = this.exec(sql, [kanjiId])
    return this.resultToList(result)
  }

  /**
   * Get member by group and meaning IDs
   */
  getByGroupAndMeaning(
    groupId: number,
    meaningId: number
  ): KanjiMeaningGroupMember | null {
    const result = this.exec(
      'SELECT * FROM kanji_meaning_group_members WHERE reading_group_id = ? AND meaning_id = ?',
      [groupId, meaningId]
    )
    return this.resultToEntity(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateGroupMemberInput): KanjiMeaningGroupMember {
    // Get current max display_order for this group
    const maxOrder = this.getMaxDisplayOrder(
      'kanji_meaning_group_members',
      'WHERE reading_group_id = ?',
      [input.readingGroupId]
    )
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order)
      VALUES (?, ?, ?)
    `
    this.run(sql, [input.readingGroupId, input.meaningId, displayOrder])

    // Get the newly created member
    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = this.getById(newId)
    if (!created) {
      throw new CreateError('KanjiMeaningGroupMember')
    }

    schedulePersist()
    return created
  }

  /**
   * Remove a meaning from a reading group
   */
  remove(id: number): void {
    this.run('DELETE FROM kanji_meaning_group_members WHERE id = ?', [id])
    schedulePersist()
  }

  /**
   * Remove by group and meaning IDs
   */
  removeByGroupAndMeaning(groupId: number, meaningId: number): void {
    this.run(
      'DELETE FROM kanji_meaning_group_members WHERE reading_group_id = ? AND meaning_id = ?',
      [groupId, meaningId]
    )
    schedulePersist()
  }

  /**
   * Remove all members for a specific reading group
   */
  removeAllByGroupId(groupId: number): void {
    this.run(
      'DELETE FROM kanji_meaning_group_members WHERE reading_group_id = ?',
      [groupId]
    )
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    this.withTransaction(() => {
      ids.forEach((id, index) => {
        this.run(
          'UPDATE kanji_meaning_group_members SET display_order = ? WHERE id = ?',
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
 * Creates a group member repository instance bound to the active database.
 * @returns Repository for managing meaning-to-reading-group memberships.
 * @example const repo = useGroupMemberRepository(); repo.getByGroupId(1)
 */
export function useGroupMemberRepository(): GroupMemberRepositoryImpl {
  return new GroupMemberRepositoryImpl()
}
