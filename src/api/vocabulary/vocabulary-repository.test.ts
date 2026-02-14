/**
 * Vocabulary Repository Tests
 *
 * Unit tests for the vocabulary repository.
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
import { useVocabularyRepository } from './vocabulary-repository'

describe('useVocabularyRepository', function () {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getById', () => {
    it('returns null when vocabulary does not exist', () => {
      const repo = useVocabularyRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns vocabulary when it exists', () => {
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning, is_common) VALUES (?, ?, ?, ?)',
        ['水', 'みず', 'water', 1]
      )

      const repo = useVocabularyRepository()
      const vocab = repo.getById(1)

      expect(vocab).not.toBeNull()
      expect(vocab?.word).toBe('水')
      expect(vocab?.kana).toBe('みず')
      expect(vocab?.shortMeaning).toBe('water')
      expect(vocab?.isCommon).toBe(true)
    })
  })

  describe('getByWord', () => {
    it('returns null when word not found', () => {
      const repo = useVocabularyRepository()
      expect(repo.getByWord('火')).toBeNull()
    })

    it('returns vocabulary when word exists', () => {
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning) VALUES (?, ?, ?)',
        ['火山', 'かざん', 'volcano']
      )

      const repo = useVocabularyRepository()
      const vocab = repo.getByWord('火山')

      expect(vocab?.word).toBe('火山')
    })
  })

  describe('getAll', () => {
    it('returns empty array when no vocabulary exist', () => {
      const repo = useVocabularyRepository()
      expect(repo.getAll()).toEqual([])
    })

    it('returns all vocabulary ordered by id desc', () => {
      testDb.run('INSERT INTO vocabulary (word, kana) VALUES (?, ?)', [
        '水',
        'みず'
      ])
      testDb.run('INSERT INTO vocabulary (word, kana) VALUES (?, ?)', [
        '火',
        'ひ'
      ])
      testDb.run('INSERT INTO vocabulary (word, kana) VALUES (?, ?)', [
        '木',
        'き'
      ])

      const repo = useVocabularyRepository()
      const all = repo.getAll()

      expect(all).toHaveLength(3)
      expect(all[0]?.word).toBe('木')
      expect(all[1]?.word).toBe('火')
      expect(all[2]?.word).toBe('水')
    })
  })

  describe('getCommonWords', () => {
    it('returns only common words', () => {
      testDb.run(
        'INSERT INTO vocabulary (word, kana, is_common) VALUES (?, ?, ?)',
        ['水', 'みず', 1]
      )
      testDb.run(
        'INSERT INTO vocabulary (word, kana, is_common) VALUES (?, ?, ?)',
        ['火', 'ひ', 0]
      )
      testDb.run(
        'INSERT INTO vocabulary (word, kana, is_common) VALUES (?, ?, ?)',
        ['木', 'き', 1]
      )

      const repo = useVocabularyRepository()
      const common = repo.getCommonWords()

      expect(common).toHaveLength(2)
      expect(common[0]?.isCommon).toBe(true)
      expect(common[1]?.isCommon).toBe(true)
    })
  })

  describe('create', () => {
    it('creates vocabulary with required fields', () => {
      const repo = useVocabularyRepository()
      const vocab = repo.create({
        word: '山',
        kana: 'やま'
      })

      expect(vocab.id).toBe(1)
      expect(vocab.word).toBe('山')
      expect(vocab.kana).toBe('やま')
      expect(vocab.shortMeaning).toBeNull()
      expect(vocab.isCommon).toBe(false)
    })

    it('creates vocabulary with optional fields', () => {
      const repo = useVocabularyRepository()
      const vocab = repo.create({
        word: '川',
        kana: 'かわ',
        shortMeaning: 'river',
        isCommon: true,
        jlptLevel: 'N5',
        description: 'A common word for river'
      })

      expect(vocab.word).toBe('川')
      expect(vocab.shortMeaning).toBe('river')
      expect(vocab.isCommon).toBe(true)
      expect(vocab.jlptLevel).toBe('N5')
      expect(vocab.description).toBe('A common word for river')
    })
  })

  describe('update', () => {
    it('throws EntityNotFoundError when vocabulary does not exist', () => {
      const repo = useVocabularyRepository()
      const throwFn = () => repo.update(999, { shortMeaning: 'test' })

      expect(throwFn).toThrow('Vocabulary with id 999 not found')
    })

    it('updates vocabulary fields', () => {
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning) VALUES (?, ?, ?)',
        ['水', 'みず', 'water']
      )

      const repo = useVocabularyRepository()
      const updated = repo.update(1, {
        shortMeaning: 'water (liquid)',
        isCommon: true
      })

      expect(updated.shortMeaning).toBe('water (liquid)')
      expect(updated.isCommon).toBe(true)
    })

    it('returns unchanged vocabulary when no fields provided', () => {
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning) VALUES (?, ?, ?)',
        ['水', 'みず', 'water']
      )

      const repo = useVocabularyRepository()
      const updated = repo.update(1, {})

      expect(updated.shortMeaning).toBe('water')
    })
  })

  describe('updateField', () => {
    it('updates a single field', () => {
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning) VALUES (?, ?, ?)',
        ['水', 'みず', 'water']
      )

      const repo = useVocabularyRepository()
      const updated = repo.updateField(1, 'description', 'Very common word')

      expect(updated.description).toBe('Very common word')
      expect(updated.shortMeaning).toBe('water')
    })
  })

  describe('remove', () => {
    it('removes a vocabulary', () => {
      testDb.run('INSERT INTO vocabulary (word, kana) VALUES (?, ?)', [
        '水',
        'みず'
      ])

      const repo = useVocabularyRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('search', () => {
    beforeEach(() => {
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning, is_common, jlpt_level) VALUES (?, ?, ?, ?, ?)',
        ['水', 'みず', 'water', 1, 'N5']
      )
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning, is_common, jlpt_level) VALUES (?, ?, ?, ?, ?)',
        ['水曜日', 'すいようび', 'Wednesday', 1, 'N5']
      )
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning, is_common, jlpt_level) VALUES (?, ?, ?, ?, ?)',
        ['火山', 'かざん', 'volcano', 0, 'N3']
      )
    })

    it('returns all vocabulary when no filters applied', () => {
      const repo = useVocabularyRepository()
      const results = repo.search({})

      expect(results).toHaveLength(3)
    })

    it('filters by isCommon', () => {
      const repo = useVocabularyRepository()
      const results = repo.search({ isCommon: true })

      expect(results).toHaveLength(2)
      expect(results.every((v) => v.isCommon)).toBe(true)
    })

    it('filters by jlptLevel', () => {
      const repo = useVocabularyRepository()
      const results = repo.search({ jlptLevels: ['N5'] })

      expect(results).toHaveLength(2)
      expect(results.every((v) => v.jlptLevel === 'N5')).toBe(true)
    })

    it('filters by query in word', () => {
      const repo = useVocabularyRepository()
      const results = repo.search({ word: '水' })

      expect(results).toHaveLength(2)
    })

    it('filters by query in meaning', () => {
      const repo = useVocabularyRepository()
      const results = repo.search({ search: 'water' })

      expect(results).toHaveLength(1)
      expect(results[0]?.word).toBe('水')
    })

    it('filters by query in kana', () => {
      const repo = useVocabularyRepository()
      const results = repo.search({ kana: 'みず' })

      expect(results).toHaveLength(1)
      expect(results[0]?.word).toBe('水')
    })
  })
})
