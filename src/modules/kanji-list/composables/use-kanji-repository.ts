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
  JlptLevel,
  JoyoLevel,
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
  short_meaning: string | null
  search_keywords: string | null
  radical_id: number | null
  jlpt_level: string | null
  joyo_level: string | null
  kanji_kentei_level: string | null
  stroke_diagram_image: Uint8Array | null
  stroke_gif_image: Uint8Array | null
  notes_etymology: string | null
  notes_semantic: string | null
  notes_education_mnemonics: string | null
  notes_personal: string | null
  identifier: number | null
  radical_stroke_count: number | null
  created_at: string
  updated_at: string
}

function mapRowToKanji(row: KanjiRow): Kanji {
  return {
    id: row.id,
    character: row.character,
    strokeCount: row.stroke_count,
    shortMeaning: row.short_meaning,
    searchKeywords: row.search_keywords,
    radicalId: row.radical_id,
    jlptLevel: row.jlpt_level as Kanji['jlptLevel'],
    joyoLevel: row.joyo_level as Kanji['joyoLevel'],
    kenteiLevel: row.kanji_kentei_level,
    strokeDiagramImage: row.stroke_diagram_image,
    strokeGifImage: row.stroke_gif_image,
    notesEtymology: row.notes_etymology,
    notesSemantic: row.notes_semantic,
    notesEducationMnemonics: row.notes_education_mnemonics,
    notesPersonal: row.notes_personal,
    identifier: row.identifier,
    radicalStrokeCount: row.radical_stroke_count,
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
  short_meaning: string | null
  source_kanji_id: number | null
  search_keywords: string | null
  description: string | null
  can_be_radical: number | null
  kangxi_number: number | null
  kangxi_meaning: string | null
  radical_name_japanese: string | null
  created_at: string
  updated_at: string
}

function mapRowToComponent(row: ComponentRow): Component {
  return {
    id: row.id,
    character: row.character,
    strokeCount: row.stroke_count,
    shortMeaning: row.short_meaning,
    sourceKanjiId: row.source_kanji_id,
    searchKeywords: row.search_keywords,
    description: row.description,
    canBeRadical: Boolean(row.can_be_radical),
    kangxiNumber: row.kangxi_number,
    kangxiMeaning: row.kangxi_meaning,
    radicalNameJapanese: row.radical_name_japanese,
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

  // Field-level update methods for inline editing
  /** Update header fields (character, shortMeaning, searchKeywords) */
  updateHeaderFields: (
    id: number,
    character: string,
    shortMeaning: string | null,
    searchKeywords: string | null
  ) => Kanji
  /** Update stroke count */
  updateStrokeCount: (id: number, strokeCount: number) => Kanji
  /** Update JLPT level */
  updateJlptLevel: (id: number, level: JlptLevel | null) => Kanji
  /** Update Joyo level */
  updateJoyoLevel: (id: number, level: JoyoLevel | null) => Kanji
  /** Update Kentei level */
  updateKenteiLevel: (id: number, level: string | null) => Kanji
  /** Update radical ID */
  updateRadicalId: (id: number, radicalId: number | null) => Kanji
  /** Update etymology notes */
  updateNotesEtymology: (id: number, notes: string | null) => Kanji
  /** Update semantic notes */
  updateNotesSemantic: (id: number, notes: string | null) => Kanji
  /** Update education/mnemonics notes */
  updateNotesEducation: (id: number, notes: string | null) => Kanji
  /** Update personal notes */
  updateNotesPersonal: (id: number, notes: string | null) => Kanji
  /** Update stroke images */
  updateStrokeImages: (
    id: number,
    diagram: Uint8Array | null,
    gif: Uint8Array | null
  ) => Kanji
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

    if (filters.kenteiLevels && filters.kenteiLevels.length > 0) {
      const placeholders = filters.kenteiLevels.map(() => '?').join(', ')
      conditions.push(`kanji_kentei_level IN (${placeholders})`)
      params.push(...filters.kenteiLevels)
    }

    if (filters.radicalId !== undefined) {
      conditions.push('radical_id = ?')
      params.push(filters.radicalId)
    }

    if (filters.componentId !== undefined) {
      conditions.push(
        `id IN (SELECT kanji_id FROM component_occurrences WHERE component_id = ?)`
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
      INSERT INTO kanjis (character, stroke_count, short_meaning, search_keywords, radical_id, jlpt_level, joyo_level, kanji_kentei_level, stroke_diagram_image, stroke_gif_image, notes_etymology, notes_semantic, notes_education_mnemonics, notes_personal, identifier, radical_stroke_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    run(sql, [
      input.character,
      input.strokeCount,
      input.shortMeaning ?? null,
      input.searchKeywords ?? null,
      input.radicalId ?? null,
      input.jlptLevel ?? null,
      input.joyoLevel ?? null,
      input.kenteiLevel ?? null,
      input.strokeDiagramImage ?? null,
      input.strokeGifImage ?? null,
      input.notesEtymology ?? null,
      input.notesSemantic ?? null,
      input.notesEducationMnemonics ?? null,
      input.notesPersonal ?? null,
      input.identifier ?? null,
      input.radicalStrokeCount ?? null
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
    if (input.shortMeaning !== undefined) {
      fields.push('short_meaning = ?')
      values.push(input.shortMeaning)
    }
    if (input.searchKeywords !== undefined) {
      fields.push('search_keywords = ?')
      values.push(input.searchKeywords)
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
    if (input.kenteiLevel !== undefined) {
      fields.push('kanji_kentei_level = ?')
      values.push(input.kenteiLevel)
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
    if (input.notesSemantic !== undefined) {
      fields.push('notes_semantic = ?')
      values.push(input.notesSemantic)
    }
    if (input.notesEducationMnemonics !== undefined) {
      fields.push('notes_education_mnemonics = ?')
      values.push(input.notesEducationMnemonics)
    }
    if (input.notesPersonal !== undefined) {
      fields.push('notes_personal = ?')
      values.push(input.notesPersonal)
    }
    if (input.identifier !== undefined) {
      fields.push('identifier = ?')
      values.push(input.identifier)
    }
    if (input.radicalStrokeCount !== undefined) {
      fields.push('radical_stroke_count = ?')
      values.push(input.radicalStrokeCount)
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
    // First delete all component occurrences for this kanji
    run('DELETE FROM component_occurrences WHERE kanji_id = ?', [id])
    // Then delete the kanji itself
    run('DELETE FROM kanjis WHERE id = ?', [id])
  }

  function getLinkedComponentIds(kanjiId: number): number[] {
    const result = exec(
      'SELECT component_id FROM component_occurrences WHERE kanji_id = ? ORDER BY display_order',
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
       JOIN component_occurrences co ON c.id = co.component_id
       WHERE co.kanji_id = ?
       ORDER BY co.display_order`,
      [kanjiId]
    )
    return resultToComponentList(result)
  }

  function saveComponentLinks(kanjiId: number, componentIds: number[]): void {
    // Get current component IDs linked to this kanji
    const currentComponentIds = getLinkedComponentIds(kanjiId)

    // Find components to remove (in current but not in new list)
    const toRemove = currentComponentIds.filter(
      (id) => !componentIds.includes(id)
    )

    // Find components to add (in new list but not in current)
    const toAdd = componentIds.filter((id) => !currentComponentIds.includes(id))

    // Remove old links that are no longer needed
    if (toRemove.length > 0) {
      const placeholders = toRemove.map(() => '?').join(',')
      run(
        `DELETE FROM component_occurrences WHERE kanji_id = ? AND component_id IN (${placeholders})`,
        [kanjiId, ...toRemove]
      )
    }

    // Insert new links with display_order (preserving existing occurrences)
    toAdd.forEach((componentId) => {
      const displayOrder = componentIds.indexOf(componentId)
      run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, componentId, displayOrder]
      )
    })

    // Update display_order for existing links
    componentIds.forEach((componentId, index) => {
      if (!toAdd.includes(componentId)) {
        run(
          'UPDATE component_occurrences SET display_order = ? WHERE kanji_id = ? AND component_id = ?',
          [index, kanjiId, componentId]
        )
      }
    })
  }

  // =============================================================================
  // Field-Level Update Methods
  // =============================================================================

  function updateHeaderFields(
    id: number,
    character: string,
    shortMeaning: string | null,
    searchKeywords: string | null
  ): Kanji {
    run(
      'UPDATE kanjis SET character = ?, short_meaning = ?, search_keywords = ? WHERE id = ?',
      [character, shortMeaning, searchKeywords, id]
    )
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateStrokeCount(id: number, strokeCount: number): Kanji {
    run('UPDATE kanjis SET stroke_count = ? WHERE id = ?', [strokeCount, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateJlptLevel(id: number, level: JlptLevel | null): Kanji {
    run('UPDATE kanjis SET jlpt_level = ? WHERE id = ?', [level, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateJoyoLevel(id: number, level: JoyoLevel | null): Kanji {
    run('UPDATE kanjis SET joyo_level = ? WHERE id = ?', [level, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateKenteiLevel(id: number, level: string | null): Kanji {
    run('UPDATE kanjis SET kanji_kentei_level = ? WHERE id = ?', [level, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateRadicalId(id: number, radicalId: number | null): Kanji {
    run('UPDATE kanjis SET radical_id = ? WHERE id = ?', [radicalId, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateNotesEtymology(id: number, notes: string | null): Kanji {
    run('UPDATE kanjis SET notes_etymology = ? WHERE id = ?', [notes, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateNotesSemantic(id: number, notes: string | null): Kanji {
    run('UPDATE kanjis SET notes_semantic = ? WHERE id = ?', [notes, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateNotesEducation(id: number, notes: string | null): Kanji {
    run('UPDATE kanjis SET notes_education_mnemonics = ? WHERE id = ?', [
      notes,
      id
    ])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateNotesPersonal(id: number, notes: string | null): Kanji {
    run('UPDATE kanjis SET notes_personal = ? WHERE id = ?', [notes, id])
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
  }

  function updateStrokeImages(
    id: number,
    diagram: Uint8Array | null,
    gif: Uint8Array | null
  ): Kanji {
    run(
      'UPDATE kanjis SET stroke_diagram_image = ?, stroke_gif_image = ? WHERE id = ?',
      [diagram, gif, id]
    )
    const updated = getById(id)
    if (!updated) {
      throw new Error(`Kanji with id ${String(id)} not found`)
    }
    return updated
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
    update,
    // Field-level updates
    updateHeaderFields,
    updateJlptLevel,
    updateJoyoLevel,
    updateKenteiLevel,
    updateNotesEducation,
    updateNotesEtymology,
    updateNotesPersonal,
    updateNotesSemantic,
    updateRadicalId,
    updateStrokeCount,
    updateStrokeImages
  }
}
