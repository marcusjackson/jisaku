/**
 * Component Grouping Repository Composable
 *
 * Provides data access methods for component grouping entries.
 * Handles CRUD operations and member management for user-created
 * groups of component occurrences for pattern analysis.
 */

import { useDatabase } from '@/legacy/shared/composables/use-database'

import type {
  ComponentGrouping,
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  CreateComponentGroupingInput,
  UpdateComponentGroupingInput
} from '@/legacy/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface ComponentGroupingRow {
  id: number
  component_id: number
  name: string
  description: string | null
  display_order: number
  created_at: string
  updated_at: string
}

interface ComponentGroupingMemberRow {
  id: number
  grouping_id: number
  occurrence_id: number
  display_order: number
  created_at: string
  updated_at: string
}

function mapRowToGrouping(row: ComponentGroupingRow): ComponentGrouping {
  return {
    id: row.id,
    componentId: row.component_id,
    name: row.name,
    description: row.description,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapRowToMember(
  row: ComponentGroupingMemberRow
): ComponentGroupingMember {
  return {
    id: row.id,
    groupingId: row.grouping_id,
    occurrenceId: row.occurrence_id,
    displayOrder: row.display_order
  }
}

function resultToGroupingList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): ComponentGrouping[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToGrouping(obj as unknown as ComponentGroupingRow)
  })
}

function resultToMemberList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): ComponentGroupingMember[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToMember(obj as unknown as ComponentGroupingMemberRow)
  })
}

// =============================================================================
// Composable
// =============================================================================

export interface UseComponentGroupingRepository {
  /** Get all groupings for a component with occurrence count */
  getByComponentId: (componentId: number) => ComponentGroupingWithMembers[]
  /** Get a single grouping by ID */
  getById: (id: number) => ComponentGrouping | null
  /** Get members for a grouping */
  getMembers: (groupingId: number) => ComponentGroupingMember[]
  /** Create a new component grouping */
  create: (input: CreateComponentGroupingInput) => ComponentGrouping
  /** Update a component grouping */
  update: (id: number, input: UpdateComponentGroupingInput) => void
  /** Delete a component grouping */
  remove: (id: number) => void
  /** Reorder groupings by setting display_order based on array position */
  reorder: (groupingIds: number[]) => void
  /** Get next display order for a component's groupings */
  getNextDisplayOrder: (componentId: number) => number
  /** Add an occurrence to a grouping */
  addMember: (groupingId: number, occurrenceId: number) => void
  /** Remove an occurrence from a grouping */
  removeMember: (groupingId: number, occurrenceId: number) => void
  /** Reorder members within a grouping */
  reorderMembers: (groupingId: number, occurrenceIds: number[]) => void
}

export function useComponentGroupingRepository(): UseComponentGroupingRepository {
  const { exec, run } = useDatabase()

  function getByComponentId(
    componentId: number
  ): ComponentGroupingWithMembers[] {
    const result = exec(
      `SELECT g.*, COUNT(m.id) as occurrence_count
       FROM component_groupings g
       LEFT JOIN component_grouping_members m ON g.id = m.grouping_id
       WHERE g.component_id = ?
       GROUP BY g.id
       ORDER BY g.display_order`,
      [componentId]
    )

    if (!result[0]) {
      return []
    }

    const { columns, values } = result[0]

    return values.map((row) => {
      const obj: Record<string, unknown> = {}
      columns.forEach((col, i) => {
        obj[col] = row[i]
      })
      const grouping = mapRowToGrouping(obj as unknown as ComponentGroupingRow)
      const occurrenceCount = obj['occurrence_count']
      return {
        ...grouping,
        occurrenceCount:
          typeof occurrenceCount === 'number' ? occurrenceCount : 0
      }
    })
  }

  function getById(id: number): ComponentGrouping | null {
    const result = exec('SELECT * FROM component_groupings WHERE id = ?', [id])
    const list = resultToGroupingList(result)
    return list[0] ?? null
  }

  function getMembers(groupingId: number): ComponentGroupingMember[] {
    const result = exec(
      'SELECT * FROM component_grouping_members WHERE grouping_id = ? ORDER BY display_order',
      [groupingId]
    )
    return resultToMemberList(result)
  }

  function getNextDisplayOrder(componentId: number): number {
    const result = exec(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM component_groupings WHERE component_id = ?',
      [componentId]
    )
    const rawOrder = result[0]?.values[0]?.[0]
    return typeof rawOrder === 'number' ? rawOrder : 0
  }

  function create(input: CreateComponentGroupingInput): ComponentGrouping {
    const displayOrder =
      input.displayOrder ?? getNextDisplayOrder(input.componentId)

    run(
      `INSERT INTO component_groupings (component_id, name, description, display_order)
       VALUES (?, ?, ?, ?)`,
      [input.componentId, input.name, input.description ?? null, displayOrder]
    )

    // Get the newly created grouping
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const grouping = getById(newId)
    if (!grouping) {
      throw new Error('Failed to create component grouping')
    }
    return grouping
  }

  function update(id: number, input: UpdateComponentGroupingInput): void {
    const setClauses: string[] = []
    const params: unknown[] = []

    if (input.name !== undefined) {
      setClauses.push('name = ?')
      params.push(input.name)
    }

    if (input.description !== undefined) {
      setClauses.push('description = ?')
      params.push(input.description)
    }

    if (input.displayOrder !== undefined) {
      setClauses.push('display_order = ?')
      params.push(input.displayOrder)
    }

    if (setClauses.length === 0) {
      return
    }

    setClauses.push('updated_at = CURRENT_TIMESTAMP')
    params.push(id)

    run(
      `UPDATE component_groupings SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    )
  }

  function remove(id: number): void {
    // ON DELETE CASCADE will handle members
    run('DELETE FROM component_groupings WHERE id = ?', [id])
  }

  function reorder(groupingIds: number[]): void {
    groupingIds.forEach((id, index) => {
      run('UPDATE component_groupings SET display_order = ? WHERE id = ?', [
        index,
        id
      ])
    })
  }

  function addMember(groupingId: number, occurrenceId: number): void {
    // Get next display order for this grouping's members
    const orderResult = exec(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM component_grouping_members WHERE grouping_id = ?',
      [groupingId]
    )
    const rawOrder = orderResult[0]?.values[0]?.[0]
    const nextOrder = typeof rawOrder === 'number' ? rawOrder : 0

    run(
      `INSERT OR IGNORE INTO component_grouping_members (grouping_id, occurrence_id, display_order)
       VALUES (?, ?, ?)`,
      [groupingId, occurrenceId, nextOrder]
    )
  }

  function removeMember(groupingId: number, occurrenceId: number): void {
    run(
      'DELETE FROM component_grouping_members WHERE grouping_id = ? AND occurrence_id = ?',
      [groupingId, occurrenceId]
    )
  }

  function reorderMembers(groupingId: number, occurrenceIds: number[]): void {
    occurrenceIds.forEach((occurrenceId, index) => {
      run(
        'UPDATE component_grouping_members SET display_order = ? WHERE grouping_id = ? AND occurrence_id = ?',
        [index, groupingId, occurrenceId]
      )
    })
  }

  return {
    addMember,
    create,
    getByComponentId,
    getById,
    getMembers,
    getNextDisplayOrder,
    remove,
    removeMember,
    reorder,
    reorderMembers,
    update
  }
}
