/**
 * Component Repository - Query Operations
 *
 * Read-only data access for component entities.
 *
 * @module api/component
 */

import { useDatabase } from '@/shared/composables/use-database'

import { BaseRepository } from '../base-repository'

import type { Component, ComponentFilters } from './component-types'

// ============================================================================
// Row Type
// ============================================================================

interface ComponentRow {
  id: number
  character: string
  stroke_count: number | null
  short_meaning: string | null
  search_keywords: string | null
  source_kanji_id: number | null
  description: string | null
  can_be_radical: number
  kangxi_number: number | null
  kangxi_meaning: string | null
  radical_name_japanese: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Query Operations
// ============================================================================

export class ComponentQueries extends BaseRepository<Component> {
  protected tableName = 'components'

  private readonly exec: ReturnType<typeof useDatabase>['exec']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
  }

  protected mapRow(row: Record<string, unknown>): Component {
    const r = row as unknown as ComponentRow
    return {
      id: r.id,
      character: r.character,
      strokeCount: r.stroke_count,
      shortMeaning: r.short_meaning,
      searchKeywords: r.search_keywords,
      sourceKanjiId: r.source_kanji_id,
      description: r.description,
      canBeRadical: r.can_be_radical === 1,
      kangxiNumber: r.kangxi_number,
      kangxiMeaning: r.kangxi_meaning,
      radicalNameJapanese: r.radical_name_japanese,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  getById(id: number): Component | null {
    const result = this.exec('SELECT * FROM components WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): Component[] {
    const result = this.exec('SELECT * FROM components ORDER BY id DESC')
    return this.resultToList(result)
  }

  getByCharacter(character: string): Component | null {
    const result = this.exec('SELECT * FROM components WHERE character = ?', [
      character
    ])
    return this.resultToEntity(result)
  }

  getByIds(ids: number[]): Component[] {
    if (ids.length === 0) return []
    const placeholders = ids.map(() => '?').join(', ')
    const result = this.exec(
      `SELECT * FROM components WHERE id IN (${placeholders}) ORDER BY id`,
      ids
    )
    return this.resultToList(result)
  }

  /** Get all components that can function as radicals */
  getRadicals(): Component[] {
    const result = this.exec(
      'SELECT * FROM components WHERE can_be_radical = 1 ORDER BY kangxi_number'
    )
    return this.resultToList(result)
  }

  /** Get component by Kangxi radical number */
  getByKangxiNumber(kangxiNumber: number): Component | null {
    const result = this.exec(
      'SELECT * FROM components WHERE kangxi_number = ?',
      [kangxiNumber]
    )
    return this.resultToEntity(result)
  }

  /** Search components with filters */
  search(filters?: ComponentFilters): Component[] {
    if (!filters || Object.keys(filters).length === 0) {
      return this.getAll()
    }

    const conditions: string[] = []
    const params: unknown[] = []

    if (filters.search) {
      conditions.push(
        '(character LIKE ? OR short_meaning LIKE ? OR search_keywords LIKE ?)'
      )
      const pattern = `%${filters.search}%`
      params.push(pattern, pattern, pattern)
    }

    if (filters.kangxiSearch) {
      const searchLower = filters.kangxiSearch.toLowerCase().trim()
      const num = parseInt(searchLower, 10)
      if (!isNaN(num)) {
        // If it's a number, search both kangxi_number and kangxi_meaning
        conditions.push('(kangxi_number = ? OR kangxi_meaning LIKE ?)')
        params.push(num, `%${searchLower}%`)
      } else {
        // Otherwise just search kangxi_meaning
        conditions.push('kangxi_meaning LIKE ?')
        params.push(`%${searchLower}%`)
      }
    }

    if (filters.canBeRadical !== undefined) {
      conditions.push('can_be_radical = ?')
      params.push(filters.canBeRadical ? 1 : 0)
    }

    if (filters.kangxiNumber !== undefined) {
      conditions.push('kangxi_number = ?')
      params.push(filters.kangxiNumber)
    }

    if (filters.strokeCountMin !== undefined) {
      conditions.push('stroke_count >= ?')
      params.push(filters.strokeCountMin)
    }

    if (filters.strokeCountMax !== undefined) {
      conditions.push('stroke_count <= ?')
      params.push(filters.strokeCountMax)
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const sql = `SELECT * FROM components ${whereClause} ORDER BY id DESC`
    const result = this.exec(sql, params)
    return this.resultToList(result)
  }

  /** Get count of forms per component */
  getFormsCount(): Map<number, number> {
    const sql = `
      SELECT component_id, COUNT(*) as count 
      FROM component_forms 
      GROUP BY component_id
    `
    const result = this.exec(sql, [])
    const map = new Map<number, number>()
    if (result[0]?.values) {
      for (const row of result[0].values) {
        const componentId = row[0] as number
        const count = row[1] as number
        map.set(componentId, count)
      }
    }
    return map
  }

  /** Get count of groupings per component */
  getGroupingsCount(): Map<number, number> {
    const sql = `
      SELECT component_id, COUNT(*) as count 
      FROM component_groupings 
      GROUP BY component_id
    `
    const result = this.exec(sql, [])
    const map = new Map<number, number>()
    if (result[0]?.values) {
      for (const row of result[0].values) {
        const componentId = row[0] as number
        const count = row[1] as number
        map.set(componentId, count)
      }
    }
    return map
  }
}
