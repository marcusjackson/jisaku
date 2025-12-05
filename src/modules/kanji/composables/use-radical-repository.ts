/**
 * Radical Repository Composable
 *
 * Provides data access methods for radical entries (Kangxi radicals).
 * Uses the shared database composable for SQL operations.
 */

import { useDatabase } from '@/shared/composables/use-database'

import type {
  CreateRadicalInput,
  Radical,
  UpdateRadicalInput
} from '@/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface RadicalRow {
  id: number
  character: string
  stroke_count: number
  number: number
  meaning: string | null
  japanese_name: string | null
  created_at: string
  updated_at: string
}

function mapRowToRadical(row: RadicalRow): Radical {
  return {
    id: row.id,
    character: row.character,
    strokeCount: row.stroke_count,
    number: row.number,
    meaning: row.meaning,
    japaneseName: row.japanese_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToRadicalList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): Radical[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToRadical(obj as unknown as RadicalRow)
  })
}

// =============================================================================
// Composable
// =============================================================================

export interface UseRadicalRepository {
  /** Get all radical entries */
  getAll: () => Radical[]
  /** Get a radical by ID */
  getById: (id: number) => Radical | null
  /** Get a radical by Kangxi number */
  getByNumber: (number: number) => Radical | null
  /** Get a radical by character */
  getByCharacter: (character: string) => Radical | null
  /** Create a new radical entry */
  create: (input: CreateRadicalInput) => Radical
  /** Update an existing radical entry */
  update: (id: number, input: UpdateRadicalInput) => Radical
  /** Delete a radical entry */
  remove: (id: number) => void
}

export function useRadicalRepository(): UseRadicalRepository {
  const { exec, run } = useDatabase()

  function getAll(): Radical[] {
    const result = exec('SELECT * FROM radicals ORDER BY number ASC')
    return resultToRadicalList(result)
  }

  function getById(id: number): Radical | null {
    const result = exec('SELECT * FROM radicals WHERE id = ?', [id])
    const list = resultToRadicalList(result)
    return list[0] ?? null
  }

  function getByNumber(number: number): Radical | null {
    const result = exec('SELECT * FROM radicals WHERE number = ?', [number])
    const list = resultToRadicalList(result)
    return list[0] ?? null
  }

  function getByCharacter(character: string): Radical | null {
    const result = exec('SELECT * FROM radicals WHERE character = ?', [
      character
    ])
    const list = resultToRadicalList(result)
    return list[0] ?? null
  }

  function create(input: CreateRadicalInput): Radical {
    const sql = `
      INSERT INTO radicals (character, stroke_count, number, meaning, japanese_name)
      VALUES (?, ?, ?, ?, ?)
    `
    run(sql, [
      input.character,
      input.strokeCount,
      input.number,
      input.meaning ?? null,
      input.japaneseName ?? null
    ])

    // Get the newly created radical
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getById(newId)
    if (!created) {
      throw new Error('Failed to create radical')
    }
    return created
  }

  function update(id: number, input: UpdateRadicalInput): Radical {
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
    if (input.number !== undefined) {
      fields.push('number = ?')
      values.push(input.number)
    }
    if (input.meaning !== undefined) {
      fields.push('meaning = ?')
      values.push(input.meaning)
    }
    if (input.japaneseName !== undefined) {
      fields.push('japanese_name = ?')
      values.push(input.japaneseName)
    }

    if (fields.length === 0) {
      const existing = getById(id)
      if (!existing) {
        throw new Error(`Radical with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE radicals SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getById(id)
    if (!updated) {
      throw new Error(`Radical with id ${String(id)} not found`)
    }
    return updated
  }

  function remove(id: number): void {
    run('DELETE FROM radicals WHERE id = ?', [id])
  }

  return {
    create,
    getAll,
    getByCharacter,
    getById,
    getByNumber,
    remove,
    update
  }
}
