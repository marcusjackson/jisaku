/**
 * Kanji Repository Composable
 *
 * Provides data access methods for kanji entries.
 * Uses the shared database composable for SQL operations.
 */

import { useDatabase } from '@/shared/composables/use-database'

import type {
  Component,
  CreateKanjiInput,
  Kanji,
  KanjiFilters,
  UpdateKanjiInput
} from '@/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface KanjiRow {
  id: number
  character: string
  stroke_count: number
  radical_id: number | null
  jlpt_level: string | null
  joyo_level: string | null
  stroke_diagram_image: Uint8Array | null
  stroke_gif_image: Uint8Array | null
  notes_etymology: string | null
  notes_cultural: string | null
  notes_personal: string | null
  created_at: string
  updated_at: string
}

function mapRowToKanji(row: KanjiRow): Kanji {
  return {
    id: row.id,
    character: row.character,
    strokeCount: row.stroke_count,
    radicalId: row.radical_id,
    jlptLevel: row.jlpt_level as Kanji['jlptLevel'],
    joyoLevel: row.joyo_level as Kanji['joyoLevel'],
    strokeDiagramImage: row.stroke_diagram_image,
    strokeGifImage: row.stroke_gif_image,
    notesEtymology: row.notes_etymology,
    notesCultural: row.notes_cultural,
    notesPersonal: row.notes_personal,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToKanjiList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): Kanji[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToKanji(obj as unknown as KanjiRow)
  })
}

// =============================================================================
// Component Row Mapping (for linked components)
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

export interface UseKanjiRepository {
  /** Get all kanji entries */
  getAll: () => Kanji[]
  /** Get all kanji with optional filters */
  search: (filters?: KanjiFilters) => Kanji[]
  /** Get a kanji by ID */
  getById: (id: number) => Kanji | null
  /** Get multiple kanji by IDs */
  getByIds: (ids: number[]) => Kanji[]
  /** Get a kanji by character */
  getByCharacter: (character: string) => Kanji | null
  /** Create a new kanji entry */
  create: (input: CreateKanjiInput) => Kanji
  /** Update an existing kanji entry */
  update: (id: number, input: UpdateKanjiInput) => Kanji
  /** Delete a kanji entry */
  remove: (id: number) => void
  /** Get component IDs linked to a kanji (ordered by position) */
  getLinkedComponentIds: (kanjiId: number) => number[]
  /** Get full component objects linked to a kanji (ordered by position) */
  getLinkedComponents: (kanjiId: number) => Component[]
  /** Save component links for a kanji (replaces existing links) */
  saveComponentLinks: (kanjiId: number, componentIds: number[]) => void
}

export function useKanjiRepository(): UseKanjiRepository {
  const { exec, run } = useDatabase()

  function getAll(): Kanji[] {
    const result = exec('SELECT * FROM kanjis ORDER BY id DESC')
    return resultToKanjiList(result)
  }

  function search(filters?: KanjiFilters): Kanji[] {
    if (!filters || Object.keys(filters).length === 0) {
      return getAll()
    }

    const conditions: string[] = []
    const params: unknown[] = []

    if (filters.character) {
      conditions.push('character = ?')
      params.push(filters.character)
    }

    if (filters.strokeCountMin !== undefined) {
      conditions.push('stroke_count >= ?')
      params.push(filters.strokeCountMin)
    }

    if (filters.strokeCountMax !== undefined) {
      conditions.push('stroke_count <= ?')
      params.push(filters.strokeCountMax)
    }

    if (filters.jlptLevels && filters.jlptLevels.length > 0) {
      const placeholders = filters.jlptLevels.map(() => '?').join(', ')
      conditions.push(`jlpt_level IN (${placeholders})`)
      params.push(...filters.jlptLevels)
    }

    if (filters.joyoLevels && filters.joyoLevels.length > 0) {
      const placeholders = filters.joyoLevels.map(() => '?').join(', ')
      conditions.push(`joyo_level IN (${placeholders})`)
      params.push(...filters.joyoLevels)
    }

    if (filters.radicalId !== undefined) {
      conditions.push('radical_id = ?')
      params.push(filters.radicalId)
    }

    if (filters.componentId !== undefined) {
      conditions.push(
        `id IN (SELECT kanji_id FROM kanji_components WHERE component_id = ?)`
      )
      params.push(filters.componentId)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    const sql = `SELECT * FROM kanjis ${whereClause} ORDER BY created_at DESC`

    const result = exec(sql, params)
    return resultToKanjiList(result)
  }

  function getById(id: number): Kanji | null {
    const result = exec('SELECT * FROM kanjis WHERE id = ?', [id])
    const list = resultToKanjiList(result)
    return list[0] ?? null
  }

  function getByIds(ids: number[]): Kanji[] {
    if (ids.length === 0) {
      return []
    }
    const placeholders = ids.map(() => '?').join(', ')
    const sql = `SELECT * FROM kanjis WHERE id IN (${placeholders}) ORDER BY id`
    const result = exec(sql, ids)
    return resultToKanjiList(result)
  }

  function getByCharacter(character: string): Kanji | null {
    const result = exec('SELECT * FROM kanjis WHERE character = ?', [character])
    const list = resultToKanjiList(result)
    return list[0] ?? null
  }

  function create(input: CreateKanjiInput): Kanji {
    const sql = `
      INSERT INTO kanjis (character, stroke_count, radical_id, jlpt_level, joyo_level, stroke_diagram_image, stroke_gif_image, notes_etymology, notes_cultural, notes_personal)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    run(sql, [
      input.character,
      input.strokeCount,
      input.radicalId ?? null,
      input.jlptLevel ?? null,
      input.joyoLevel ?? null,
      input.strokeDiagramImage ?? null,
      input.strokeGifImage ?? null,
      input.notesEtymology ?? null,
      input.notesCultural ?? null,
      input.notesPersonal ?? null
    ])

    // Get the newly created kanji
    const idResult = exec('SELECT last_insert_rowid() as id')
    const newId = idResult[0]?.values[0]?.[0] as number
    const created = getById(newId)
    if (!created) {
      throw new Error('Failed to create kanji')
    }
    return created
  }

  function update(id: number, input: UpdateKanjiInput): Kanji {
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
    if (input.radicalId !== undefined) {
      fields.push('radical_id = ?')
      values.push(input.radicalId)
    }
    if (input.jlptLevel !== undefined) {
      fields.push('jlpt_level = ?')
      values.push(input.jlptLevel)
    }
    if (input.joyoLevel !== undefined) {
      fields.push('joyo_level = ?')
      values.push(input.joyoLevel)
    }
    if (input.strokeDiagramImage !== undefined) {
      fields.push('stroke_diagram_image = ?')
      values.push(input.strokeDiagramImage)
    }
    if (input.strokeGifImage !== undefined) {
      fields.push('stroke_gif_image = ?')
      values.push(input.strokeGifImage)
    }
    if (input.notesEtymology !== undefined) {
      fields.push('notes_etymology = ?')
      values.push(input.notesEtymology)
    }
    if (input.notesCultural !== undefined) {
      fields.push('notes_cultural = ?')
      values.push(input.notesCultural)
    }
    if (input.notesPersonal !== undefined) {
      fields.push('notes_personal = ?')
      values.push(input.notesPersonal)
    }

    if (fields.length === 0) {
      const existing = getById(id)
      if (!existing) {
        throw new Error(`Kanji with id ${String(id)} not found`)
      }
      return existing
    }

    values.push(id)
    const sql = `UPDATE kanjis SET ${fields.join(', ')} WHERE id = ?`
    run(sql, values)

    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function remove(id: number): void {
    run('DELETE FROM kanjis WHERE id = ?', [id])
  }

  function getLinkedComponentIds(kanjiId: number): number[] {
    const result = exec(
      'SELECT component_id FROM kanji_components WHERE kanji_id = ? ORDER BY position',
      [kanjiId]
    )
    if (!result[0]) {
      return []
    }
    return result[0].values.map((row) => row[0] as number)
  }

  function getLinkedComponents(kanjiId: number): Component[] {
    const result = exec(
      `SELECT c.* FROM components c
       JOIN kanji_components kc ON c.id = kc.component_id
       WHERE kc.kanji_id = ?
       ORDER BY kc.position`,
      [kanjiId]
    )
    return resultToComponentList(result)
  }

  function saveComponentLinks(kanjiId: number, componentIds: number[]): void {
    // Clear existing links
    run('DELETE FROM kanji_components WHERE kanji_id = ?', [kanjiId])

    // Insert new links with position
    componentIds.forEach((componentId, index) => {
      run(
        'INSERT INTO kanji_components (kanji_id, component_id, position) VALUES (?, ?, ?)',
        [kanjiId, componentId, index]
      )
    })
  }

  return {
    create,
    getAll,
    getByCharacter,
    getById,
    getByIds,
    getLinkedComponentIds,
    getLinkedComponents,
    remove,
    saveComponentLinks,
    search,
    update
  }
}
