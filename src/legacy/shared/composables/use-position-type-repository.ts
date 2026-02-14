/**
 * Position Type Repository Composable
 *
 * Provides data access methods for position type reference data.
 * Position types define where components appear in kanji (hen, tsukuri, etc.).
 */

import { useDatabase } from '@/legacy/shared/composables/use-database'

import type { PositionType } from '@/legacy/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface PositionTypeRow {
  id: number
  position_name: string
  name_japanese: string | null
  name_english: string | null
  description: string | null
  description_short: string | null
  display_order: number
  created_at: string
  updated_at: string
}

function mapRowToPositionType(row: PositionTypeRow): PositionType {
  return {
    id: row.id,
    positionName: row.position_name,
    nameJapanese: row.name_japanese,
    nameEnglish: row.name_english,
    description: row.description,
    descriptionShort: row.description_short,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToPositionTypeList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): PositionType[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToPositionType(obj as unknown as PositionTypeRow)
  })
}

// =============================================================================
// Composable
// =============================================================================

export interface UsePositionTypeRepository {
  /** Get all position types ordered by display_order */
  getAll: () => PositionType[]
  /** Get a position type by ID */
  getById: (id: number) => PositionType | null
  /** Create a new position type */
  create: (data: {
    positionName: string
    nameJapanese?: string | null
    nameEnglish?: string | null
    description?: string | null
    descriptionShort?: string | null
  }) => PositionType
  /** Update a position type */
  update: (
    id: number,
    data: {
      positionName?: string
      nameJapanese?: string | null
      nameEnglish?: string | null
      description?: string | null
      descriptionShort?: string | null
    }
  ) => PositionType
  /** Delete a position type */
  remove: (id: number) => void
  /** Get count of component occurrences using this position type */
  getUsageCount: (id: number) => number
  /** Update display order for multiple position types */
  updateDisplayOrders: (updates: { id: number; displayOrder: number }[]) => void
}

export function usePositionTypeRepository(): UsePositionTypeRepository {
  const { exec } = useDatabase()

  function getAll(): PositionType[] {
    const result = exec('SELECT * FROM position_types ORDER BY display_order')
    return resultToPositionTypeList(result)
  }

  function getById(id: number): PositionType | null {
    const result = exec('SELECT * FROM position_types WHERE id = ?', [id])
    const list = resultToPositionTypeList(result)
    return list[0] ?? null
  }

  function create(data: {
    positionName: string
    nameJapanese?: string | null
    nameEnglish?: string | null
    description?: string | null
    descriptionShort?: string | null
  }): PositionType {
    // Get max display_order
    const maxOrderResult = exec(
      'SELECT MAX(display_order) as max_order FROM position_types'
    )
    const maxOrder = maxOrderResult[0]?.values[0]
      ? (maxOrderResult[0].values[0][0] as number)
      : 0

    exec(
      `INSERT INTO position_types (
        position_name,
        name_japanese,
        name_english,
        description,
        description_short,
        display_order
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.positionName,
        data.nameJapanese ?? null,
        data.nameEnglish ?? null,
        data.description ?? null,
        data.descriptionShort ?? null,
        maxOrder + 1
      ]
    )

    const result = exec(
      'SELECT * FROM position_types WHERE id = last_insert_rowid()'
    )
    const list = resultToPositionTypeList(result)
    if (!list[0]) {
      throw new Error('Failed to create position type')
    }
    return list[0]
  }

  function update(
    id: number,
    data: {
      positionName?: string
      nameJapanese?: string | null
      nameEnglish?: string | null
      description?: string | null
      descriptionShort?: string | null
    }
  ): PositionType {
    const existing = getById(id)
    if (!existing) {
      throw new Error(`Position type with id ${String(id)} not found`)
    }

    exec(
      `UPDATE position_types 
       SET position_name = ?,
           name_japanese = ?,
           name_english = ?,
           description = ?,
           description_short = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        data.positionName ?? existing.positionName,
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

    const result = exec('SELECT * FROM position_types WHERE id = ?', [id])
    const list = resultToPositionTypeList(result)
    if (!list[0]) {
      throw new Error('Failed to update position type')
    }
    return list[0]
  }

  function remove(id: number): void {
    const existing = getById(id)
    if (!existing) {
      throw new Error(`Position type with id ${String(id)} not found`)
    }

    exec('DELETE FROM position_types WHERE id = ?', [id])
  }

  function getUsageCount(id: number): number {
    const result = exec(
      'SELECT COUNT(*) as count FROM component_occurrences WHERE position_type_id = ?',
      [id]
    )
    if (!result[0]?.values[0]) {
      return 0
    }
    return result[0].values[0][0] as number
  }

  function updateDisplayOrders(
    updates: { id: number; displayOrder: number }[]
  ): void {
    updates.forEach((update) => {
      exec('UPDATE position_types SET display_order = ? WHERE id = ?', [
        update.displayOrder,
        update.id
      ])
    })
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
    getUsageCount,
    updateDisplayOrders
  }
}
