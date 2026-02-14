/**
 * Reading Repository Composable
 *
 * Provides data access methods for on-yomi and kun-yomi readings.
 * Uses the shared database composable for SQL operations.
 */

import { useDatabase } from '@/legacy/shared/composables/use-database'

import type {
  CreateKunReadingInput,
  CreateOnReadingInput,
  KunReading,
  OnReading,
  ReadingLevel,
  UpdateKunReadingInput,
  UpdateOnReadingInput
} from '@/legacy/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface OnReadingRow {
  id: number
  kanji_id: number
  reading: string
  reading_level: string
  display_order: number
  created_at: string
  updated_at: string
}

interface KunReadingRow {
  id: number
  kanji_id: number
  reading: string
  okurigana: string | null
  reading_level: string
  display_order: number
  created_at: string
  updated_at: string
}

function mapRowToOnReading(row: OnReadingRow): OnReading {
  return {
    id: row.id,
    kanjiId: row.kanji_id,
    reading: row.reading,
    readingLevel: row.reading_level as ReadingLevel,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function mapRowToKunReading(row: KunReadingRow): KunReading {
  return {
    id: row.id,
    kanjiId: row.kanji_id,
    reading: row.reading,
    okurigana: row.okurigana,
    readingLevel: row.reading_level as ReadingLevel,
    displayOrder: row.display_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToOnReadingList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): OnReading[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToOnReading(obj as unknown as OnReadingRow)
  })
}

function resultToKunReadingList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): KunReading[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToKunReading(obj as unknown as KunReadingRow)
  })
}

// =============================================================================
// Composable Interface
// =============================================================================

export interface UseReadingRepository {
  // On-yomi methods
  /** Get all on-yomi readings for a kanji, ordered by display_order */
  getOnReadingsByKanjiId: (kanjiId: number) => OnReading[]
  /** Get a single on-yomi reading by ID */
  getOnReadingById: (id: number) => OnReading | null
  /** Create a new on-yomi reading */
  createOnReading: (input: CreateOnReadingInput) => OnReading
  /** Update an on-yomi reading */
  updateOnReading: (id: number, input: UpdateOnReadingInput) => OnReading
  /** Delete an on-yomi reading */
  removeOnReading: (id: number) => void
  /** Reorder on-yomi readings for a kanji */
  reorderOnReadings: (kanjiId: number, readingIds: number[]) => void

  // Kun-yomi methods
  /** Get all kun-yomi readings for a kanji, ordered by display_order */
  getKunReadingsByKanjiId: (kanjiId: number) => KunReading[]
  /** Get a single kun-yomi reading by ID */
  getKunReadingById: (id: number) => KunReading | null
  /** Create a new kun-yomi reading */
  createKunReading: (input: CreateKunReadingInput) => KunReading
  /** Update a kun-yomi reading */
  updateKunReading: (id: number, input: UpdateKunReadingInput) => KunReading
  /** Delete a kun-yomi reading */
  removeKunReading: (id: number) => void
  /** Reorder kun-yomi readings for a kanji */
  reorderKunReadings: (kanjiId: number, readingIds: number[]) => void
}

// =============================================================================
// Composable
// =============================================================================

export function useReadingRepository(): UseReadingRepository {
  const { exec, run } = useDatabase()

  // ===========================================================================
  // On-yomi Methods
  // ===========================================================================

  function getOnReadingsByKanjiId(kanjiId: number): OnReading[] {
    const result = exec(
      'SELECT * FROM on_readings WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return resultToOnReadingList(result)
  }

  function getOnReadingById(id: number): OnReading | null {
    const result = exec('SELECT * FROM on_readings WHERE id = ?', [id])
    const list = resultToOnReadingList(result)
    return list[0] ?? null
  }

  function createOnReading(input: CreateOnReadingInput): OnReading {
    // Get current max display_order for this kanji
    const maxResult = exec(
      'SELECT MAX(display_order) as max_order FROM on_readings WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO on_readings (kanji_id, reading, reading_level, display_order)
      VALUES (?, ?, ?, ?)
    `
    run(sql, [
      input.kanjiId,
      input.reading,
      input.readingLevel ?? '小',
      displayOrder
    ])

    // Get the newly created reading
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getOnReadingById(newId)
    if (!created) {
      throw new Error('Failed to create on-yomi reading')
    }
    return created
  }

  function updateOnReading(id: number, input: UpdateOnReadingInput): OnReading {
    const fields: string[] = []
    const values: unknown[] = []

    if (input.reading !== undefined) {
      fields.push('reading = ?')
      values.push(input.reading)
    }
    if (input.readingLevel !== undefined) {
      fields.push('reading_level = ?')
      values.push(input.readingLevel)
    }
    if (input.displayOrder !== undefined) {
      fields.push('display_order = ?')
      values.push(input.displayOrder)
    }

    if (fields.length === 0) {
      const existing = getOnReadingById(id)
      if (!existing) {
        throw new Error(`On-yomi reading with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE on_readings SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getOnReadingById(id)
    if (!updated) {
      throw new Error(`On-yomi reading with id ${String(id)} not found`)
    }
    return updated
  }

  function removeOnReading(id: number): void {
    run('DELETE FROM on_readings WHERE id = ?', [id])
  }

  function reorderOnReadings(kanjiId: number, readingIds: number[]): void {
    readingIds.forEach((readingId, index) => {
      run(
        'UPDATE on_readings SET display_order = ? WHERE id = ? AND kanji_id = ?',
        [index, readingId, kanjiId]
      )
    })
  }

  // ===========================================================================
  // Kun-yomi Methods
  // ===========================================================================

  function getKunReadingsByKanjiId(kanjiId: number): KunReading[] {
    const result = exec(
      'SELECT * FROM kun_readings WHERE kanji_id = ? ORDER BY display_order ASC',
      [kanjiId]
    )
    return resultToKunReadingList(result)
  }

  function getKunReadingById(id: number): KunReading | null {
    const result = exec('SELECT * FROM kun_readings WHERE id = ?', [id])
    const list = resultToKunReadingList(result)
    return list[0] ?? null
  }

  function createKunReading(input: CreateKunReadingInput): KunReading {
    // Get current max display_order for this kanji
    const maxResult = exec(
      'SELECT MAX(display_order) as max_order FROM kun_readings WHERE kanji_id = ?',
      [input.kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1
    const displayOrder = input.displayOrder ?? maxOrder + 1

    const sql = `
      INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order)
      VALUES (?, ?, ?, ?, ?)
    `
    run(sql, [
      input.kanjiId,
      input.reading,
      input.okurigana ?? null,
      input.readingLevel ?? '小',
      displayOrder
    ])

    // Get the newly created reading
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getKunReadingById(newId)
    if (!created) {
      throw new Error('Failed to create kun-yomi reading')
    }
    return created
  }

  function updateKunReading(
    id: number,
    input: UpdateKunReadingInput
  ): KunReading {
    const fields: string[] = []
    const values: unknown[] = []

    if (input.reading !== undefined) {
      fields.push('reading = ?')
      values.push(input.reading)
    }
    if (input.okurigana !== undefined) {
      fields.push('okurigana = ?')
      values.push(input.okurigana)
    }
    if (input.readingLevel !== undefined) {
      fields.push('reading_level = ?')
      values.push(input.readingLevel)
    }
    if (input.displayOrder !== undefined) {
      fields.push('display_order = ?')
      values.push(input.displayOrder)
    }

    if (fields.length === 0) {
      const existing = getKunReadingById(id)
      if (!existing) {
        throw new Error(`Kun-yomi reading with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE kun_readings SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getKunReadingById(id)
    if (!updated) {
      throw new Error(`Kun-yomi reading with id ${String(id)} not found`)
    }
    return updated
  }

  function removeKunReading(id: number): void {
    run('DELETE FROM kun_readings WHERE id = ?', [id])
  }

  function reorderKunReadings(kanjiId: number, readingIds: number[]): void {
    readingIds.forEach((readingId, index) => {
      run(
        'UPDATE kun_readings SET display_order = ? WHERE id = ? AND kanji_id = ?',
        [index, readingId, kanjiId]
      )
    })
  }

  return {
    // On-yomi
    getOnReadingsByKanjiId,
    getOnReadingById,
    createOnReading,
    updateOnReading,
    removeOnReading,
    reorderOnReadings,
    // Kun-yomi
    getKunReadingsByKanjiId,
    getKunReadingById,
    createKunReading,
    updateKunReading,
    removeKunReading,
    reorderKunReadings
  }
}
