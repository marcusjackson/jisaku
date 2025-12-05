/**
 * Tests for useKanjiRepository composable
 */

import { createTestDatabase, seedKanji } from '@test/helpers/database'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Database } from 'sql.js'

// We need to mock the useDatabase composable
// since useKanjiRepository depends on it
let testDb: Database

// Mock useDatabase
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { useKanjiRepository } from './use-kanji-repository'

describe('useKanjiRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getAll', () => {
    it('returns empty array when no kanji exist', () => {
      const { getAll } = useKanjiRepository()
      const result = getAll()
      expect(result).toEqual([])
    })

    it('returns all kanji ordered by id desc (most recent first)', () => {
      seedKanji(testDb, { character: '日', strokeCount: 4 })
      seedKanji(testDb, { character: '月', strokeCount: 4 })
      seedKanji(testDb, { character: '水', strokeCount: 4 })

      const { getAll } = useKanjiRepository()
      const result = getAll()

      expect(result).toHaveLength(3)
      // Most recent first (highest id)
      expect(result[0]?.character).toBe('水')
      expect(result[1]?.character).toBe('月')
      expect(result[2]?.character).toBe('日')
    })

    it('maps database columns to camelCase properties', () => {
      seedKanji(testDb, {
        character: '日',
        strokeCount: 4,
        jlptLevel: 'N5',
        joyoLevel: 'elementary1',
        notesEtymology: null,
        notesCultural: null,
        notesPersonal: 'Test note'
      })

      const { getAll } = useKanjiRepository()
      const result = getAll()

      expect(result[0]).toMatchObject({
        character: '日',
        strokeCount: 4,
        jlptLevel: 'N5',
        joyoLevel: 'elementary1',
        notesEtymology: null,
        notesCultural: null,
        notesPersonal: 'Test note'
      })
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('createdAt')
      expect(result[0]).toHaveProperty('updatedAt')
    })
  })

  describe('getById', () => {
    it('returns null when kanji does not exist', () => {
      const { getById } = useKanjiRepository()
      const result = getById(999)
      expect(result).toBeNull()
    })

    it('returns kanji by id', () => {
      const seeded = seedKanji(testDb, { character: '日', strokeCount: 4 })

      const { getById } = useKanjiRepository()
      const result = getById(seeded.id)

      expect(result).not.toBeNull()
      expect(result?.character).toBe('日')
    })
  })

  describe('getByCharacter', () => {
    it('returns null when kanji does not exist', () => {
      const { getByCharacter } = useKanjiRepository()
      const result = getByCharacter('日')
      expect(result).toBeNull()
    })

    it('returns kanji by character', () => {
      seedKanji(testDb, { character: '日', strokeCount: 4 })

      const { getByCharacter } = useKanjiRepository()
      const result = getByCharacter('日')

      expect(result).not.toBeNull()
      expect(result?.strokeCount).toBe(4)
    })
  })

  describe('search', () => {
    beforeEach(() => {
      seedKanji(testDb, {
        character: '日',
        strokeCount: 4,
        jlptLevel: 'N5',
        joyoLevel: 'elementary1'
      })
      seedKanji(testDb, {
        character: '月',
        strokeCount: 4,
        jlptLevel: 'N5',
        joyoLevel: 'elementary1'
      })
      seedKanji(testDb, {
        character: '愛',
        strokeCount: 13,
        jlptLevel: 'N3',
        joyoLevel: 'elementary4'
      })
    })

    it('returns all kanji when no filters provided', () => {
      const { search } = useKanjiRepository()
      const result = search()
      expect(result).toHaveLength(3)
    })

    it('filters by exact character', () => {
      const { search } = useKanjiRepository()
      const result = search({ character: '日' })
      expect(result).toHaveLength(1)
      expect(result[0]?.character).toBe('日')
    })

    it('filters by stroke count range', () => {
      const { search } = useKanjiRepository()
      const result = search({ strokeCountMin: 10, strokeCountMax: 20 })
      expect(result).toHaveLength(1)
      expect(result[0]?.character).toBe('愛')
    })

    it('filters by JLPT levels', () => {
      const { search } = useKanjiRepository()
      const result = search({ jlptLevels: ['N5'] })
      expect(result).toHaveLength(2)
    })

    it('filters by multiple JLPT levels', () => {
      const { search } = useKanjiRepository()
      const result = search({ jlptLevels: ['N5', 'N3'] })
      expect(result).toHaveLength(3)
    })

    it('filters by Joyo levels', () => {
      const { search } = useKanjiRepository()
      const result = search({ joyoLevels: ['elementary4'] })
      expect(result).toHaveLength(1)
      expect(result[0]?.character).toBe('愛')
    })
  })
})
