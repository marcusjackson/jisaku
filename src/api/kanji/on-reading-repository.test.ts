/**
 * On-Reading Repository Tests
 *
 * Unit tests for on-yomi reading repository.
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
import { useOnReadingRepository } from './on-reading-repository'

describe('useOnReadingRepository', function () {
  let kanjiId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()
    // Create a test kanji for readings
    testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
      '明',
      8
    ])
    kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByParentId', () => {
    it('returns empty array when no readings exist', () => {
      const repo = useOnReadingRepository()
      expect(repo.getByParentId(kanjiId)).toEqual([])
    })

    it('returns readings ordered by display_order', () => {
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'メイ', '小', 0]
      )
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'ミョウ', '中', 1]
      )

      const repo = useOnReadingRepository()
      const readings = repo.getByParentId(kanjiId)

      expect(readings).toHaveLength(2)
      expect(readings[0]?.reading).toBe('メイ')
      expect(readings[1]?.reading).toBe('ミョウ')
    })
  })

  describe('getById', () => {
    it('returns null when reading does not exist', () => {
      const repo = useOnReadingRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns reading when it exists', () => {
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'メイ', '小', 0]
      )

      const repo = useOnReadingRepository()
      const reading = repo.getById(1)

      expect(reading?.reading).toBe('メイ')
      expect(reading?.readingLevel).toBe('小')
    })
  })

  describe('create', () => {
    it('creates a reading with default values', () => {
      const repo = useOnReadingRepository()
      const reading = repo.create({
        kanjiId,
        reading: 'メイ'
      })

      expect(reading.reading).toBe('メイ')
      expect(reading.readingLevel).toBe('小')
      expect(reading.displayOrder).toBe(0)
      expect(reading.kanjiId).toBe(kanjiId)
    })

    it('creates a reading with custom reading level', () => {
      const repo = useOnReadingRepository()
      const reading = repo.create({
        kanjiId,
        reading: 'ミョウ',
        readingLevel: '中'
      })

      expect(reading.readingLevel).toBe('中')
    })

    it('auto-increments display_order', () => {
      const repo = useOnReadingRepository()

      repo.create({ kanjiId, reading: 'メイ' })
      const second = repo.create({ kanjiId, reading: 'ミョウ' })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when reading does not exist', () => {
      const repo = useOnReadingRepository()
      const throwFn = () => repo.update(999, { reading: 'テスト' })

      expect(throwFn).toThrow('OnReading with id 999 not found')
    })

    it('updates reading fields', () => {
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'メイ', '小', 0]
      )

      const repo = useOnReadingRepository()
      const updated = repo.update(1, {
        reading: 'メー',
        readingLevel: '中'
      })

      expect(updated.reading).toBe('メー')
      expect(updated.readingLevel).toBe('中')
    })

    it('returns unchanged reading when no fields provided', () => {
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'メイ', '小', 0]
      )

      const repo = useOnReadingRepository()
      const updated = repo.update(1, {})

      expect(updated.reading).toBe('メイ')
    })
  })

  describe('remove', () => {
    it('removes a reading', () => {
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'メイ', '小', 0]
      )

      const repo = useOnReadingRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('reorder', () => {
    it('reorders readings by new id sequence', () => {
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'メイ', '小', 0]
      )
      testDb.run(
        'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'ミョウ', '中', 1]
      )

      const repo = useOnReadingRepository()
      repo.reorder([2, 1]) // Swap order

      const readings = repo.getByParentId(kanjiId)
      expect(readings[0]?.reading).toBe('ミョウ')
      expect(readings[1]?.reading).toBe('メイ')
    })
  })
})
