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
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { ChildRepository, Orderable } from '../types'
import type {
  ComponentGrouping,
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

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): ComponentGrouping | null {
    const result = this.exec('SELECT * FROM component_groupings WHERE id = ?', [
      id
    ])
    return this.resultToEntity(result)
  }

  getAll(): ComponentGrouping[] {
    const result = this.exec(
      'SELECT * FROM component_groupings ORDER BY name ASC'
    )
    return this.resultToList(result)
  }

  /** Get groupings by component (parent) */
  getByParentId(componentId: number): ComponentGrouping[] {
    const result = this.exec(
      'SELECT * FROM component_groupings WHERE component_id = ? ORDER BY display_order ASC',
      [componentId]
    )
    return this.resultToList(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateComponentGroupingInput): ComponentGrouping {
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM component_groupings WHERE component_id = ?',
      [input.componentId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
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
      throw new Error('Failed to retrieve created component grouping')
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

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(
      `UPDATE component_groupings SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('ComponentGrouping disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM component_groupings WHERE id = ?', [id])
    schedulePersist()
  }

  /** Remove all groupings for a component */
  removeByComponentId(componentId: number): void {
    this.run('DELETE FROM component_groupings WHERE component_id = ?', [
      componentId
    ])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run(
        'UPDATE component_groupings SET display_order = ? WHERE id = ?',
        [index, id]
      )
    })
    schedulePersist()
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function useComponentGroupingRepository(): ComponentGroupingRepositoryImpl {
  return new ComponentGroupingRepositoryImpl()
}

export type {
  ComponentGrouping,
  CreateComponentGroupingInput,
  UpdateComponentGroupingInput
}
