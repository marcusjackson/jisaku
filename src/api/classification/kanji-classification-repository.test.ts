/**
 * Kanji Classification Repository Tests
 *
 * Unit tests for kanji-to-classification junction table repository.
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
import { useKanjiClassificationRepository } from './kanji-classification-repository'

describe('useKanjiClassificationRepository', function () {
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
    it('returns empty array when no classifications assigned', () => {
      const repo = useKanjiClassificationRepository()
      expect(repo.getByParentId(kanjiId)).toEqual([])
    })

    it('returns classifications ordered by display_order', () => {
      // Classification type 1 = pictograph, 2 = ideograph
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 2, 1]
      )

      const repo = useKanjiClassificationRepository()
      const classifications = repo.getByParentId(kanjiId)

      expect(classifications).toHaveLength(2)
      expect(classifications[0]?.classificationTypeId).toBe(1)
      expect(classifications[1]?.classificationTypeId).toBe(2)
    })
  })

  describe('getByKanjiIdWithType', () => {
    it('returns classifications with joined type data', () => {
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 1, 0]
      )

      const repo = useKanjiClassificationRepository()
      const classifications = repo.getByKanjiIdWithType(kanjiId)

      expect(classifications).toHaveLength(1)
      expect(classifications[0]?.classificationType?.typeName).toBe(
        'pictograph'
      )
      expect(classifications[0]?.classificationType?.nameJapanese).toBe(
        '象形文字'
      )
    })
  })

  describe('getById', () => {
    it('returns null when classification does not exist', () => {
      const repo = useKanjiClassificationRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns classification when it exists', () => {
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 1, 0]
      )

      const repo = useKanjiClassificationRepository()
      const classification = repo.getById(1)

      expect(classification?.kanjiId).toBe(kanjiId)
      expect(classification?.classificationTypeId).toBe(1)
    })
  })

  describe('create', () => {
    it('creates a classification assignment', () => {
      const repo = useKanjiClassificationRepository()
      const classification = repo.create({
        kanjiId,
        classificationTypeId: 4 // phono_semantic
      })

      expect(classification.kanjiId).toBe(kanjiId)
      expect(classification.classificationTypeId).toBe(4)
      expect(classification.displayOrder).toBe(0)
    })

    it('auto-increments display_order', () => {
      const repo = useKanjiClassificationRepository()

      repo.create({ kanjiId, classificationTypeId: 1 })
      const second = repo.create({ kanjiId, classificationTypeId: 4 })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws because update is not supported', () => {
      const repo = useKanjiClassificationRepository()
      const throwFn = () => repo.update()

      expect(throwFn).toThrow('KanjiClassification update not supported')
    })
  })

  describe('remove', () => {
    it('removes a classification assignment', () => {
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 1, 0]
      )

      const repo = useKanjiClassificationRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('removeByKanjiId', () => {
    it('removes all classifications for a kanji', () => {
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 4, 1]
      )

      const repo = useKanjiClassificationRepository()
      repo.removeByKanjiId(kanjiId)

      expect(repo.getByParentId(kanjiId)).toEqual([])
    })
  })

  describe('reorder', () => {
    it('reorders classifications by new id sequence', () => {
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, 4, 1]
      )

      const repo = useKanjiClassificationRepository()
      repo.reorder([2, 1])

      const classifications = repo.getByParentId(kanjiId)
      expect(classifications[0]?.classificationTypeId).toBe(4)
      expect(classifications[1]?.classificationTypeId).toBe(1)
    })
  })
})
