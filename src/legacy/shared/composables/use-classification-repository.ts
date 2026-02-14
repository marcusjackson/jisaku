/**
 * Classification Repository Composable
 *
 * Provides data access methods for kanji classifications and classification types.
 * Uses the shared database composable for SQL operations.
 */

import { useDatabase } from '@/legacy/shared/composables/use-database'

import type {
  ClassificationType,
  CreateKanjiClassificationInput,
  KanjiClassification,
  KanjiClassificationWithType,
  UpdateKanjiClassificationInput
} from '@/legacy/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

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

interface KanjiClassificationRow {
  id: number
  kanji_id: number
  classification_type_id: number
  display_order: number
  created_at: string
  updated_at: string
}

interface KanjiClassificationWithTypeRow extends KanjiClassificationRow {
  type_name: string
  name_japanese: string | null
  name_english: string | null
  type_description: string | null
  description_short: string | null
}

function mapRowToClassificationType(
  row: ClassificationTypeRow
): ClassificationType {
  return {
    id: row.id,
    typeName: row.type_name,
    nameJapanese: row.name_japanese,
    nameEnglish: row.name_english,
    description: row.description,
    descriptionShort: row.description_short,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapRowToKanjiClassification(
  row: KanjiClassificationRow
): KanjiClassification {
  return {
    id: row.id,
    kanjiId: row.kanji_id,
    classificationTypeId: row.classification_type_id,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapRowToKanjiClassificationWithType(
  row: KanjiClassificationWithTypeRow
): KanjiClassificationWithType {
  return {
    id: row.id,
    kanjiId: row.kanji_id,
    classificationTypeId: row.classification_type_id,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    typeName: row.type_name,
    nameJapanese: row.name_japanese,
    nameEnglish: row.name_english,
    description: row.type_description,
    descriptionShort: row.description_short
  }
}

function resultToClassificationTypeList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): ClassificationType[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToClassificationType(obj as unknown as ClassificationTypeRow)
  })
}

function resultToKanjiClassificationWithTypeList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): KanjiClassificationWithType[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToKanjiClassificationWithType(
      obj as unknown as KanjiClassificationWithTypeRow
    )
  })
}

function resultToKanjiClassificationList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): KanjiClassification[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToKanjiClassification(obj as unknown as KanjiClassificationRow)
  })
}

// =============================================================================
// Composable Interface
// =============================================================================

export interface UseClassificationRepository {
  // Classification Types (reference table)
  /** Get all classification types ordered by display_order */
  getAllClassificationTypes: () => ClassificationType[]
  /** Get a single classification type by ID */
  getClassificationTypeById: (id: number) => ClassificationType | null
  /** Create a new classification type */
  createClassificationType: (data: {
    typeName: string
    nameJapanese?: string | null
    nameEnglish?: string | null
    description?: string | null
    descriptionShort?: string | null
  }) => ClassificationType
  /** Update a classification type */
  updateClassificationType: (
    id: number,
    data: {
      typeName?: string
      nameJapanese?: string | null
      nameEnglish?: string | null
      description?: string | null
      descriptionShort?: string | null
    }
  ) => ClassificationType
  /** Delete a classification type */
  removeClassificationType: (id: number) => void
  /** Get count of kanji using this classification type */
  getClassificationTypeUsageCount: (id: number) => number
  /** Update display order for multiple classification types */
  updateClassificationTypeDisplayOrders: (
    updates: { id: number; displayOrder: number }[]
  ) => void

  // Kanji Classifications
  /** Get all classifications for a kanji with type data, ordered by display_order */
  getClassificationsByKanjiId: (
    kanjiId: number
  ) => KanjiClassificationWithType[]
  /** Get a single classification by ID */
  getClassificationById: (id: number) => KanjiClassification | null
  /** Get primary classification for a kanji (display_order = 0) */
  getPrimaryClassification: (
    kanjiId: number
  ) => KanjiClassificationWithType | null
  /** Get primary classifications for multiple kanji (batch operation for list view) */
  getPrimaryClassificationsForKanji: (
    kanjiIds: number[]
  ) => Map<number, KanjiClassificationWithType | null>
  /** Create a new classification */
  createClassification: (
    input: CreateKanjiClassificationInput
  ) => KanjiClassification
  /** Update a classification */
  updateClassification: (
    id: number,
    input: UpdateKanjiClassificationInput
  ) => KanjiClassification
  /** Delete a classification */
  removeClassification: (id: number) => void
  /** Reorder classifications for a kanji */
  reorderClassifications: (kanjiId: number, classificationIds: number[]) => void
}

// =============================================================================
// Composable
// =============================================================================

export function useClassificationRepository(): UseClassificationRepository {
  const { exec, run } = useDatabase()

  // ===========================================================================
  // Classification Types Methods
  // ===========================================================================

  function getAllClassificationTypes(): ClassificationType[] {
    const result = exec(
      'SELECT * FROM classification_types ORDER BY display_order ASC'
    )
    return resultToClassificationTypeList(result)
  }

  function getClassificationTypeById(id: number): ClassificationType | null {
    const result = exec('SELECT * FROM classification_types WHERE id = ?', [id])
    const list = resultToClassificationTypeList(result)
    return list[0] ?? null
  }

  function createClassificationType(data: {
    typeName: string
    nameJapanese?: string | null
    nameEnglish?: string | null
    description?: string | null
    descriptionShort?: string | null
  }): ClassificationType {
    // Get max display_order
    const maxOrderResult = exec(
      'SELECT MAX(display_order) as max_order FROM classification_types'
    )
    const maxOrder = maxOrderResult[0]?.values[0]
      ? (maxOrderResult[0].values[0][0] as number)
      : 0

    run(
      `INSERT INTO classification_types (
        type_name,
        name_japanese,
        name_english,
        description,
        description_short,
        display_order
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.typeName,
        data.nameJapanese ?? null,
        data.nameEnglish ?? null,
        data.description ?? null,
        data.descriptionShort ?? null,
        maxOrder + 1
      ]
    )

    const result = exec(
      'SELECT * FROM classification_types WHERE id = last_insert_rowid()'
    )
    const list = resultToClassificationTypeList(result)
    if (!list[0]) {
      throw new Error('Failed to create classification type')
    }
    return list[0]
  }

  function updateClassificationType(
    id: number,
    data: {
      typeName?: string
      nameJapanese?: string | null
      nameEnglish?: string | null
      description?: string | null
      descriptionShort?: string | null
    }
  ): ClassificationType {
    const existing = getClassificationTypeById(id)
    if (!existing) {
      throw new Error(`Classification type with id ${String(id)} not found`)
    }

    run(
      `UPDATE classification_types 
       SET type_name = ?,
           name_japanese = ?,
           name_english = ?,
           description = ?,
           description_short = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.typeName ?? existing.typeName,
        data.nameJapanese === undefined
          ? existing.nameJapanese
          : data.nameJapanese,
        data.nameEnglish === undefined
          ? existing.nameEnglish
          : data.nameEnglish,
        data.description === undefined
          ? existing.description
          : data.description,
        data.descriptionShort === undefined
          ? existing.descriptionShort
          : data.descriptionShort,
        id
      ]
    )

    const result = exec('SELECT * FROM classification_types WHERE id = ?', [id])
    const list = resultToClassificationTypeList(result)
    if (!list[0]) {
      throw new Error('Failed to update classification type')
    }
    return list[0]
  }

  function removeClassificationType(id: number): void {
    const existing = getClassificationTypeById(id)
    if (!existing) {
      throw new Error(`Classification type with id ${String(id)} not found`)
    }

    run('DELETE FROM classification_types WHERE id = ?', [id])
  }

  function getClassificationTypeUsageCount(id: number): number {
    const result = exec(
      'SELECT COUNT(*) as count FROM kanji_classifications WHERE classification_type_id = ?',
      [id]
    )
    if (!result[0]?.values[0]) {
      return 0
    }
    return result[0].values[0][0] as number
  }

  function updateClassificationTypeDisplayOrders(
    updates: { id: number; displayOrder: number }[]
  ): void {
    updates.forEach((update) => {
      run('UPDATE classification_types SET display_order = ? WHERE id = ?', [
        update.displayOrder,
        update.id
      ])
    })
  }

  // ===========================================================================
  // Kanji Classifications Methods
  // ===========================================================================

  function getClassificationsByKanjiId(
    kanjiId: number
  ): KanjiClassificationWithType[] {
    const result = exec(
      `SELECT 
        kc.id,
        kc.kanji_id,
        kc.classification_type_id,
        kc.display_order,
        kc.created_at,
        kc.updated_at,
        ct.type_name,
        ct.name_japanese,
        ct.name_english,
        ct.description as type_description,
        ct.description_short
      FROM kanji_classifications kc
      JOIN classification_types ct ON kc.classification_type_id = ct.id
      WHERE kc.kanji_id = ?
      ORDER BY kc.display_order ASC`,
      [kanjiId]
    )
    return resultToKanjiClassificationWithTypeList(result)
  }

  function getClassificationById(id: number): KanjiClassification | null {
    const result = exec('SELECT * FROM kanji_classifications WHERE id = ?', [
      id
    ])
    const list = resultToKanjiClassificationList(result)
    return list[0] ?? null
  }

  function getPrimaryClassification(
    kanjiId: number
  ): KanjiClassificationWithType | null {
    const result = exec(
      `SELECT 
        kc.id,
        kc.kanji_id,
        kc.classification_type_id,
        kc.display_order,
        kc.created_at,
        kc.updated_at,
        ct.type_name,
        ct.name_japanese,
        ct.name_english,
        ct.description as type_description,
        ct.description_short
      FROM kanji_classifications kc
      JOIN classification_types ct ON kc.classification_type_id = ct.id
      WHERE kc.kanji_id = ? AND kc.display_order = 0
      LIMIT 1`,
      [kanjiId]
    )
    const list = resultToKanjiClassificationWithTypeList(result)
    return list[0] ?? null
  }

  function createClassification(
    input: CreateKanjiClassificationInput
  ): KanjiClassification {
    // Get current max display_order for this kanji
    const maxResult = exec(
      'SELECT MAX(display_order) as max_order FROM kanji_classifications WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order)
      VALUES (?, ?, ?)
    `
    run(sql, [input.kanjiId, input.classificationTypeId, displayOrder])

    // Get the newly created classification
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getClassificationById(newId)
    if (!created) {
      throw new Error('Failed to create classification')
    }
    return created
  }

  function updateClassification(
    id: number,
    input: UpdateKanjiClassificationInput
  ): KanjiClassification {
    const fields: string[] = []
    const values: unknown[] = []

    if (input.classificationTypeId !== undefined) {
      fields.push('classification_type_id = ?')
      values.push(input.classificationTypeId)
    }
    if (input.displayOrder !== undefined) {
      fields.push('display_order = ?')
      values.push(input.displayOrder)
    }

    if (fields.length === 0) {
      const existing = getClassificationById(id)
      if (!existing) {
        throw new Error(`Classification with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE kanji_classifications SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getClassificationById(id)
    if (!updated) {
      throw new Error(`Classification with id ${String(id)} not found`)
    }
    return updated
  }

  function removeClassification(id: number): void {
    run('DELETE FROM kanji_classifications WHERE id = ?', [id])
  }

  function reorderClassifications(
    kanjiId: number,
    classificationIds: number[]
  ): void {
    classificationIds.forEach((classificationId, index) => {
      run(
        'UPDATE kanji_classifications SET display_order = ? WHERE id = ? AND kanji_id = ?',
        [index, classificationId, kanjiId]
      )
    })
  }

  /**
   * Get primary classifications for multiple kanji IDs (batch operation for list view)
   * Returns a map of kanjiId -> primary classification (or null)
   */
  function getPrimaryClassificationsForKanji(
    kanjiIds: number[]
  ): Map<number, KanjiClassificationWithType | null> {
    const result = new Map<number, KanjiClassificationWithType | null>()

    if (kanjiIds.length === 0) {
      return result
    }

    // Initialize all to null
    kanjiIds.forEach((id) => result.set(id, null))

    // Query all primary classifications (display_order = 0) in one go
    const placeholders = kanjiIds.map(() => '?').join(',')
    const queryResult = exec(
      `SELECT 
        kc.id,
        kc.kanji_id,
        kc.classification_type_id,
        kc.display_order,
        kc.created_at,
        kc.updated_at,
        ct.type_name,
        ct.name_japanese,
        ct.name_english,
        ct.description as type_description,
        ct.description_short
      FROM kanji_classifications kc
      JOIN classification_types ct ON kc.classification_type_id = ct.id
      WHERE kc.kanji_id IN (${placeholders}) AND kc.display_order = 0`,
      kanjiIds
    )

    const classifications = resultToKanjiClassificationWithTypeList(queryResult)
    classifications.forEach((classification) => {
      result.set(classification.kanjiId, classification)
    })

    return result
  }

  return {
    // Classification Types
    getAllClassificationTypes,
    getClassificationTypeById,
    createClassificationType,
    updateClassificationType,
    removeClassificationType,
    getClassificationTypeUsageCount,
    updateClassificationTypeDisplayOrders,
    // Kanji Classifications
    getClassificationsByKanjiId,
    getClassificationById,
    getPrimaryClassification,
    getPrimaryClassificationsForKanji,
    createClassification,
    updateClassification,
    removeClassification,
    reorderClassifications
  }
}
