/**
 * Kanji Repository Tests
 *
 * Unit tests for the kanji repository.
 */

import { createTestDatabase } from '@test/helpers/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// Test database instance
let testDb: Database

// Mock useDatabase
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Mock schedulePersist
vi.mock('@/db/indexeddb', () => ({
  schedulePersist: vi.fn()
}))

// Import after mocking
import { useKanjiRepository } from './kanji-repository'

describe('useKanjiRepository', function () {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getById', () => {
    it('returns null when kanji does not exist', () => {
      const repo = useKanjiRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns kanji when it exists', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
        '水',
        4
      ])

      const repo = useKanjiRepository()
      const kanji = repo.getById(1)

      expect(kanji).not.toBeNull()
      expect(kanji?.character).toBe('水')
      expect(kanji?.strokeCount).toBe(4)
    })
  })

  describe('getByCharacter', () => {
    it('returns null when character not found', () => {
      const repo = useKanjiRepository()
      expect(repo.getByCharacter('火')).toBeNull()
    })

    it('returns kanji when character exists', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
        '火',
        4
      ])

      const repo = useKanjiRepository()
      const kanji = repo.getByCharacter('火')

      expect(kanji?.character).toBe('火')
    })
  })

  describe('getAll', () => {
    it('returns empty array when no kanji exist', () => {
      const repo = useKanjiRepository()
      expect(repo.getAll()).toEqual([])
    })

    it('returns all kanji ordered by id desc', () => {
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['木'])

      const repo = useKanjiRepository()
      const all = repo.getAll()

      expect(all).toHaveLength(3)
      expect(all[0]?.character).toBe('木')
      expect(all[1]?.character).toBe('火')
      expect(all[2]?.character).toBe('水')
    })
  })

  describe('create', () => {
    it('creates a kanji with required fields', () => {
      const repo = useKanjiRepository()
      const kanji = repo.create({ character: '山' })

      expect(kanji.id).toBe(1)
      expect(kanji.character).toBe('山')
      expect(kanji.strokeCount).toBeNull()
    })

    it('creates a kanji with optional fields', () => {
      const repo = useKanjiRepository()
      const kanji = repo.create({
        character: '川',
        strokeCount: 3,
        shortMeaning: 'river',
        jlptLevel: 'N5'
      })

      expect(kanji.character).toBe('川')
      expect(kanji.strokeCount).toBe(3)
      expect(kanji.shortMeaning).toBe('river')
      expect(kanji.jlptLevel).toBe('N5')
    })
  })

  describe('update', () => {
    it('throws EntityNotFoundError when kanji does not exist', () => {
      const repo = useKanjiRepository()
      const throwFn = () => repo.update(999, { strokeCount: 5 })

      expect(throwFn).toThrow('Kanji with id 999 not found')
    })

    it('updates kanji fields', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
        '水',
        4
      ])

      const repo = useKanjiRepository()
      const updated = repo.update(1, {
        strokeCount: 5,
        shortMeaning: 'water'
      })

      expect(updated.strokeCount).toBe(5)
      expect(updated.shortMeaning).toBe('water')
    })

    it('returns unchanged kanji when no fields provided', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
        '水',
        4
      ])

      const repo = useKanjiRepository()
      const updated = repo.update(1, {})

      expect(updated.strokeCount).toBe(4)
    })
  })

  describe('updateField', () => {
    it('updates a single field', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
        '水',
        4
      ])

      const repo = useKanjiRepository()
      const updated = repo.updateField(1, 'shortMeaning', 'water')

      expect(updated.shortMeaning).toBe('water')
      expect(updated.strokeCount).toBe(4)
    })
  })

  describe('remove', () => {
    it('removes a kanji', () => {
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])

      const repo = useKanjiRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('search', () => {
    beforeEach(() => {
      testDb.run(
        'INSERT INTO kanjis (character, jlpt_level, stroke_count) VALUES (?, ?, ?)',
        ['水', 'N5', 4]
      )
      testDb.run(
        'INSERT INTO kanjis (character, jlpt_level, stroke_count) VALUES (?, ?, ?)',
        ['火', 'N5', 4]
      )
      testDb.run(
        'INSERT INTO kanjis (character, jlpt_level, stroke_count) VALUES (?, ?, ?)',
        ['難', 'N1', 18]
      )
    })

    it('filters by JLPT levels', () => {
      const repo = useKanjiRepository()
      const results = repo.search({ jlptLevels: ['N5'] })

      expect(results).toHaveLength(2)
      expect(results.every((k) => k.jlptLevel === 'N5')).toBe(true)
    })

    it('filters by stroke count range', () => {
      const repo = useKanjiRepository()
      const results = repo.search({ strokeCountMin: 4, strokeCountMax: 4 })

      expect(results).toHaveLength(2)
    })

    it('filters by search text matching character', () => {
      const repo = useKanjiRepository()
      const results = repo.search({ search: '水' })

      expect(results).toHaveLength(1)
      expect(results[0]?.character).toBe('水')
    })

    it('filters by meanings text', () => {
      // Insert a meaning for 水
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
        [1, 'water', 'H2O', 0]
      )
      // Insert a meaning for 火
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
        [2, 'fire', 'flame', 0]
      )

      const repo = useKanjiRepository()
      const results = repo.search({ meanings: 'wat' })

      expect(results).toHaveLength(1)
      expect(results[0]?.character).toBe('水')
    })
  })

  describe('getByIds', () => {
    it('returns empty array for empty ids', () => {
      const repo = useKanjiRepository()
      expect(repo.getByIds([])).toEqual([])
    })

    it('returns kanji matching ids', () => {
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['木'])

      const repo = useKanjiRepository()
      const results = repo.getByIds([1, 3])

      expect(results).toHaveLength(2)
      expect(results[0]?.character).toBe('水')
      expect(results[1]?.character).toBe('木')
    })
  })
})
