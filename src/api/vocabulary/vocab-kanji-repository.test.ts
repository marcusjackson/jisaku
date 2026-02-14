/**
 * Vocab-Kanji Repository Tests
 *
 * Unit tests for vocabulary-kanji junction repository.
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
import { useVocabKanjiRepository } from './vocab-kanji-repository'

describe('useVocabKanjiRepository', function () {
  let vocabId: number
  let kanjiId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()

    // Create a vocabulary
    testDb.run(
      'INSERT INTO vocabulary (word, kana, short_meaning) VALUES (?, ?, ?)',
      ['明日', 'あした', 'tomorrow']
    )
    vocabId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number

    // Create a kanji
    testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
      '明',
      8
    ])
    kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByParentId', () => {
    it('returns empty array when no links exist', () => {
      const repo = useVocabKanjiRepository()
      expect(repo.getByParentId(vocabId)).toEqual([])
    })

    it('returns links ordered by display_order', () => {
      // Create second kanji
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['日'])
      const secondKanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, secondKanjiId, 1]
      )

      const repo = useVocabKanjiRepository()
      const links = repo.getByParentId(vocabId)

      expect(links).toHaveLength(2)
      expect(links[0]?.kanjiId).toBe(kanjiId)
      expect(links[1]?.kanjiId).toBe(secondKanjiId)
    })
  })

  describe('getById', () => {
    it('returns null when link does not exist', () => {
      const repo = useVocabKanjiRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns link when it exists', () => {
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )

      const repo = useVocabKanjiRepository()
      const link = repo.getById(1)

      expect(link?.vocabId).toBe(vocabId)
      expect(link?.kanjiId).toBe(kanjiId)
    })
  })

  describe('getByKanjiId', () => {
    it('returns empty array when kanji has no vocabulary', () => {
      const repo = useVocabKanjiRepository()
      expect(repo.getByKanjiId(kanjiId)).toEqual([])
    })

    it('returns all vocabulary links for a kanji', () => {
      // Create second vocabulary
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning) VALUES (?, ?, ?)',
        ['明るい', 'あかるい', 'bright']
      )
      const secondVocabId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [secondVocabId, kanjiId, 0]
      )

      const repo = useVocabKanjiRepository()
      const links = repo.getByKanjiId(kanjiId)

      expect(links).toHaveLength(2)
    })
  })

  describe('getByKanjiIdWithVocabulary', () => {
    it('returns empty array when kanji has no vocabulary', () => {
      const repo = useVocabKanjiRepository()
      expect(repo.getByKanjiIdWithVocabulary(kanjiId)).toEqual([])
    })

    it('returns vocabulary with full data joined', () => {
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )

      const repo = useVocabKanjiRepository()
      const results = repo.getByKanjiIdWithVocabulary(kanjiId)

      expect(results).toHaveLength(1)
      expect(results[0]?.vocabKanji.vocabId).toBe(vocabId)
      expect(results[0]?.vocabKanji.kanjiId).toBe(kanjiId)
      expect(results[0]?.vocabulary.word).toBe('明日')
      expect(results[0]?.vocabulary.kana).toBe('あした')
      expect(results[0]?.vocabulary.shortMeaning).toBe('tomorrow')
    })

    it('orders results by vocabulary word alphabetically', () => {
      // Create second vocabulary
      testDb.run(
        'INSERT INTO vocabulary (word, kana, short_meaning) VALUES (?, ?, ?)',
        ['明るい', 'あかるい', 'bright']
      )
      const secondVocabId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [secondVocabId, kanjiId, 0]
      )

      const repo = useVocabKanjiRepository()
      const results = repo.getByKanjiIdWithVocabulary(kanjiId)

      expect(results).toHaveLength(2)
      // SQLite sorts by Unicode codepoint, not Japanese alphabetical order
      expect(results[0]?.vocabulary.word).toBe('明るい')
      expect(results[1]?.vocabulary.word).toBe('明日')
    })
  })

  describe('create', () => {
    it('creates a link with default values', () => {
      const repo = useVocabKanjiRepository()
      const link = repo.create({
        vocabId,
        kanjiId
      })

      expect(link.vocabId).toBe(vocabId)
      expect(link.kanjiId).toBe(kanjiId)
      expect(link.displayOrder).toBe(0)
    })

    it('creates a link with custom display order', () => {
      const repo = useVocabKanjiRepository()
      const link = repo.create({
        vocabId,
        kanjiId,
        displayOrder: 5
      })

      expect(link.displayOrder).toBe(5)
    })

    it('auto-increments display_order', () => {
      // Create second kanji
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['日'])
      const secondKanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      const repo = useVocabKanjiRepository()

      repo.create({ vocabId, kanjiId })
      const second = repo.create({ vocabId, kanjiId: secondKanjiId })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when link does not exist', () => {
      const repo = useVocabKanjiRepository()
      const throwFn = () => repo.update(999, { displayOrder: 2 })

      expect(throwFn).toThrow('VocabKanji with id 999 not found')
    })

    it('updates link display order', () => {
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )

      const repo = useVocabKanjiRepository()
      const updated = repo.update(1, { displayOrder: 5 })

      expect(updated.displayOrder).toBe(5)
    })
  })

  describe('remove', () => {
    it('removes a link', () => {
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )

      const repo = useVocabKanjiRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('removeByVocabId', () => {
    it('removes all links for a vocabulary', () => {
      // Create second kanji
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['日'])
      const secondKanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, secondKanjiId, 1]
      )

      const repo = useVocabKanjiRepository()
      repo.removeByVocabId(vocabId)

      expect(repo.getByParentId(vocabId)).toEqual([])
    })
  })

  describe('reorder', () => {
    it('reorders links by new id sequence', () => {
      // Create second kanji
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['日'])
      const secondKanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, kanjiId, 0]
      )
      testDb.run(
        'INSERT INTO vocab_kanji (vocab_id, kanji_id, display_order) VALUES (?, ?, ?)',
        [vocabId, secondKanjiId, 1]
      )

      const repo = useVocabKanjiRepository()
      repo.reorder([2, 1])

      const links = repo.getByParentId(vocabId)
      expect(links[0]?.kanjiId).toBe(secondKanjiId)
      expect(links[1]?.kanjiId).toBe(kanjiId)
    })
  })
})
