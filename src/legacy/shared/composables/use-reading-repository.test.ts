/**
 * Tests for useReadingRepository composable
 */

import { createTestDatabase } from '@test/helpers/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// We need to mock the useDatabase composable
let testDb: Database

// Mock useDatabase
vi.mock('@/legacy/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { useReadingRepository } from './use-reading-repository'

describe('useReadingRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('on-yomi methods', () => {
    describe('getOnReadingsByKanjiId', () => {
      it('returns empty array when no readings exist', () => {
        const { getOnReadingsByKanjiId } = useReadingRepository()
        const result = getOnReadingsByKanjiId(999)
        expect(result).toEqual([])
      })

      it('returns on-yomi readings ordered by display_order', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        // Insert readings
        testDb.run(
          'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
          [kanjiId, 'メイ', '小', 0]
        )
        testDb.run(
          'INSERT INTO on_readings (kanji_id, reading, reading_level, display_order) VALUES (?, ?, ?, ?)',
          [kanjiId, 'ミョウ', '中', 1]
        )

        const { getOnReadingsByKanjiId } = useReadingRepository()
        const result = getOnReadingsByKanjiId(kanjiId)

        expect(result).toHaveLength(2)
        expect(result[0]?.reading).toBe('メイ')
        expect(result[1]?.reading).toBe('ミョウ')
      })
    })

    describe('createOnReading', () => {
      it('creates a new on-yomi reading', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createOnReading, getOnReadingsByKanjiId } =
          useReadingRepository()
        const reading = createOnReading({
          kanjiId,
          reading: 'メイ',
          readingLevel: '小'
        })

        expect(reading.reading).toBe('メイ')
        expect(reading.readingLevel).toBe('小')
        expect(reading.kanjiId).toBe(kanjiId)

        const all = getOnReadingsByKanjiId(kanjiId)
        expect(all).toHaveLength(1)
      })

      it('auto-increments display_order', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createOnReading } = useReadingRepository()
        const first = createOnReading({
          kanjiId,
          reading: 'メイ',
          readingLevel: '小'
        })
        const second = createOnReading({
          kanjiId,
          reading: 'ミョウ',
          readingLevel: '中'
        })

        expect(first.displayOrder).toBe(0)
        expect(second.displayOrder).toBe(1)
      })
    })

    describe('updateOnReading', () => {
      it('updates on-yomi reading fields', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createOnReading, getOnReadingById, updateOnReading } =
          useReadingRepository()
        const reading = createOnReading({
          kanjiId,
          reading: 'メイ',
          readingLevel: '小'
        })

        updateOnReading(reading.id, {
          reading: 'ミョウ',
          readingLevel: '中'
        })

        const updated = getOnReadingById(reading.id)
        expect(updated?.reading).toBe('ミョウ')
        expect(updated?.readingLevel).toBe('中')
      })
    })

    describe('removeOnReading', () => {
      it('deletes an on-yomi reading', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createOnReading, getOnReadingById, removeOnReading } =
          useReadingRepository()
        const reading = createOnReading({
          kanjiId,
          reading: 'メイ',
          readingLevel: '小'
        })

        removeOnReading(reading.id)

        const deleted = getOnReadingById(reading.id)
        expect(deleted).toBeNull()
      })
    })

    describe('reorderOnReadings', () => {
      it('reorders on-yomi readings', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createOnReading, getOnReadingsByKanjiId, reorderOnReadings } =
          useReadingRepository()
        const first = createOnReading({
          kanjiId,
          reading: 'メイ',
          readingLevel: '小'
        })
        const second = createOnReading({
          kanjiId,
          reading: 'ミョウ',
          readingLevel: '中'
        })

        // Reverse order
        reorderOnReadings(kanjiId, [second.id, first.id])

        const readings = getOnReadingsByKanjiId(kanjiId)
        expect(readings[0]?.reading).toBe('ミョウ')
        expect(readings[1]?.reading).toBe('メイ')
      })
    })
  })

  describe('kun-yomi methods', () => {
    describe('getKunReadingsByKanjiId', () => {
      it('returns empty array when no readings exist', () => {
        const { getKunReadingsByKanjiId } = useReadingRepository()
        const result = getKunReadingsByKanjiId(999)
        expect(result).toEqual([])
      })

      it('returns kun-yomi readings ordered by display_order', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        // Insert readings
        testDb.run(
          'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
          [kanjiId, 'あか', 'るい', '小', 0]
        )
        testDb.run(
          'INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order) VALUES (?, ?, ?, ?, ?)',
          [kanjiId, 'あか', 'り', '小', 1]
        )

        const { getKunReadingsByKanjiId } = useReadingRepository()
        const result = getKunReadingsByKanjiId(kanjiId)

        expect(result).toHaveLength(2)
        expect(result[0]?.reading).toBe('あか')
        expect(result[0]?.okurigana).toBe('るい')
        expect(result[1]?.okurigana).toBe('り')
      })
    })

    describe('createKunReading', () => {
      it('creates a new kun-yomi reading', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createKunReading, getKunReadingsByKanjiId } =
          useReadingRepository()
        const reading = createKunReading({
          kanjiId,
          reading: 'あか',
          okurigana: 'るい',
          readingLevel: '小'
        })

        expect(reading.reading).toBe('あか')
        expect(reading.okurigana).toBe('るい')
        expect(reading.readingLevel).toBe('小')

        const all = getKunReadingsByKanjiId(kanjiId)
        expect(all).toHaveLength(1)
      })

      it('handles null okurigana', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['日', 4]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createKunReading } = useReadingRepository()
        const reading = createKunReading({
          kanjiId,
          reading: 'ひ',
          okurigana: null,
          readingLevel: '小'
        })

        expect(reading.okurigana).toBeNull()
      })
    })

    describe('updateKunReading', () => {
      it('updates kun-yomi reading fields', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createKunReading, getKunReadingById, updateKunReading } =
          useReadingRepository()
        const reading = createKunReading({
          kanjiId,
          reading: 'あか',
          okurigana: 'るい',
          readingLevel: '小'
        })

        updateKunReading(reading.id, {
          reading: 'あか',
          okurigana: 'り',
          readingLevel: '中'
        })

        const updated = getKunReadingById(reading.id)
        expect(updated?.okurigana).toBe('り')
        expect(updated?.readingLevel).toBe('中')
      })
    })

    describe('removeKunReading', () => {
      it('deletes a kun-yomi reading', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createKunReading, getKunReadingById, removeKunReading } =
          useReadingRepository()
        const reading = createKunReading({
          kanjiId,
          reading: 'あか',
          okurigana: 'るい',
          readingLevel: '小'
        })

        removeKunReading(reading.id)

        const deleted = getKunReadingById(reading.id)
        expect(deleted).toBeNull()
      })
    })

    describe('reorderKunReadings', () => {
      it('reorders kun-yomi readings', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const {
          createKunReading,
          getKunReadingsByKanjiId,
          reorderKunReadings
        } = useReadingRepository()
        const first = createKunReading({
          kanjiId,
          reading: 'あか',
          okurigana: 'るい',
          readingLevel: '小'
        })
        const second = createKunReading({
          kanjiId,
          reading: 'あか',
          okurigana: 'り',
          readingLevel: '小'
        })

        // Reverse order
        reorderKunReadings(kanjiId, [second.id, first.id])

        const readings = getKunReadingsByKanjiId(kanjiId)
        expect(readings[0]?.okurigana).toBe('り')
        expect(readings[1]?.okurigana).toBe('るい')
      })
    })
  })
})
