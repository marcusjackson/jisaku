/**
 * Radical Repository Composable
 *
 * Provides data access methods for radical entries (Kangxi radicals).
 * After migration 003, radicals are stored in the components table with canBeRadical=true.
 * This composable queries components and returns them filtered by canBeRadical.
 */

import { useDatabase } from '@/legacy/shared/composables/use-database'

import type { Component } from '@/legacy/shared/types/database-types'

// =============================================================================
// Row Mapping
// =============================================================================

interface ComponentRow {
  id: number
  character: string
  stroke_count: number
  short_meaning: string | null
  description: string | null
  search_keywords: string | null
  source_kanji_id: number | null
  can_be_radical: number
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
    description: row.description,
    searchKeywords: row.search_keywords,
    sourceKanjiId: row.source_kanji_id,
    canBeRadical: row.can_be_radical === 1,
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

export interface UseRadicalRepository {
  /** Get all radical components (components with canBeRadical=true) */
  getAll: () => Component[]
  /** Get a radical component by ID */
  getById: (id: number) => Component | null
  /** Get a radical component by Kangxi number */
  getByNumber: (number: number) => Component | null
  /** Get a radical component by character */
  getByCharacter: (character: string) => Component | null
  /** Get all components that can be radicals (alias for getAll, for clarity) */
  getRadicalOptions: () => Component[]
}

export function useRadicalRepository(): UseRadicalRepository {
  const { exec } = useDatabase()

  function getAll(): Component[] {
    const result = exec(
      'SELECT * FROM components WHERE can_be_radical = 1 ORDER BY kangxi_number ASC'
    )
    return resultToComponentList(result)
  }

  function getById(id: number): Component | null {
    const result = exec(
      'SELECT * FROM components WHERE id = ? AND can_be_radical = 1',
      [id]
    )
    const list = resultToComponentList(result)
    return list[0] ?? null
  }

  function getByNumber(number: number): Component | null {
    const result = exec(
      'SELECT * FROM components WHERE kangxi_number = ? AND can_be_radical = 1',
      [number]
    )
    const list = resultToComponentList(result)
    return list[0] ?? null
  }

  function getByCharacter(character: string): Component | null {
    const result = exec(
      'SELECT * FROM components WHERE character = ? AND can_be_radical = 1',
      [character]
    )
    const list = resultToComponentList(result)
    return list[0] ?? null
  }

  return {
    getAll,
    getByCharacter,
    getById,
    getByNumber,
    getRadicalOptions: getAll
  }
}
