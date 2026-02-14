/**
 * Kanji Meaning Reading Group Repository Tests
 *
 * Unit tests for reading group repository.
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
import { useReadingGroupRepository } from './reading-group-repository'

describe('useReadingGroupRepository', function () {
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
    it('returns empty array when no reading groups exist', () => {
      const repo = useReadingGroupRepository()
      expect(repo.getByParentId(kanjiId)).toEqual([])
    })

    it('returns reading groups ordered by display_order', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'あか', 0]
      )
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'めい', 1]
      )

      const repo = useReadingGroupRepository()
      const groups = repo.getByParentId(kanjiId)

      expect(groups).toHaveLength(2)
      expect(groups[0]?.readingText).toBe('あか')
      expect(groups[1]?.readingText).toBe('めい')
    })
  })

  describe('getById', () => {
    it('returns null when reading group does not exist', () => {
      const repo = useReadingGroupRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns reading group when it exists', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'あか', 0]
      )

      const repo = useReadingGroupRepository()
      const group = repo.getById(1)

      expect(group).not.toBeNull()
      expect(group?.readingText).toBe('あか')
      expect(group?.kanjiId).toBe(kanjiId)
    })
  })

  describe('create', () => {
    it('creates a reading group with default values', () => {
      const repo = useReadingGroupRepository()
      const group = repo.create({
        kanjiId,
        readingText: 'あか'
      })

      expect(group.id).toBe(1)
      expect(group.readingText).toBe('あか')
      expect(group.displayOrder).toBe(0)
    })

    it('creates a reading group with custom display order', () => {
      const repo = useReadingGroupRepository()
      const group = repo.create({
        kanjiId,
        readingText: 'めい',
        displayOrder: 5
      })

      expect(group.displayOrder).toBe(5)
    })

    it('auto-increments display_order', () => {
      const repo = useReadingGroupRepository()
      repo.create({ kanjiId, readingText: 'あか' })
      const group2 = repo.create({ kanjiId, readingText: 'めい' })

      expect(group2.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when reading group does not exist', () => {
      const repo = useReadingGroupRepository()
      expect(() => repo.update(999, { readingText: 'updated' })).toThrow(
        'KanjiMeaningReadingGroup with id 999 not found'
      )
    })

    it('updates reading text', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'あか', 0]
      )

      const repo = useReadingGroupRepository()
      const updated = repo.update(1, { readingText: 'あかり' })

      expect(updated.readingText).toBe('あかり')
      expect(updated.kanjiId).toBe(kanjiId)
    })

    it('returns unchanged group when no fields provided', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'あか', 0]
      )

      const repo = useReadingGroupRepository()
      const updated = repo.update(1, {})

      expect(updated.readingText).toBe('あか')
    })
  })

  describe('remove', () => {
    it('removes a reading group', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'あか', 0]
      )

      const repo = useReadingGroupRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('reorder', () => {
    it('reorders reading groups by new id sequence', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'あか', 0]
      )
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'めい', 1]
      )

      const repo = useReadingGroupRepository()
      repo.reorder([2, 1]) // Swap order

      const groups = repo.getByParentId(kanjiId)
      expect(groups[0]?.readingText).toBe('めい')
      expect(groups[1]?.readingText).toBe('あか')
    })
  })
})
