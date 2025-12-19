/**
 * Vocabulary Repository Composable
 *
 * Provides data access methods for vocabulary entries.
 * Uses the shared database composable for SQL operations.
 */

import { useDatabase } from '@/shared/composables/use-database'

import type {
  CreateVocabularyInput,
  JlptLevel,
  Vocabulary,
  VocabularyFilters
} from '@/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface VocabularyRow {
  id: number
  word: string
  kana: string | null
  short_meaning: string | null
  search_keywords: string | null
  jlpt_level: string | null
  is_common: number
  description: string | null
  created_at: string
  updated_at: string
}

function mapRowToVocabulary(row: VocabularyRow): Vocabulary {
  return {
    id: row.id,
    word: row.word,
    kana: row.kana,
    shortMeaning: row.short_meaning,
    searchKeywords: row.search_keywords,
    jlptLevel: row.jlpt_level as JlptLevel | null,
    isCommon: Boolean(row.is_common),
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function resultToVocabularyList(
  result: ReturnType<ReturnType<typeof useDatabase>['exec']>
): Vocabulary[] {
  if (!result[0]) {
    return []
  }

  const { columns, values } = result[0]

  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return mapRowToVocabulary(obj as unknown as VocabularyRow)
  })
}

// =============================================================================
// Composable
// =============================================================================

export interface UseVocabularyRepository {
  /** Get all vocabulary entries */
  getAll: () => Vocabulary[]
  /** Get vocabulary by ID */
  getById: (id: number) => Vocabulary | null
  /** Get vocabulary by word */
  getByWord: (word: string) => Vocabulary | null
  /** Search vocabulary with filters */
  search: (filters?: VocabularyFilters) => Vocabulary[]
  /** Create a new vocabulary entry */
  create: (input: CreateVocabularyInput) => Vocabulary
  /** Update header fields (word, kana, shortMeaning, searchKeywords) */
  updateHeaderFields: (
    id: number,
    word: string,
    kana: string | null,
    shortMeaning: string | null,
    searchKeywords: string | null
  ) => Vocabulary
  /** Update a single basic info field */
  updateBasicInfoField: (
    id: number,
    field: 'jlpt_level' | 'is_common' | 'description',
    value: unknown
  ) => Vocabulary
  /** Delete a vocabulary entry */
  remove: (id: number) => void
}

export function useVocabularyRepository(): UseVocabularyRepository {
  const { exec, run } = useDatabase()

  function getAll(): Vocabulary[] {
    const result = exec(`
      SELECT id, word, kana, short_meaning, search_keywords,
             jlpt_level, is_common, description,
             created_at, updated_at
      FROM vocabulary
      ORDER BY word
    `)
    return resultToVocabularyList(result)
  }

  function getById(id: number): Vocabulary | null {
    const result = exec(
      `
      SELECT id, word, kana, short_meaning, search_keywords,
             jlpt_level, is_common, description,
             created_at, updated_at
      FROM vocabulary
      WHERE id = ?
    `,
      [id]
    )

    const list = resultToVocabularyList(result)
    return list[0] ?? null
  }

  function getByWord(word: string): Vocabulary | null {
    const result = exec(
      `
      SELECT id, word, kana, short_meaning, search_keywords,
             jlpt_level, is_common, description,
             created_at, updated_at
      FROM vocabulary
      WHERE word = ?
    `,
      [word]
    )

    const list = resultToVocabularyList(result)
    return list[0] ?? null
  }

  function search(filters?: VocabularyFilters): Vocabulary[] {
    if (!filters || Object.keys(filters).length === 0) {
      return getAll()
    }

    let sql = `
      SELECT DISTINCT v.id, v.word, v.kana, v.short_meaning, v.search_keywords,
             v.jlpt_level, v.is_common, v.description,
             v.created_at, v.updated_at
      FROM vocabulary v
    `

    const whereClauses: string[] = []
    const params: unknown[] = []

    // Join for kanji filter
    if (filters.containsKanjiId !== undefined) {
      sql += ' INNER JOIN vocab_kanji vk ON v.id = vk.vocab_id'
      whereClauses.push('vk.kanji_id = ?')
      params.push(filters.containsKanjiId)
    }

    // Search text (across multiple fields)
    if (filters.searchText) {
      whereClauses.push(`
        (v.word LIKE ? OR v.kana LIKE ? OR 
         v.short_meaning LIKE ? OR v.search_keywords LIKE ?)
      `)
      const searchPattern = `%${filters.searchText}%`
      params.push(searchPattern, searchPattern, searchPattern, searchPattern)
    }

    // JLPT levels filter
    if (filters.jlptLevels && filters.jlptLevels.length > 0) {
      const placeholders = filters.jlptLevels.map(() => '?').join(',')
      whereClauses.push(`v.jlpt_level IN (${placeholders})`)
      params.push(...filters.jlptLevels)
    }

    // Common filter
    if (filters.isCommon !== undefined) {
      whereClauses.push('v.is_common = ?')
      params.push(filters.isCommon ? 1 : 0)
    }

    if (whereClauses.length > 0) {
      sql += ` WHERE ${whereClauses.join(' AND ')}`
    }

    sql += ' ORDER BY v.word'

    const result = exec(sql, params)
    return resultToVocabularyList(result)
  }

  function create(input: CreateVocabularyInput): Vocabulary {
    run(
      `
      INSERT INTO vocabulary (word, kana, short_meaning, search_keywords,
                              jlpt_level, is_common, description)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      [
        input.word,
        input.kana ?? null,
        input.shortMeaning ?? null,
        input.searchKeywords ?? null,
        input.jlptLevel ?? null,
        input.isCommon ? 1 : 0,
        input.description ?? null
      ]
    )

    const result = exec('SELECT last_insert_rowid()')
    const id = result[0]?.values[0]?.[0] as number
    const created = getById(id)
    if (!created) throw new Error('Failed to create vocabulary')
    return created
  }

  function updateHeaderFields(
    id: number,
    word: string,
    kana: string | null,
    shortMeaning: string | null,
    searchKeywords: string | null
  ): Vocabulary {
    run(
      `
      UPDATE vocabulary
      SET word = ?, kana = ?, short_meaning = ?, search_keywords = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [word, kana, shortMeaning, searchKeywords, id]
    )

    const updated = getById(id)
    if (!updated) throw new Error(`Vocabulary with id ${String(id)} not found`)
    return updated
  }

  function updateBasicInfoField(
    id: number,
    field: 'jlpt_level' | 'is_common' | 'description',
    value: unknown
  ): Vocabulary {
    const validFields = ['jlpt_level', 'is_common', 'description']
    if (!validFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`)
    }

    // Convert boolean to integer for is_common
    const dbValue = field === 'is_common' ? (value ? 1 : 0) : value

    run(
      `
      UPDATE vocabulary
      SET ${field} = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [dbValue, id]
    )

    const updated = getById(id)
    if (!updated) throw new Error(`Vocabulary with id ${String(id)} not found`)
    return updated
  }

  function remove(id: number): void {
    // vocab_kanji entries will be deleted by ON DELETE CASCADE
    run('DELETE FROM vocabulary WHERE id = ?', [id])
  }

  return {
    create,
    getAll,
    getById,
    getByWord,
    remove,
    search,
    updateBasicInfoField,
    updateHeaderFields
  }
}
