/**
 * Component Grouping Repository
 *
 * Data access layer for component groupings.
 * User-created pattern groups for organizing components.
 *
 * @module api/component
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { CreateError, EntityNotFoundError, UpdateError } from '../api-types'
import { BaseRepository } from '../base-repository'

import { mapGroupingMemberRow } from './component-grouping-repository-internals'

import type { ChildRepository, Orderable } from '../api-types'
import type {
  ComponentGrouping,
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  CreateComponentGroupingInput,
  UpdateComponentGroupingInput
} from './component-types'

// ============================================================================
// Row Type
// ============================================================================

interface ComponentGroupingRow {
  id: number
  component_id: number
  name: string
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

interface ComponentGroupingWithMembersRow extends ComponentGroupingRow {
  occurrence_count: number
}

// ============================================================================
// Repository Implementation
// ============================================================================

class ComponentGroupingRepositoryImpl
  extends BaseRepository<ComponentGrouping>
  implements
    ChildRepository<
      ComponentGrouping,
      CreateComponentGroupingInput,
      UpdateComponentGroupingInput
    >,
    Orderable
{
  protected tableName = 'component_groupings'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): ComponentGrouping {
    const r = row as unknown as ComponentGroupingRow
    return {
      id: r.id,
      componentId: r.component_id,
      name: r.name,
      description: r.description,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // Read Operations
  getById(id: number): ComponentGrouping | null {
    // prettier-ignore
    return this.resultToEntity(this.exec('SELECT * FROM component_groupings WHERE id = ?', [id]))
  }

  getAll(): ComponentGrouping[] {
    // prettier-ignore
    return this.resultToList(this.exec('SELECT * FROM component_groupings ORDER BY name ASC'))
  }

  /** Get groupings by component (parent), enriched with member count */
  getByParentId(componentId: number): ComponentGroupingWithMembers[] {
    const result = this.exec(
      `SELECT g.*, COUNT(m.id) AS occurrence_count
       FROM component_groupings g
       LEFT JOIN component_grouping_members m ON m.grouping_id = g.id
       WHERE g.component_id = ?
       GROUP BY g.id
       ORDER BY g.display_order ASC`,
      [componentId]
    )
    const firstResult = result[0]
    if (!firstResult) return []
    return firstResult.values.map((row) => {
      const obj = this.rowToObject({
        columns: firstResult.columns,
        values: [row]
      }) as unknown as ComponentGroupingWithMembersRow
      return {
        ...this.mapRow(obj as unknown as Record<string, unknown>),
        occurrenceCount: obj.occurrence_count
      }
    })
  }

  // Write Operations
  create(input: CreateComponentGroupingInput): ComponentGrouping {
    const maxOrder = this.getMaxDisplayOrder(
      'component_groupings',
      'WHERE component_id = ?',
      [input.componentId]
    )
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO component_groupings (
        component_id, name, description, display_order
      ) VALUES (?, ?, ?, ?)`,
      [input.componentId, input.name, input.description ?? null, displayOrder]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new CreateError('ComponentGrouping')
    }

    schedulePersist()
    return created
  }

  update(id: number, input: UpdateComponentGroupingInput): ComponentGrouping {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('ComponentGrouping', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.name !== undefined) {
      sets.push('name = ?')
      values.push(input.name)
    }
    if (input.description !== undefined) {
      sets.push('description = ?')
      values.push(input.description)
    }

    if (sets.length === 0) {
      return existing
    }

    sets.push("updated_at = datetime('now')")
    values.push(id)

    this.run(
      `UPDATE component_groupings SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new UpdateError('ComponentGrouping', id)
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.withTransaction(() => {
      this.run('DELETE FROM component_grouping_members WHERE grouping_id = ?', [
        id
      ])
      this.run('DELETE FROM component_groupings WHERE id = ?', [id])
    })
    schedulePersist()
  }

  /** Remove all groupings for a component */
  removeByComponentId(componentId: number): void {
    this.withTransaction(() => {
      this.run(
        `DELETE FROM component_grouping_members
       WHERE grouping_id IN (SELECT id FROM component_groupings WHERE component_id = ?)`,
        [componentId]
      )
      // prettier-ignore
      this.run('DELETE FROM component_groupings WHERE component_id = ?', [componentId])
    })
    schedulePersist()
  }

  // Ordering
  reorder(ids: number[]): void {
    this.withTransaction(() => {
      ids.forEach((id, index) => {
        this.run(
          'UPDATE component_groupings SET display_order = ? WHERE id = ?',
          [index, id]
        )
      })
    })
    schedulePersist()
  }

  /** Get all members for a grouping ordered by display_order */
  getMembers(groupingId: number): ComponentGroupingMember[] {
    const result = this.exec(
      'SELECT * FROM component_grouping_members WHERE grouping_id = ? ORDER BY display_order ASC',
      [groupingId]
    )
    const firstResult = result[0]
    if (!firstResult) return []
    return firstResult.values.map((row) =>
      mapGroupingMemberRow(
        this.rowToObject({ columns: firstResult.columns, values: [row] })
      )
    )
  }

  /** Get all members for all groupings of a component, grouped by grouping ID */
  getMembersByComponentId(
    componentId: number
  ): Map<number, ComponentGroupingMember[]> {
    const result = this.exec(
      `SELECT m.* FROM component_grouping_members m
       INNER JOIN component_groupings g ON g.id = m.grouping_id
       WHERE g.component_id = ?
       ORDER BY m.display_order ASC`,
      [componentId]
    )
    const map = new Map<number, ComponentGroupingMember[]>()
    const firstResult = result[0]
    if (!firstResult) return map
    for (const row of firstResult.values) {
      const member = mapGroupingMemberRow(
        this.rowToObject({ columns: firstResult.columns, values: [row] })
      )
      const existing = map.get(member.groupingId)
      if (existing) {
        existing.push(member)
      } else {
        map.set(member.groupingId, [member])
      }
    }
    return map
  }

  /**
   * Add a member to a grouping (idempotent via INSERT OR IGNORE).
   *
   * @returns `true` if the member was inserted, `false` if it already existed.
   */
  addMember(groupingId: number, occurrenceId: number): boolean {
    const maxOrder = this.getMaxDisplayOrder(
      'component_grouping_members',
      'WHERE grouping_id = ?',
      [groupingId]
    )
    this.run(
      'INSERT OR IGNORE INTO component_grouping_members (grouping_id, occurrence_id, display_order) VALUES (?, ?, ?)',
      [groupingId, occurrenceId, maxOrder + 1]
    )
    schedulePersist()
    const changesResult = this.exec('SELECT changes() as rows_changed')
    return ((changesResult[0]?.values[0]?.[0] as number | null) ?? 0) > 0
  }

  /** Remove a member from a grouping */
  removeMember(groupingId: number, occurrenceId: number): void {
    this.run(
      'DELETE FROM component_grouping_members WHERE grouping_id = ? AND occurrence_id = ?',
      [groupingId, occurrenceId]
    )
    schedulePersist()
  }

  /** Reorder members within a grouping */
  reorderMembers(groupingId: number, occurrenceIds: number[]): void {
    this.withTransaction(() => {
      occurrenceIds.forEach((occurrenceId, index) => {
        this.run(
          'UPDATE component_grouping_members SET display_order = ? WHERE grouping_id = ? AND occurrence_id = ?',
          [index, groupingId, occurrenceId]
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
 * Creates a component grouping repository instance bound to the active database.
 * @returns Repository for managing component groupings with members.
 * @example const repo = useComponentGroupingRepository(); repo.getByParentId(1)
 */
export function useComponentGroupingRepository(): ComponentGroupingRepositoryImpl {
  return new ComponentGroupingRepositoryImpl()
}
