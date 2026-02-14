/**
 * Component Form Repository
 *
 * Data access layer for component forms (visual variants).
 * Child entity of component with ordering support.
 *
 * @module api/component
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { ChildRepository, Orderable } from '../types'
import type {
  ComponentForm,
  CreateComponentFormInput,
  UpdateComponentFormInput
} from './component-types'

// ============================================================================
// Row Type
// ============================================================================

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

// ============================================================================
// Repository Implementation
// ============================================================================

class ComponentFormRepositoryImpl
  extends BaseRepository<ComponentForm>
  implements
    ChildRepository<
      ComponentForm,
      CreateComponentFormInput,
      UpdateComponentFormInput
    >,
    Orderable
{
  protected tableName = 'component_forms'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): ComponentForm {
    const r = row as unknown as ComponentFormRow
    return {
      id: r.id,
      componentId: r.component_id,
      formCharacter: r.form_character,
      formName: r.form_name,
      strokeCount: r.stroke_count,
      usageNotes: r.usage_notes,
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): ComponentForm | null {
    const result = this.exec('SELECT * FROM component_forms WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): ComponentForm[] {
    const result = this.exec(
      'SELECT * FROM component_forms ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByParentId(componentId: number): ComponentForm[] {
    const result = this.exec(
      'SELECT * FROM component_forms WHERE component_id = ? ORDER BY display_order ASC',
      [componentId]
    )
    return this.resultToList(result)
  }

  /** Get primary form for a component */
  getPrimaryForm(componentId: number): ComponentForm | null {
    const forms = this.getByParentId(componentId)
    return forms[0] ?? null
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateComponentFormInput): ComponentForm {
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM component_forms WHERE component_id = ?',
      [input.componentId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO component_forms (
        component_id, form_character, form_name, stroke_count, usage_notes, display_order
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.componentId,
        input.formCharacter,
        input.formName ?? null,
        input.strokeCount ?? null,
        input.usageNotes ?? null,
        displayOrder
      ]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created component form')
    }

    schedulePersist()
    return created
  }

  update(id: number, input: UpdateComponentFormInput): ComponentForm {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('ComponentForm', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.formCharacter !== undefined) {
      sets.push('form_character = ?')
      values.push(input.formCharacter)
    }
    if (input.formName !== undefined) {
      sets.push('form_name = ?')
      values.push(input.formName)
    }
    if (input.strokeCount !== undefined) {
      sets.push('stroke_count = ?')
      values.push(input.strokeCount)
    }
    if (input.usageNotes !== undefined) {
      sets.push('usage_notes = ?')
      values.push(input.usageNotes)
    }

    if (sets.length === 0) {
      return existing
    }

    sets.push('updated_at = datetime("now")')
    values.push(id)

    this.run(
      `UPDATE component_forms SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('ComponentForm disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM component_forms WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run('UPDATE component_forms SET display_order = ? WHERE id = ?', [
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

export function useComponentFormRepository(): ComponentFormRepositoryImpl {
  return new ComponentFormRepositoryImpl()
}

export type {
  ComponentForm,
  CreateComponentFormInput,
  UpdateComponentFormInput
}
