/**
 * Classification Type Repository
 *
 * Data access layer for classification types (reference data).
 * These are predefined categories like pictograph, ideograph, etc.
 *
 * @module api/classification
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'
import { EntityNotFoundError } from '../types'

import type { Orderable, Repository } from '../types'
import type {
  ClassificationType,
  CreateClassificationTypeInput,
  UpdateClassificationTypeInput
} from './classification-types'

// ============================================================================
// Row Type
// ============================================================================

interface ClassificationTypeRow {
  id: number
  type_name: string
  name_japanese: string | null
  name_english: string | null
  description: string | null
  description_short: string | null
  display_order: number
}

// ============================================================================
// Repository Implementation
// ============================================================================

class ClassificationTypeRepositoryImpl
  extends BaseRepository<ClassificationType>
  implements
    Repository<
      ClassificationType,
      CreateClassificationTypeInput,
      UpdateClassificationTypeInput
    >,
    Orderable
{
  protected tableName = 'classification_types'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): ClassificationType {
    const r = row as unknown as ClassificationTypeRow
    return {
      id: r.id,
      typeName: r.type_name,
      nameJapanese: r.name_japanese,
      nameEnglish: r.name_english,
      description: r.description,
      descriptionShort: r.description_short,
      displayOrder: r.display_order
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): ClassificationType | null {
    const result = this.exec(
      'SELECT * FROM classification_types WHERE id = ?',
      [id]
    )
    return this.resultToEntity(result)
  }

  getAll(): ClassificationType[] {
    const result = this.exec(
      'SELECT * FROM classification_types ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByTypeName(typeName: string): ClassificationType | null {
    const result = this.exec(
      'SELECT * FROM classification_types WHERE type_name = ?',
      [typeName]
    )
    return this.resultToEntity(result)
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateClassificationTypeInput): ClassificationType {
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM classification_types'
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO classification_types 
       (type_name, name_japanese, name_english, description, description_short, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.typeName,
        input.nameJapanese ?? null,
        input.nameEnglish ?? null,
        input.description ?? null,
        input.descriptionShort ?? null,
        displayOrder
      ]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created classification type')
    }

    schedulePersist()
    return created
  }

  update(id: number, input: UpdateClassificationTypeInput): ClassificationType {
    const existing = this.getById(id)
    if (!existing) {
      throw new EntityNotFoundError('ClassificationType', id)
    }

    const sets: string[] = []
    const values: unknown[] = []

    if (input.typeName !== undefined) {
      sets.push('type_name = ?')
      values.push(input.typeName)
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
    if (input.descriptionShort !== undefined) {
      sets.push('description_short = ?')
      values.push(input.descriptionShort)
    }

    if (sets.length === 0) {
      return existing
    }

    values.push(id)
    this.run(
      `UPDATE classification_types SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new Error('ClassificationType disappeared after update')
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.run('DELETE FROM classification_types WHERE id = ?', [id])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run(
        'UPDATE classification_types SET display_order = ? WHERE id = ?',
        [index, id]
      )
    })
    schedulePersist()
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function useClassificationTypeRepository(): ClassificationTypeRepositoryImpl {
  return new ClassificationTypeRepositoryImpl()
}

export type {
  ClassificationType,
  CreateClassificationTypeInput,
  UpdateClassificationTypeInput
}
