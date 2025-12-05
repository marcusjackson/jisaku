/**
 * Component Repository Composable
 *
 * Provides data access methods for component entries.
 * Uses the shared database composable for SQL operations.
 */

import { useDatabase } from '@/shared/composables/use-database'

import type {
  Component,
  CreateComponentInput,
  UpdateComponentInput
} from '@/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface ComponentRow {
  id: number
  character: string
  stroke_count: number
  source_kanji_id: number | null
  description_short: string | null
  japanese_name: string | null
  description: string | null
  created_at: string
  updated_at: string
}

function mapRowToComponent(row: ComponentRow): Component {
  return {
    id: row.id,
    character: row.character,
    strokeCount: row.stroke_count,
    sourceKanjiId: row.source_kanji_id,
    descriptionShort: row.description_short,
    japaneseName: row.japanese_name,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToComponentList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): Component[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToComponent(obj as unknown as ComponentRow)
  })
}

// =============================================================================
// Composable
// =============================================================================

export interface UseComponentRepository {
  /** Get all component entries */
  getAll: () => Component[]
  /** Get a component by ID */
  getById: (id: number) => Component | null
  /** Get a component by character */
  getByCharacter: (character: string) => Component | null
  /** Create a new component entry */
  create: (input: CreateComponentInput) => Component
  /** Update an existing component entry */
  update: (id: number, input: UpdateComponentInput) => Component
  /** Delete a component entry */
  remove: (id: number) => void
  /** Get count of kanji linked to this component */
  getLinkedKanjiCount: (componentId: number) => number
  /** Get kanji IDs linked to this component */
  getLinkedKanjiIds: (componentId: number) => number[]
}

export function useComponentRepository(): UseComponentRepository {
  const { exec, run } = useDatabase()

  function getAll(): Component[] {
    const result = exec('SELECT * FROM components ORDER BY id DESC')
    return resultToComponentList(result)
  }

  function getById(id: number): Component | null {
    const result = exec('SELECT * FROM components WHERE id = ?', [id])
    const list = resultToComponentList(result)
    return list[0] ?? null
  }

  function getByCharacter(character: string): Component | null {
    const result = exec('SELECT * FROM components WHERE character = ?', [
      character
    ])
    const list = resultToComponentList(result)
    return list[0] ?? null
  }

  function create(input: CreateComponentInput): Component {
    const sql = `
      INSERT INTO components (character, stroke_count, source_kanji_id, description_short, japanese_name, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    run(sql, [
      input.character,
      input.strokeCount,
      input.sourceKanjiId ?? null,
      input.descriptionShort ?? null,
      input.japaneseName ?? null,
      input.description ?? null
    ])

    // Get the newly created component
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getById(newId)
    if (!created) {
      throw new Error('Failed to create component')
    }
    return created
  }

  function update(id: number, input: UpdateComponentInput): Component {
    const fields: string[] = []
    const values: unknown[] = []

    if (input.character !== undefined) {
      fields.push('character = ?')
      values.push(input.character)
    }
    if (input.strokeCount !== undefined) {
      fields.push('stroke_count = ?')
      values.push(input.strokeCount)
    }
    if (input.sourceKanjiId !== undefined) {
      fields.push('source_kanji_id = ?')
      values.push(input.sourceKanjiId)
    }
    if (input.descriptionShort !== undefined) {
      fields.push('description_short = ?')
      values.push(input.descriptionShort)
    }
    if (input.japaneseName !== undefined) {
      fields.push('japanese_name = ?')
      values.push(input.japaneseName)
    }
    if (input.description !== undefined) {
      fields.push('description = ?')
      values.push(input.description)
    }

    if (fields.length === 0) {
      const existing = getById(id)
      if (!existing) {
        throw new Error(`Component with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE components SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getById(id)
    if (!updated) {
      throw new Error(`Component with id ${String(id)} not found`)
    }
    return updated
  }

  function remove(id: number): void {
    // Junction table entries are cascade deleted due to ON DELETE CASCADE
    run('DELETE FROM components WHERE id = ?', [id])
  }

  function getLinkedKanjiCount(componentId: number): number {
    const result = exec(
      'SELECT COUNT(*) as count FROM kanji_components WHERE component_id = ?',
      [componentId]
    )
    const count = result[0]?.values[0]?.[0]
    return typeof count === 'number' ? count : 0
  }

  function getLinkedKanjiIds(componentId: number): number[] {
    const result = exec(
      'SELECT kanji_id FROM kanji_components WHERE component_id = ? ORDER BY position',
      [componentId]
    )
    if (!result[0]) {
      return []
    }
    return result[0].values.map((row) => row[0] as number)
  }

  return {
    create,
    getAll,
    getByCharacter,
    getById,
    getLinkedKanjiCount,
    getLinkedKanjiIds,
    remove,
    update
  }
}
