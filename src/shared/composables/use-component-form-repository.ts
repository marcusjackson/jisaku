/**
 * Component Form Repository Composable
 *
 * Provides data access methods for component form (visual variant) entries.
 * Handles CRUD operations and reordering for different visual forms
 * of the same semantic component (e.g., 水 vs 氵 vs 氺).
 */

import { useDatabase } from '@/shared/composables/use-database'

import type {
  ComponentForm,
  CreateComponentFormInput,
  UpdateComponentFormInput
} from '@/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface ComponentFormRow {
  id: number
  component_id: number
  form_character: string
  form_name: string | null
  stroke_count: number | null
  usage_notes: string | null
  display_order: number
  created_at: string
  updated_at: string
}

function mapRowToComponentForm(row: ComponentFormRow): ComponentForm {
  return {
    id: row.id,
    componentId: row.component_id,
    formCharacter: row.form_character,
    formName: row.form_name,
    strokeCount: row.stroke_count,
    usageNotes: row.usage_notes,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToComponentFormList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): ComponentForm[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToComponentForm(obj as unknown as ComponentFormRow)
  })
}

// =============================================================================
// Composable
// =============================================================================

export interface UseComponentFormRepository {
  /** Get all forms for a component */
  getByComponentId: (componentId: number) => ComponentForm[]
  /** Get a single form by ID */
  getById: (id: number) => ComponentForm | null
  /** Create a new component form */
  create: (input: CreateComponentFormInput) => ComponentForm
  /** Update a component form */
  update: (id: number, input: UpdateComponentFormInput) => void
  /** Delete a component form */
  remove: (id: number) => void
  /** Reorder forms by setting display_order based on array position */
  reorder: (formIds: number[]) => void
  /** Get next display order for a component's forms */
  getNextDisplayOrder: (componentId: number) => number
}

export function useComponentFormRepository(): UseComponentFormRepository {
  const { exec, run } = useDatabase()

  function getByComponentId(componentId: number): ComponentForm[] {
    const result = exec(
      'SELECT * FROM component_forms WHERE component_id = ? ORDER BY display_order',
      [componentId]
    )
    return resultToComponentFormList(result)
  }

  function getById(id: number): ComponentForm | null {
    const result = exec('SELECT * FROM component_forms WHERE id = ?', [id])
    const list = resultToComponentFormList(result)
    return list[0] ?? null
  }

  function getNextDisplayOrder(componentId: number): number {
    const result = exec(
      'SELECT COALESCE(MAX(display_order), -1) + 1 as next_order FROM component_forms WHERE component_id = ?',
      [componentId]
    )
    const rawOrder = result[0]?.values[0]?.[0]
    return typeof rawOrder === 'number' ? rawOrder : 0
  }

  function create(input: CreateComponentFormInput): ComponentForm {
    const displayOrder =
      input.displayOrder ?? getNextDisplayOrder(input.componentId)

    run(
      `INSERT INTO component_forms (component_id, form_character, form_name, stroke_count, usage_notes, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.componentId,
        input.formCharacter,
        input.formName ?? null,
        input.strokeCount ?? null,
        input.usageNotes ?? null,
        displayOrder
      ]
    )

    // Get the newly created form
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const form = getById(newId)
    if (!form) {
      throw new Error('Failed to create component form')
    }
    return form
  }

  function update(id: number, input: UpdateComponentFormInput): void {
    const setClauses: string[] = []
    const params: unknown[] = []

    if (input.formName !== undefined) {
      setClauses.push('form_name = ?')
      params.push(input.formName)
    }

    if (input.strokeCount !== undefined) {
      setClauses.push('stroke_count = ?')
      params.push(input.strokeCount)
    }

    if (input.usageNotes !== undefined) {
      setClauses.push('usage_notes = ?')
      params.push(input.usageNotes)
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
      `UPDATE component_forms SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    )
  }

  function remove(id: number): void {
    // ON DELETE SET NULL will handle occurrences that reference this form
    run('DELETE FROM component_forms WHERE id = ?', [id])
  }

  function reorder(formIds: number[]): void {
    formIds.forEach((id, index) => {
      run('UPDATE component_forms SET display_order = ? WHERE id = ?', [
        index,
        id
      ])
    })
  }

  return {
    create,
    getByComponentId,
    getById,
    getNextDisplayOrder,
    remove,
    reorder,
    update
  }
}
