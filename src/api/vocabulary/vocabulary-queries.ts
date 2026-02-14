/**
 * Vocabulary Repository - Query Operations
 *
 * Read-only data access for vocabulary entities.
 *
 * @module api/vocabulary
 */

import { useDatabase } from '@/shared/composables/use-database'

import { BaseRepository } from '../base-repository'

import type { Vocabulary, VocabularyFilters } from './vocabulary-types'

// ============================================================================
// Search Condition Builders
// ============================================================================

interface SearchConditions {
  conditions: string[]
  params: unknown[]
}

function buildSearchConditions(filters: VocabularyFilters): SearchConditions {
  const conditions: string[] = []
  const params: unknown[] = []

  addWordCondition(filters, conditions, params)
  addSearchCondition(filters, conditions, params)
  addKanaCondition(filters, conditions, params)
  addJlptCondition(filters, conditions, params)
  addCommonCondition(filters, conditions, params)
  addKanjiConditions(filters, conditions, params)
  addDescriptionCondition(filters, conditions)

  return { conditions, params }
}

function addWordCondition(
  filters: VocabularyFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.word) {
    conditions.push('word LIKE ?')
    params.push(`%${filters.word}%`)
  }
}

function addSearchCondition(
  filters: VocabularyFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.search) {
    conditions.push('(short_meaning LIKE ? OR search_keywords LIKE ?)')
    const pattern = `%${filters.search}%`
    params.push(pattern, pattern)
  }
}

function addKanaCondition(
  filters: VocabularyFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.kana) {
    conditions.push('kana LIKE ?')
    params.push(`%${filters.kana}%`)
  }
}

function addJlptCondition(
  filters: VocabularyFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.jlptLevels?.length) {
    const placeholders = filters.jlptLevels.map(() => '?').join(', ')
    conditions.push(`jlpt_level IN (${placeholders})`)
    params.push(...filters.jlptLevels)
  }
}

function addCommonCondition(
  filters: VocabularyFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.isCommon !== undefined) {
    conditions.push('is_common = ?')
    params.push(filters.isCommon ? 1 : 0)
  }
}

function addKanjiConditions(
  filters: VocabularyFilters,
  conditions: string[],
  params: unknown[]
): void {
  if (filters.containsKanjiId !== undefined) {
    conditions.push(
      'id IN (SELECT vocab_id FROM vocab_kanji WHERE kanji_id = ?)'
    )
    params.push(filters.containsKanjiId)
  }

  if (filters.containsKanjiIds?.length) {
    // AND logic: vocab must contain ALL specified kanji
    const subqueries = filters.containsKanjiIds.map(
      () => 'id IN (SELECT vocab_id FROM vocab_kanji WHERE kanji_id = ?)'
    )
    conditions.push(`(${subqueries.join(' AND ')})`)
    params.push(...filters.containsKanjiIds)
  }
}

function addDescriptionCondition(
  filters: VocabularyFilters,
  conditions: string[]
): void {
  if (filters.descriptionFilled === 'filled') {
    conditions.push("description IS NOT NULL AND description != ''")
  } else if (filters.descriptionFilled === 'empty') {
    conditions.push("(description IS NULL OR description = '')")
  }
}

// ============================================================================
// Row Type
// ============================================================================

interface VocabularyRow {
  id: number
  word: string
  kana: string
  short_meaning: string | null
  search_keywords: string | null
  jlpt_level: string | null
  is_common: number
  description: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Query Operations
// ============================================================================

export class VocabularyQueries extends BaseRepository<Vocabulary> {
  protected tableName = 'vocabulary'

  private readonly exec: ReturnType<typeof useDatabase>['exec']

  constructor() {
    super()
    const db = useDatabase()
    this.exec = db.exec
  }

  protected mapRow(row: Record<string, unknown>): Vocabulary {
    const r = row as unknown as VocabularyRow
    return {
      id: r.id,
      word: r.word,
      kana: r.kana,
      shortMeaning: r.short_meaning,
      searchKeywords: r.search_keywords,
      jlptLevel: r.jlpt_level as Vocabulary['jlptLevel'],
      isCommon: r.is_common === 1,
      description: r.description,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    }
  }

  getById(id: number): Vocabulary | null {
    const result = this.exec('SELECT * FROM vocabulary WHERE id = ?', [id])
    return this.resultToEntity(result)
  }

  getAll(): Vocabulary[] {
    const result = this.exec('SELECT * FROM vocabulary ORDER BY id DESC')
    return this.resultToList(result)
  }

  getByWord(word: string): Vocabulary | null {
    const result = this.exec('SELECT * FROM vocabulary WHERE word = ?', [word])
    return this.resultToEntity(result)
  }

  getByIds(ids: number[]): Vocabulary[] {
    if (ids.length === 0) return []
    const placeholders = ids.map(() => '?').join(', ')
    const result = this.exec(
      `SELECT * FROM vocabulary WHERE id IN (${placeholders}) ORDER BY id`,
      ids
    )
    return this.resultToList(result)
  }

  /** Get common vocabulary */
  getCommonWords(): Vocabulary[] {
    const result = this.exec(
      'SELECT * FROM vocabulary WHERE is_common = 1 ORDER BY id ASC'
    )
    return this.resultToList(result)
  }

  /** Search vocabulary with filters */
  search(filters?: VocabularyFilters): Vocabulary[] {
    if (!filters || Object.keys(filters).length === 0) {
      return this.getAll()
    }

    const { conditions, params } = buildSearchConditions(filters)

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const sql = `SELECT * FROM vocabulary ${whereClause} ORDER BY id DESC`
    const result = this.exec(sql, params)
    return this.resultToList(result)
  }
}
