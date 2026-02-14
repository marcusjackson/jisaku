/**
 * Kanji Detail Vocabulary Quick Create Schema Tests
 */

import { describe, expect, it } from 'vitest'

import { kanjiDetailVocabularyQuickCreateSchema } from './kanji-detail-vocabulary-quick-create-schema'

describe('kanjiDetailVocabularyQuickCreateSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid word, kana, and shortMeaning', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: '日本',
        kana: 'にほん',
        shortMeaning: 'Japan'
      })
      expect(result.success).toBe(true)
    })

    it('accepts word only (minimal valid input)', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: '水'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.kana).toBe('')
        expect(result.data.shortMeaning).toBe('')
      }
    })

    it('transforms empty kana to empty string', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: '日本',
        kana: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.kana).toBe('')
      }
    })

    it('transforms empty shortMeaning to empty string', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: '日本',
        shortMeaning: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('')
      }
    })

    it('transforms whitespace-only shortMeaning to empty string', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: '日本',
        shortMeaning: '   '
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('')
      }
    })
  })

  describe('invalid inputs', () => {
    it('rejects empty word', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Word is required')
      }
    })

    it('rejects word over 100 characters', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: 'あ'.repeat(101)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Word must be 100 characters or less'
        )
      }
    })

    it('rejects kana over 200 characters', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: '日本',
        kana: 'あ'.repeat(201)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Kana must be 200 characters or less'
        )
      }
    })

    it('rejects shortMeaning over 500 characters', () => {
      const result = kanjiDetailVocabularyQuickCreateSchema.safeParse({
        word: '日本',
        shortMeaning: 'a'.repeat(501)
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Short meaning must be 500 characters or less'
        )
      }
    })
  })
})
