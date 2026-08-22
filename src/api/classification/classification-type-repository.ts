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
import { CreateError, EntityNotFoundError, UpdateError } from '../api-types'
import { BaseRepository } from '../base-repository'

import type { Orderable, Repository } from '../api-types'
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
  created_at: string
  updated_at: string
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
      displayOrder: r.display_order,
      createdAt: r.created_at,
      updatedAt: r.updated_at
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
    const maxOrder = this.getMaxDisplayOrder('classification_types')
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
      throw new CreateError('ClassificationType')
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

    sets.push("updated_at = datetime('now')")
    values.push(id)
    this.run(
      `UPDATE classification_types SET ${sets.join(', ')} WHERE id = ?`,
      values
    )

    const updated = this.getById(id)
    if (!updated) {
      throw new UpdateError('ClassificationType', id)
    }

    schedulePersist()
    return updated
  }

  remove(id: number): void {
    this.withTransaction(() => {
      this.run(
        'DELETE FROM kanji_classifications WHERE classification_type_id = ?',
        [id]
      )
      this.run('DELETE FROM classification_types WHERE id = ?', [id])
    })
    schedulePersist()
  }

  // ==========================================================================
  // Usage
  // ==========================================================================

  /** Return the number of kanji that use this classification type. */
  getUsageCount(id: number): number {
    const result = this.exec(
      'SELECT COUNT(*) as count FROM kanji_classifications WHERE classification_type_id = ?',
      [id]
    )
    return (result[0]?.values[0]?.[0] as number | null) ?? 0
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  /** Reorder classification types by assigning `display_order` values matching the provided id array. */
  reorder(ids: number[]): void {
    this.withTransaction(() => {
      ids.forEach((id, index) => {
        this.run(
          'UPDATE classification_types SET display_order = ? WHERE id = ?',
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
 * Creates a classification type repository instance bound to the active database.
 * @returns Repository for managing classification types (CRUD, reorder).
 * @example const repo = useClassificationTypeRepository(); repo.getAll()
 */
export function useClassificationTypeRepository(): ClassificationTypeRepositoryImpl {
  return new ClassificationTypeRepositoryImpl()
}
