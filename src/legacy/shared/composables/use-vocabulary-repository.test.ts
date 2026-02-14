/**
 * Tests for useVocabularyRepository composable
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
import { useVocabularyRepository } from './use-vocabulary-repository'

describe('useVocabularyRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getAll', () => {
    it('returns empty array when no vocabulary exists', () => {
      const { getAll } = useVocabularyRepository()
      const result = getAll()
      expect(result).toEqual([])
    })

    it('returns all vocabulary ordered by word', () => {
      seedVocabulary(testDb, { word: '日本', kana: 'にほん' })
      seedVocabulary(testDb, { word: 'あいさつ', kana: 'あいさつ' })
      seedVocabulary(testDb, { word: '水泳', kana: 'すいえい' })

      const { getAll } = useVocabularyRepository()
      const result = getAll()

      expect(result).toHaveLength(3)
      expect(result[0]?.word).toBe('あいさつ')
      expect(result[1]?.word).toBe('日本')
      expect(result[2]?.word).toBe('水泳')
    })
  })

  describe('getById', () => {
    it('returns null when vocabulary not found', () => {
      const { getById } = useVocabularyRepository()
      const result = getById(999)
      expect(result).toBeNull()
    })

    it('returns vocabulary by ID', () => {
      const vocabId = seedVocabulary(testDb, {
        word: '水泳',
        kana: 'すいえい',
        shortMeaning: 'swimming'
      })

      const { getById } = useVocabularyRepository()
      const result = getById(vocabId)

      expect(result).not.toBeNull()
      expect(result?.word).toBe('水泳')
      expect(result?.kana).toBe('すいえい')
      expect(result?.shortMeaning).toBe('swimming')
    })
  })

  describe('getByWord', () => {
    it('returns null when word not found', () => {
      const { getByWord } = useVocabularyRepository()
      const result = getByWord('存在しない')
      expect(result).toBeNull()
    })

    it('returns vocabulary by word', () => {
      seedVocabulary(testDb, { word: '日本', kana: 'にほん' })

      const { getByWord } = useVocabularyRepository()
      const result = getByWord('日本')

      expect(result).not.toBeNull()
      expect(result?.kana).toBe('にほん')
    })
  })

  describe('search', () => {
    beforeEach(() => {
      seedVocabulary(testDb, {
        word: '水泳',
        kana: 'すいえい',
        shortMeaning: 'swimming',
        jlptLevel: 'N3',
        isCommon: true
      })
      seedVocabulary(testDb, {
        word: '日本',
        kana: 'にほん',
        shortMeaning: 'Japan',
        jlptLevel: 'N5',
        isCommon: true
      })
      seedVocabulary(testDb, {
        word: '難解',
        kana: 'なんかい',
        shortMeaning: 'difficult',
        jlptLevel: 'N1',
        isCommon: false
      })
    })

    it('returns all vocabulary when no filters provided', () => {
      const { search } = useVocabularyRepository()
      const result = search()
      expect(result).toHaveLength(3)
    })

    it('filters by search text in word', () => {
      const { search } = useVocabularyRepository()
      const result = search({ searchText: '水' })
      expect(result).toHaveLength(1)
      expect(result[0]?.word).toBe('水泳')
    })

    it('filters by search text in kana', () => {
      const { search } = useVocabularyRepository()
      const result = search({ searchText: 'にほん' })
      expect(result).toHaveLength(1)
      expect(result[0]?.word).toBe('日本')
    })

    it('filters by JLPT levels', () => {
      const { search } = useVocabularyRepository()
      const result = search({ jlptLevels: ['N5'] })
      expect(result).toHaveLength(1)
      expect(result[0]?.word).toBe('日本')
    })

    it('filters by multiple JLPT levels', () => {
      const { search } = useVocabularyRepository()
      const result = search({ jlptLevels: ['N3', 'N5'] })
      expect(result).toHaveLength(2)
    })

    it('filters by isCommon', () => {
      const { search } = useVocabularyRepository()
      const result = search({ isCommon: false })
      expect(result).toHaveLength(1)
      expect(result[0]?.word).toBe('難解')
    })

    it('filters by containsKanjiId', () => {
      // Create kanji
      const kanjiId = seedKanji(testDb, { character: '水', strokeCount: 4 }).id

      // Get the vocabulary id for 水泳
      const vocab = testDb.exec("SELECT id FROM vocabulary WHERE word = '水泳'")
      const vocabId = vocab[0]?.values[0]?.[0] as number

      // Link kanji to vocabulary
      seedVocabKanji(testDb, vocabId, kanjiId)

      const { search } = useVocabularyRepository()
      const result = search({ containsKanjiId: kanjiId })
      expect(result).toHaveLength(1)
      expect(result[0]?.word).toBe('水泳')
    })
  })

  describe('create', () => {
    it('creates a new vocabulary entry', () => {
      const { create, getByWord } = useVocabularyRepository()
      const vocab = create({
        word: '新語',
        kana: 'しんご',
        shortMeaning: 'new word'
      })

      expect(vocab.word).toBe('新語')
      expect(vocab.kana).toBe('しんご')
      expect(vocab.shortMeaning).toBe('new word')
      expect(vocab.id).toBeGreaterThan(0)

      const retrieved = getByWord('新語')
      expect(retrieved?.id).toBe(vocab.id)
    })

    it('creates vocabulary with all optional fields', () => {
      const { create } = useVocabularyRepository()
      const vocab = create({
        word: 'テスト',
        kana: 'てすと',
        shortMeaning: 'test',
        searchKeywords: 'exam, trial',
        jlptLevel: 'N4',
        isCommon: true,
        description: 'A test word'
      })

      expect(vocab.jlptLevel).toBe('N4')
      expect(vocab.isCommon).toBe(true)
      expect(vocab.description).toBe('A test word')
    })
  })

  describe('updateHeaderFields', () => {
    it('updates header fields', () => {
      const vocabId = seedVocabulary(testDb, {
        word: '古語',
        kana: 'こご',
        shortMeaning: 'old word'
      })

      const { getById, updateHeaderFields } = useVocabularyRepository()
      const updated = updateHeaderFields(
        vocabId,
        '新語',
        'しんご',
        'new word',
        'keywords'
      )

      expect(updated.word).toBe('新語')
      expect(updated.kana).toBe('しんご')
      expect(updated.shortMeaning).toBe('new word')
      expect(updated.searchKeywords).toBe('keywords')

      const retrieved = getById(vocabId)
      expect(retrieved?.word).toBe('新語')
    })
  })

  describe('updateBasicInfoField', () => {
    it('updates jlpt_level', () => {
      const vocabId = seedVocabulary(testDb, { word: 'テスト', kana: 'てすと' })

      const { getById, updateBasicInfoField } = useVocabularyRepository()
      const updated = updateBasicInfoField(vocabId, 'jlpt_level', 'N3')

      expect(updated.jlptLevel).toBe('N3')

      const retrieved = getById(vocabId)
      expect(retrieved?.jlptLevel).toBe('N3')
    })

    it('updates is_common', () => {
      const vocabId = seedVocabulary(testDb, {
        word: 'テスト',
        kana: 'てすと',
        isCommon: false
      })

      const { getById, updateBasicInfoField } = useVocabularyRepository()
      const updated = updateBasicInfoField(vocabId, 'is_common', true)

      expect(updated.isCommon).toBe(true)

      const retrieved = getById(vocabId)
      expect(retrieved?.isCommon).toBe(true)
    })

    it('updates description', () => {
      const vocabId = seedVocabulary(testDb, { word: 'テスト', kana: 'てすと' })

      const { getById, updateBasicInfoField } = useVocabularyRepository()
      const updated = updateBasicInfoField(
        vocabId,
        'description',
        'A description'
      )

      expect(updated.description).toBe('A description')

      const retrieved = getById(vocabId)
      expect(retrieved?.description).toBe('A description')
    })

    it('throws error for invalid field', () => {
      const vocabId = seedVocabulary(testDb, { word: 'テスト', kana: 'てすと' })

      const { updateBasicInfoField } = useVocabularyRepository()
      expect(() =>
        updateBasicInfoField(vocabId, 'invalid_field' as never, 'value')
      ).toThrow('Invalid field')
    })
  })

  describe('remove', () => {
    it('deletes vocabulary entry', () => {
      const vocabId = seedVocabulary(testDb, { word: 'テスト', kana: 'てすと' })

      const { getById, remove } = useVocabularyRepository()
      remove(vocabId)

      const result = getById(vocabId)
      expect(result).toBeNull()
    })

    it('cascades delete to vocab_kanji entries', () => {
      // Create vocabulary and kanji
      const vocabId = seedVocabulary(testDb, { word: 'テスト', kana: 'てすと' })
      const kanjiId = seedKanji(testDb, { character: '日', strokeCount: 4 }).id

      // Link them
      seedVocabKanji(testDb, vocabId, kanjiId)

      // Verify link exists
      const beforeResult = testDb.exec(
        'SELECT COUNT(*) FROM vocab_kanji WHERE vocab_id = ?',
        [vocabId]
      )
      expect(beforeResult[0]?.values[0]?.[0]).toBe(1)

      // Delete vocabulary
      const { remove } = useVocabularyRepository()
      remove(vocabId)

      // Verify link is deleted
      const afterResult = testDb.exec(
        'SELECT COUNT(*) FROM vocab_kanji WHERE vocab_id = ?',
        [vocabId]
      )
      expect(afterResult[0]?.values[0]?.[0]).toBe(0)
    })
  })
})
