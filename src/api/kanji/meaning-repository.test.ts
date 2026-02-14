/**
 * Kanji Meaning Repository Tests
 *
 * Unit tests for kanji meaning repository.
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
import { useKanjiMeaningRepository } from './meaning-repository'

describe('useMeaningRepository', function () {
  let kanjiId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
      '水',
      4
    ])
    kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByParentId', () => {
    it('returns empty array when no meanings exist', () => {
      const repo = useKanjiMeaningRepository()
      expect(repo.getByParentId(kanjiId)).toEqual([])
    })

    it('returns meanings ordered by display_order', () => {
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'water', 0]
      )
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'aqua', 1]
      )

      const repo = useKanjiMeaningRepository()
      const meanings = repo.getByParentId(kanjiId)

      expect(meanings).toHaveLength(2)
      expect(meanings[0]?.meaningText).toBe('water')
      expect(meanings[1]?.meaningText).toBe('aqua')
    })
  })

  describe('getById', () => {
    it('returns null when meaning does not exist', () => {
      const repo = useKanjiMeaningRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns meaning when it exists', () => {
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'water', 'H2O', 0]
      )

      const repo = useKanjiMeaningRepository()
      const meaning = repo.getById(1)

      expect(meaning?.meaningText).toBe('water')
      expect(meaning?.additionalInfo).toBe('H2O')
    })
  })

  describe('create', () => {
    it('creates a meaning with required fields', () => {
      const repo = useKanjiMeaningRepository()
      const meaning = repo.create({
        kanjiId,
        meaningText: 'water'
      })

      expect(meaning.meaningText).toBe('water')
      expect(meaning.additionalInfo).toBeNull()
      expect(meaning.displayOrder).toBe(0)
    })

    it('creates a meaning with additional info', () => {
      const repo = useKanjiMeaningRepository()
      const meaning = repo.create({
        kanjiId,
        meaningText: 'water',
        additionalInfo: 'H2O, aqua'
      })

      expect(meaning.additionalInfo).toBe('H2O, aqua')
    })

    it('auto-increments display_order', () => {
      const repo = useKanjiMeaningRepository()

      repo.create({ kanjiId, meaningText: 'water' })
      const second = repo.create({ kanjiId, meaningText: 'aqua' })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when meaning does not exist', () => {
      const repo = useKanjiMeaningRepository()
      const throwFn = () => repo.update(999, { meaningText: 'test' })

      expect(throwFn).toThrow('KanjiMeaning with id 999 not found')
    })

    it('updates meaning fields', () => {
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'water', 0]
      )

      const repo = useKanjiMeaningRepository()
      const updated = repo.update(1, {
        meaningText: 'water, liquid',
        additionalInfo: 'H2O'
      })

      expect(updated.meaningText).toBe('water, liquid')
      expect(updated.additionalInfo).toBe('H2O')
    })

    it('can set additional info to null', () => {
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'water', 'info', 0]
      )

      const repo = useKanjiMeaningRepository()
      const updated = repo.update(1, { additionalInfo: null })

      expect(updated.additionalInfo).toBeNull()
    })
  })

  describe('remove', () => {
    it('removes a meaning', () => {
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'water', 0]
      )

      const repo = useKanjiMeaningRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('reorder', () => {
    it('reorders meanings by new id sequence', () => {
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'water', 0]
      )
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'aqua', 1]
      )

      const repo = useKanjiMeaningRepository()
      repo.reorder([2, 1])

      const meanings = repo.getByParentId(kanjiId)
      expect(meanings[0]?.meaningText).toBe('aqua')
      expect(meanings[1]?.meaningText).toBe('water')
    })
  })
})
