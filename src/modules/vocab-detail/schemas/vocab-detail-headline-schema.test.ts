/**
 * Tests for Vocabulary Headline Schema
 */

import { describe, expect, it } from 'vitest'

import { vocabHeadlineSchema } from './vocab-detail-headline-schema'

describe('vocabHeadlineSchema', () => {
  describe('word field', () => {
    it('accepts valid word', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty word', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('rejects word exceeding max length', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: 'a'.repeat(101),
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('accepts word at 100 characters', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: 'a'.repeat(100),
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing word field', () => {
      const result = vocabHeadlineSchema.safeParse({
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })
  })

  describe('kana field', () => {
    it('accepts valid kana', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty kana', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: '',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('rejects kana exceeding max length', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'あ'.repeat(101),
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('accepts kana at 100 characters', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'あ'.repeat(100),
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('rejects missing kana field', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })
  })

  describe('optional fields', () => {
    it('accepts empty shortMeaning', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid shortMeaning', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: 'Japanese language',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('Japanese language')
      }
    })

    it('accepts empty searchKeywords', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid searchKeywords', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: 'nihongo, japanese'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.searchKeywords).toBe('nihongo, japanese')
      }
    })

    it('rejects shortMeaning exceeding max length', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: 'a'.repeat(101),
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('accepts shortMeaning at 100 characters', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: 'a'.repeat(100),
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('rejects searchKeywords exceeding max length', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: 'a'.repeat(501)
      })
      expect(result.success).toBe(false)
    })

    it('accepts searchKeywords at 500 characters', () => {
      const result = vocabHeadlineSchema.safeParse({
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: '',
        searchKeywords: 'a'.repeat(500)
      })
      expect(result.success).toBe(true)
    })
  })
})
