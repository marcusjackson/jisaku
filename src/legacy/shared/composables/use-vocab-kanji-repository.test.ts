/**
 * Tests for useVocabKanjiRepository composable
 */

import {
  createTestDatabase,
  seedKanji,
  seedVocabKanji,
  seedVocabulary
} from '@test/helpers/database'
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
import { useVocabKanjiRepository } from './use-vocab-kanji-repository'

describe('useVocabKanjiRepository', () => {
  let vocabId: number
  let kanji1Id: number
  let kanji2Id: number
  let kanji3Id: number

  beforeEach(async () => {
    testDb = await createTestDatabase()

    // Create test vocabulary
    vocabId = seedVocabulary(testDb, {
      word: '水泳',
      kana: 'すいえい',
      shortMeaning: 'swimming'
    })

    // Create test kanji
    kanji1Id = seedKanji(testDb, {
      character: '水',
      strokeCount: 4,
      shortMeaning: 'water'
    }).id
    kanji2Id = seedKanji(testDb, {
      character: '泳',
      strokeCount: 8,
      shortMeaning: 'swim'
    }).id
    kanji3Id = seedKanji(testDb, {
      character: '日',
      strokeCount: 4,
      shortMeaning: 'sun'
    }).id
  })

  describe('getByVocabId', () => {
    it('returns empty array when no links exist', () => {
      const { getByVocabId } = useVocabKanjiRepository()
      const result = getByVocabId(vocabId)
      expect(result).toEqual([])
    })

    it('returns vocab-kanji links ordered by display_order', () => {
      seedVocabKanji(testDb, vocabId, kanji1Id, { displayOrder: 0 })
      seedVocabKanji(testDb, vocabId, kanji2Id, { displayOrder: 1 })

      const { getByVocabId } = useVocabKanjiRepository()
      const result = getByVocabId(vocabId)

      expect(result).toHaveLength(2)
      expect(result[0]?.kanjiId).toBe(kanji1Id)
      expect(result[0]?.displayOrder).toBe(0)
      expect(result[1]?.kanjiId).toBe(kanji2Id)
      expect(result[1]?.displayOrder).toBe(1)
    })
  })

  describe('getByVocabIdWithKanji', () => {
    it('returns empty array when no links exist', () => {
      const { getByVocabIdWithKanji } = useVocabKanjiRepository()
      const result = getByVocabIdWithKanji(vocabId)
      expect(result).toEqual([])
    })

    it('returns vocab-kanji links with full kanji data', () => {
      seedVocabKanji(testDb, vocabId, kanji1Id, {
        displayOrder: 0,
        analysisNotes: 'Water component'
      })
      seedVocabKanji(testDb, vocabId, kanji2Id, { displayOrder: 1 })

      const { getByVocabIdWithKanji } = useVocabKanjiRepository()
      const result = getByVocabIdWithKanji(vocabId)

      expect(result).toHaveLength(2)
      expect(result[0]?.kanji.character).toBe('水')
      expect(result[0]?.kanji.shortMeaning).toBe('water')
      expect(result[0]?.analysisNotes).toBe('Water component')
      expect(result[1]?.kanji.character).toBe('泳')
    })
  })

  describe('getByKanjiId', () => {
    it('returns empty array when no links exist', () => {
      const { getByKanjiId } = useVocabKanjiRepository()
      const result = getByKanjiId(kanji1Id)
      expect(result).toEqual([])
    })

    it('returns all vocab links for a kanji', () => {
      // Create second vocabulary
      const vocab2Id = seedVocabulary(testDb, {
        word: '水道',
        kana: 'すいどう'
      })

      // Link 水 to both vocabularies
      seedVocabKanji(testDb, vocabId, kanji1Id)
      seedVocabKanji(testDb, vocab2Id, kanji1Id)

      const { getByKanjiId } = useVocabKanjiRepository()
      const result = getByKanjiId(kanji1Id)

      expect(result).toHaveLength(2)
    })
  })

  describe('create', () => {
    it('creates a new vocab-kanji link', () => {
      const { create, getByVocabId } = useVocabKanjiRepository()
      const link = create(vocabId, kanji1Id)

      expect(link.vocabId).toBe(vocabId)
      expect(link.kanjiId).toBe(kanji1Id)
      expect(link.displayOrder).toBe(0)
      expect(link.analysisNotes).toBeNull()
      expect(link.id).toBeGreaterThan(0)

      const all = getByVocabId(vocabId)
      expect(all).toHaveLength(1)
    })

    it('auto-increments display_order', () => {
      const { create } = useVocabKanjiRepository()

      const link1 = create(vocabId, kanji1Id)
      const link2 = create(vocabId, kanji2Id)
      const link3 = create(vocabId, kanji3Id)

      expect(link1.displayOrder).toBe(0)
      expect(link2.displayOrder).toBe(1)
      expect(link3.displayOrder).toBe(2)
    })
  })

  describe('updateAnalysisNotes', () => {
    it('updates analysis notes', () => {
      const linkId = seedVocabKanji(testDb, vocabId, kanji1Id)

      const { getByVocabId, updateAnalysisNotes } = useVocabKanjiRepository()
      const updated = updateAnalysisNotes(linkId, 'Water radical analysis')

      expect(updated.analysisNotes).toBe('Water radical analysis')

      const all = getByVocabId(vocabId)
      expect(all[0]?.analysisNotes).toBe('Water radical analysis')
    })

    it('clears analysis notes when set to null', () => {
      const linkId = seedVocabKanji(testDb, vocabId, kanji1Id, {
        analysisNotes: 'Existing notes'
      })

      const { getByVocabId, updateAnalysisNotes } = useVocabKanjiRepository()
      const updated = updateAnalysisNotes(linkId, null)

      expect(updated.analysisNotes).toBeNull()

      const all = getByVocabId(vocabId)
      expect(all[0]?.analysisNotes).toBeNull()
    })
  })

  describe('reorder', () => {
    it('updates display_order for all links', () => {
      const link1Id = seedVocabKanji(testDb, vocabId, kanji1Id, {
        displayOrder: 0
      })
      const link2Id = seedVocabKanji(testDb, vocabId, kanji2Id, {
        displayOrder: 1
      })
      const link3Id = seedVocabKanji(testDb, vocabId, kanji3Id, {
        displayOrder: 2
      })

      const { getByVocabId, reorder } = useVocabKanjiRepository()

      // Reverse the order
      reorder([link3Id, link2Id, link1Id])

      const result = getByVocabId(vocabId)
      expect(result[0]?.id).toBe(link3Id)
      expect(result[0]?.displayOrder).toBe(0)
      expect(result[1]?.id).toBe(link2Id)
      expect(result[1]?.displayOrder).toBe(1)
      expect(result[2]?.id).toBe(link1Id)
      expect(result[2]?.displayOrder).toBe(2)
    })
  })

  describe('remove', () => {
    it('deletes vocab-kanji link', () => {
      const linkId = seedVocabKanji(testDb, vocabId, kanji1Id)

      const { getByVocabId, remove } = useVocabKanjiRepository()
      remove(linkId)

      const result = getByVocabId(vocabId)
      expect(result).toEqual([])
    })

    it('renumbers remaining links after deletion', () => {
      seedVocabKanji(testDb, vocabId, kanji1Id, { displayOrder: 0 })
      const link2Id = seedVocabKanji(testDb, vocabId, kanji2Id, {
        displayOrder: 1
      })
      seedVocabKanji(testDb, vocabId, kanji3Id, { displayOrder: 2 })

      const { getByVocabId, remove } = useVocabKanjiRepository()

      // Remove the middle link
      remove(link2Id)

      const result = getByVocabId(vocabId)
      expect(result).toHaveLength(2)
      expect(result[0]?.kanjiId).toBe(kanji1Id)
      expect(result[0]?.displayOrder).toBe(0)
      expect(result[1]?.kanjiId).toBe(kanji3Id)
      expect(result[1]?.displayOrder).toBe(1)
    })
  })
})
