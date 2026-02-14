/**
 * Kun-Reading Repository Tests
 *
 * Unit tests for kun-yomi reading repository.
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
import { useKunReadingRepository } from './kun-reading-repository'

describe('useKunReadingRepository', function () {
  let kanjiId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
      '明',
      8
    ])
    kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByParentId', () => {
    it('returns empty array when no readings exist', () => {
      const repo = useKunReadingRepository()
      expect(repo.getByParentId(kanjiId)).toEqual([])
    })

    it('returns readings ordered by display_order', () => {
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あ', 'かり', '小', 0]
      )
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あき', 'らか', '中', 1]
      )

      const repo = useKunReadingRepository()
      const readings = repo.getByParentId(kanjiId)

      expect(readings).toHaveLength(2)
      expect(readings[0]?.reading).toBe('あ')
      expect(readings[0]?.okurigana).toBe('かり')
      expect(readings[1]?.reading).toBe('あき')
    })
  })

  describe('getById', () => {
    it('returns null when reading does not exist', () => {
      const repo = useKunReadingRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns reading when it exists', () => {
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あ', 'かり', '小', 0]
      )

      const repo = useKunReadingRepository()
      const reading = repo.getById(1)

      expect(reading?.reading).toBe('あ')
      expect(reading?.okurigana).toBe('かり')
    })
  })

  describe('create', () => {
    it('creates a reading with default values', () => {
      const repo = useKunReadingRepository()
      const reading = repo.create({
        kanjiId,
        reading: 'あ'
      })

      expect(reading.reading).toBe('あ')
      expect(reading.okurigana).toBeNull()
      expect(reading.readingLevel).toBe('小')
      expect(reading.displayOrder).toBe(0)
    })

    it('creates a reading with okurigana', () => {
      const repo = useKunReadingRepository()
      const reading = repo.create({
        kanjiId,
        reading: 'あ',
        okurigana: 'かり',
        readingLevel: '小'
      })

      expect(reading.reading).toBe('あ')
      expect(reading.okurigana).toBe('かり')
    })

    it('auto-increments display_order', () => {
      const repo = useKunReadingRepository()

      repo.create({ kanjiId, reading: 'あ' })
      const second = repo.create({ kanjiId, reading: 'あき' })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when reading does not exist', () => {
      const repo = useKunReadingRepository()
      const throwFn = () => repo.update(999, { reading: 'テスト' })

      expect(throwFn).toThrow('KunReading with id 999 not found')
    })

    it('updates reading and okurigana', () => {
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あ', 'かり', '小', 0]
      )

      const repo = useKunReadingRepository()
      const updated = repo.update(1, {
        reading: 'あき',
        okurigana: 'らか'
      })

      expect(updated.reading).toBe('あき')
      expect(updated.okurigana).toBe('らか')
    })

    it('can set okurigana to null', () => {
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あ', 'かり', '小', 0]
      )

      const repo = useKunReadingRepository()
      const updated = repo.update(1, { okurigana: null })

      expect(updated.okurigana).toBeNull()
    })
  })

  describe('remove', () => {
    it('removes a reading', () => {
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あ', 'かり', '小', 0]
      )

      const repo = useKunReadingRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('reorder', () => {
    it('reorders readings by new id sequence', () => {
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あ', 'かり', '小', 0]
      )
      testDb.run(
        'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, 'あき', 'らか', '中', 1]
      )

      const repo = useKunReadingRepository()
      repo.reorder([2, 1])

      const readings = repo.getByParentId(kanjiId)
      expect(readings[0]?.reading).toBe('あき')
      expect(readings[1]?.reading).toBe('あ')
    })
  })
})
