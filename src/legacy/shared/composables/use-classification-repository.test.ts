/**
 * Tests for useClassificationRepository composable
 */

import {
  createTestDatabase,
  seedClassification,
  seedKanji
} from '@test/helpers/database'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Database } from 'sql.js'

// We need to mock the useDatabase composable
// since useClassificationRepository depends on it
let testDb: Database

// Mock useDatabase
vi.mock('@/legacy/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { useClassificationRepository } from './use-classification-repository'

describe('useClassificationRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getAllClassificationTypes', () => {
    it('returns all classification types ordered by display_order', () => {
      const { getAllClassificationTypes } = useClassificationRepository()
      const result = getAllClassificationTypes()

      expect(result).toHaveLength(5)
      expect(result[0]?.typeName).toBe('pictograph')
      expect(result[1]?.typeName).toBe('ideograph')
      expect(result[2]?.typeName).toBe('compound_ideograph')
      expect(result[3]?.typeName).toBe('phono_semantic')
      expect(result[4]?.typeName).toBe('phonetic_loan')
    })

    it('maps database columns to camelCase properties', () => {
      const { getAllClassificationTypes } = useClassificationRepository()
      const result = getAllClassificationTypes()

      expect(result[0]).toMatchObject({
        id: 1,
        typeName: 'pictograph',
        nameJapanese: '象形文字',
        nameEnglish: 'Pictograph',
        displayOrder: 1
      })
      expect(result[0]).toHaveProperty('createdAt')
      expect(result[0]).toHaveProperty('updatedAt')
    })

    it('includes the new phonetic_loan type (仮借字)', () => {
      const { getAllClassificationTypes } = useClassificationRepository()
      const result = getAllClassificationTypes()

      const phoneticLoan = result.find((t) => t.typeName === 'phonetic_loan')
      expect(phoneticLoan).toBeDefined()
      expect(phoneticLoan?.nameJapanese).toBe('仮借字')
      expect(phoneticLoan?.nameEnglish).toBe('Phonetic Loan')
    })
  })

  describe('getClassificationTypeById', () => {
    it('returns a classification type by id', () => {
      const { getClassificationTypeById } = useClassificationRepository()
      const result = getClassificationTypeById(1)

      expect(result).toMatchObject({
        id: 1,
        typeName: 'pictograph',
        nameJapanese: '象形文字'
      })
    })

    it('returns null if classification type not found', () => {
      const { getClassificationTypeById } = useClassificationRepository()
      const result = getClassificationTypeById(999)

      expect(result).toBeNull()
    })
  })

  describe('getClassificationsByKanjiId', () => {
    it('returns empty array when kanji has no classifications', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const { getClassificationsByKanjiId } = useClassificationRepository()
      const result = getClassificationsByKanjiId(kanji.id)

      expect(result).toEqual([])
    })

    it('returns classifications for a kanji ordered by display_order', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      seedClassification(testDb, kanji.id, {
        classificationTypeId: 4,
        displayOrder: 0
      })
      seedClassification(testDb, kanji.id, {
        classificationTypeId: 3,
        displayOrder: 1
      })

      const { getClassificationsByKanjiId } = useClassificationRepository()
      const result = getClassificationsByKanjiId(kanji.id)

      expect(result).toHaveLength(2)
      // First is phono_semantic (id 4)
      expect(result[0]?.classificationTypeId).toBe(4)
      expect(result[0]?.displayOrder).toBe(0)
      // Second is compound_ideograph (id 3)
      expect(result[1]?.classificationTypeId).toBe(3)
      expect(result[1]?.displayOrder).toBe(1)
    })

    it('includes joined type data', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })

      const { getClassificationsByKanjiId } = useClassificationRepository()
      const result = getClassificationsByKanjiId(kanji.id)

      expect(result[0]).toMatchObject({
        typeName: 'pictograph',
        nameJapanese: '象形文字',
        nameEnglish: 'Pictograph'
      })
    })
  })

  describe('getPrimaryClassification', () => {
    it('returns the primary classification (display_order = 0)', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })
      seedClassification(testDb, kanji.id, {
        classificationTypeId: 2,
        displayOrder: 1
      })

      const { getPrimaryClassification } = useClassificationRepository()
      const result = getPrimaryClassification(kanji.id)

      expect(result).toBeDefined()
      expect(result?.classificationTypeId).toBe(1)
      expect(result?.displayOrder).toBe(0)
    })

    it('returns null if kanji has no classifications', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const { getPrimaryClassification } = useClassificationRepository()
      const result = getPrimaryClassification(kanji.id)

      expect(result).toBeNull()
    })
  })

  describe('getPrimaryClassificationsForKanji', () => {
    it('returns empty map for empty input', () => {
      const { getPrimaryClassificationsForKanji } =
        useClassificationRepository()
      const result = getPrimaryClassificationsForKanji([])

      expect(result.size).toBe(0)
    })

    it('returns map with null for kanji without classifications', () => {
      const kanji1 = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const kanji2 = seedKanji(testDb, { character: '月', strokeCount: 4 })

      const { getPrimaryClassificationsForKanji } =
        useClassificationRepository()
      const result = getPrimaryClassificationsForKanji([kanji1.id, kanji2.id])

      expect(result.size).toBe(2)
      expect(result.get(kanji1.id)).toBeNull()
      expect(result.get(kanji2.id)).toBeNull()
    })

    it('returns primary classifications for multiple kanji', () => {
      const kanji1 = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const kanji2 = seedKanji(testDb, { character: '月', strokeCount: 4 })
      const kanji3 = seedKanji(testDb, { character: '水', strokeCount: 4 })

      seedClassification(testDb, kanji1.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })
      seedClassification(testDb, kanji2.id, {
        classificationTypeId: 2,
        displayOrder: 0
      })
      // kanji3 has no classification

      const { getPrimaryClassificationsForKanji } =
        useClassificationRepository()
      const result = getPrimaryClassificationsForKanji([
        kanji1.id,
        kanji2.id,
        kanji3.id
      ])

      expect(result.size).toBe(3)
      expect(result.get(kanji1.id)?.classificationTypeId).toBe(1)
      expect(result.get(kanji2.id)?.classificationTypeId).toBe(2)
      expect(result.get(kanji3.id)).toBeNull()
    })

    it('only returns primary classifications (display_order = 0)', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })
      seedClassification(testDb, kanji.id, {
        classificationTypeId: 2,
        displayOrder: 1
      })

      const { getPrimaryClassificationsForKanji } =
        useClassificationRepository()
      const result = getPrimaryClassificationsForKanji([kanji.id])

      expect(result.get(kanji.id)?.classificationTypeId).toBe(1)
      expect(result.get(kanji.id)?.displayOrder).toBe(0)
    })
  })

  describe('createClassification', () => {
    it('creates a new classification', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const { createClassification } = useClassificationRepository()

      const result = createClassification({
        kanjiId: kanji.id,
        classificationTypeId: 1,
        displayOrder: 0
      })

      expect(result).toMatchObject({
        kanjiId: kanji.id,
        classificationTypeId: 1,
        displayOrder: 0
      })
      expect(result.id).toBeDefined()
    })

    it('auto-assigns display_order if not provided', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const { createClassification } = useClassificationRepository()

      const result1 = createClassification({
        kanjiId: kanji.id,
        classificationTypeId: 1
      })
      const result2 = createClassification({
        kanjiId: kanji.id,
        classificationTypeId: 2
      })

      expect(result1.displayOrder).toBe(0)
      expect(result2.displayOrder).toBe(1)
    })
  })

  describe('updateClassification', () => {
    it('updates classification type', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const classificationId = seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })

      const { updateClassification } = useClassificationRepository()
      const result = updateClassification(classificationId, {
        classificationTypeId: 2
      })

      expect(result.classificationTypeId).toBe(2)
      expect(result.displayOrder).toBe(0) // Unchanged
    })

    it('updates display_order', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const classificationId = seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })

      const { updateClassification } = useClassificationRepository()
      const result = updateClassification(classificationId, {
        displayOrder: 2
      })

      expect(result.displayOrder).toBe(2)
      expect(result.classificationTypeId).toBe(1) // Unchanged
    })

    it('returns existing classification if no fields changed', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const classificationId = seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })

      const { updateClassification } = useClassificationRepository()
      const result = updateClassification(classificationId, {})

      expect(result.id).toBe(classificationId)
    })
  })

  describe('removeClassification', () => {
    it('deletes a classification', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const classificationId = seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })

      const { getClassificationById, removeClassification } =
        useClassificationRepository()

      // Verify it exists before deletion
      expect(getClassificationById(classificationId)).toBeDefined()

      // Delete it
      removeClassification(classificationId)

      // Verify it's gone
      expect(getClassificationById(classificationId)).toBeNull()
    })
  })

  describe('reorderClassifications', () => {
    it('reorders classifications for a kanji', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const id1 = seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })
      const id2 = seedClassification(testDb, kanji.id, {
        classificationTypeId: 2,
        displayOrder: 1
      })
      const id3 = seedClassification(testDb, kanji.id, {
        classificationTypeId: 3,
        displayOrder: 2
      })

      const { getClassificationsByKanjiId, reorderClassifications } =
        useClassificationRepository()

      // Reverse the order
      reorderClassifications(kanji.id, [id3, id2, id1])

      const result = getClassificationsByKanjiId(kanji.id)
      expect(result[0]?.id).toBe(id3)
      expect(result[0]?.displayOrder).toBe(0)
      expect(result[1]?.id).toBe(id2)
      expect(result[1]?.displayOrder).toBe(1)
      expect(result[2]?.id).toBe(id1)
      expect(result[2]?.displayOrder).toBe(2)
    })

    it('updates primary classification when reordering', () => {
      const kanji = seedKanji(testDb, { character: '日', strokeCount: 4 })
      const id1 = seedClassification(testDb, kanji.id, {
        classificationTypeId: 1,
        displayOrder: 0
      })
      const id2 = seedClassification(testDb, kanji.id, {
        classificationTypeId: 2,
        displayOrder: 1
      })

      const { getPrimaryClassification, reorderClassifications } =
        useClassificationRepository()

      // Make id2 primary by putting it first
      reorderClassifications(kanji.id, [id2, id1])

      const primary = getPrimaryClassification(kanji.id)
      expect(primary?.id).toBe(id2)
      expect(primary?.displayOrder).toBe(0)
    })
  })
})
