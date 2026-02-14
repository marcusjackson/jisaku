/**
 * Kanji Classification Repository
 *
 * Data access layer for kanji-to-classification-type assignments.
 * Junction table linking kanji to their classification types.
 *
 * @module api/classification
 */

import { useDatabase } from '@/shared/composables/use-database'

import { schedulePersist } from '@/db/indexeddb'
import { BaseRepository } from '../base-repository'

import type { ChildRepository, Orderable } from '../types'
import type {
  ClassificationType,
  CreateKanjiClassificationInput,
  KanjiClassification
} from './classification-types'

// ============================================================================
// Row Type
// ============================================================================

interface KanjiClassificationRow {
  id: number
  kanji_id: number
  classification_type_id: number
  display_order: number
}

interface JoinedRow extends KanjiClassificationRow {
  type_name: string
  name_japanese: string | null
  name_english: string | null
  description: string | null
  description_short: string | null
  type_display_order: number
}

// ============================================================================
// Repository Implementation
// ============================================================================

class KanjiClassificationRepositoryImpl
  extends BaseRepository<KanjiClassification>
  implements
    ChildRepository<KanjiClassification, CreateKanjiClassificationInput, never>,
    Orderable
{
  protected tableName = 'kanji_classifications'

  private readonly exec: ReturnType<typeof useDatabase>['exec']
  private readonly run: ReturnType<typeof useDatabase>['run']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
    this.run = db.run
  }

  protected mapRow(row: Record<string, unknown>): KanjiClassification {
    const r = row as unknown as KanjiClassificationRow
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      classificationTypeId: r.classification_type_id,
      displayOrder: r.display_order
    }
  }

  private mapJoinedRow(row: Record<string, unknown>): KanjiClassification {
    const r = row as unknown as JoinedRow
    const classificationType: ClassificationType = {
      id: r.classification_type_id,
      typeName: r.type_name,
      nameJapanese: r.name_japanese,
      nameEnglish: r.name_english,
      description: r.description,
      descriptionShort: r.description_short,
      displayOrder: r.type_display_order
    }
    return {
      id: r.id,
      kanjiId: r.kanji_id,
      classificationTypeId: r.classification_type_id,
      displayOrder: r.display_order,
      classificationType
    }
  }

  // ==========================================================================
  // Read Operations
  // ==========================================================================

  getById(id: number): KanjiClassification | null {
    const result = this.exec(
      'SELECT * FROM kanji_classifications WHERE id = ?',
      [id]
    )
    return this.resultToEntity(result)
  }

  getAll(): KanjiClassification[] {
    const result = this.exec(
      'SELECT * FROM kanji_classifications ORDER BY display_order ASC'
    )
    return this.resultToList(result)
  }

  getByParentId(kanjiId: number): KanjiClassification[] {
    const result = this.exec(
      'SELECT * FROM kanji_classifications WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return this.resultToList(result)
  }

  /**
   * Get classifications with joined type data
   */
  getByKanjiIdWithType(kanjiId: number): KanjiClassification[] {
    const result = this.exec(
      `SELECT 
        kc.id, kc.kanji_id, kc.classification_type_id, kc.display_order,
        ct.type_name, ct.name_japanese, ct.name_english, 
        ct.description, ct.description_short,
        ct.display_order as type_display_order
       FROM kanji_classifications kc
       JOIN classification_types ct ON ct.id = kc.classification_type_id
       WHERE kc.kanji_id = ?
       ORDER BY kc.display_order ASC`,
      [kanjiId]
    )
    if (!result[0]) return []
    // Use resultToList pattern but with custom mapper
    const firstResult = result[0]
    return firstResult.values.map((row) => {
      const obj: Record<string, unknown> = {}
      firstResult.columns.forEach((col, i) => {
        obj[col] = row[i]
      })
      return this.mapJoinedRow(obj)
    })
  }

  // ==========================================================================
  // Write Operations
  // ==========================================================================

  create(input: CreateKanjiClassificationInput): KanjiClassification {
    const maxResult = this.exec(
      'SELECT MAX(display_order) as max_order FROM kanji_classifications WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    this.run(
      `INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order)
       VALUES (?, ?, ?)`,
      [input.kanjiId, input.classificationTypeId, displayOrder]
    )

    const idResult = this.exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number

    const created = this.getById(newId)
    if (!created) {
      throw new Error('Failed to retrieve created kanji classification')
    }

    schedulePersist()
    return created
  }

  /**
   * Junction tables typically don't update - just remove and re-add
   */
  update(): never {
    throw new Error(
      'KanjiClassification update not supported. Remove and re-add instead.'
    )
  }

  remove(id: number): void {
    this.run('DELETE FROM kanji_classifications WHERE id = ?', [id])
    schedulePersist()
  }

  /**
   * Remove all classifications for a kanji
   */
  removeByKanjiId(kanjiId: number): void {
    this.run('DELETE FROM kanji_classifications WHERE kanji_id = ?', [kanjiId])
    schedulePersist()
  }

  // ==========================================================================
  // Ordering
  // ==========================================================================

  reorder(ids: number[]): void {
    ids.forEach((id, index) => {
      this.run(
        'UPDATE kanji_classifications SET display_order = ? WHERE id = ?',
        [index, id]
      )
    })
    schedulePersist()
  }
}

// ============================================================================
// Factory Function
// ============================================================================

export function useKanjiClassificationRepository(): KanjiClassificationRepositoryImpl {
  return new KanjiClassificationRepositoryImpl()
}

export type { CreateKanjiClassificationInput, KanjiClassification }
