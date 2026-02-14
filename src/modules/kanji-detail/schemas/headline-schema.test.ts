/**
 * Tests for Kanji Headline Schema
 */

import { describe, expect, it } from 'vitest'

import { kanjiHeadlineSchema } from './headline-schema'

describe('kanjiHeadlineSchema', () => {
  describe('character field', () => {
    it('accepts valid kanji character', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.character).toBe('水')
      }
    })

    it('rejects empty character', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('rejects multiple characters', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水火',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing character field', () => {
      const result = kanjiHeadlineSchema.safeParse({
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })
  })

  describe('shortMeaning field', () => {
    it('accepts empty string', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid short meaning', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: 'water',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('water')
      }
    })

    it('rejects shortMeaning over 100 characters', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: 'a'.repeat(101),
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('accepts shortMeaning at 100 characters', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: 'a'.repeat(100),
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })
  })

  describe('searchKeywords field', () => {
    it('accepts empty string', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid search keywords', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: '',
        searchKeywords: 'mizu, sui'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.searchKeywords).toBe('mizu, sui')
      }
    })

    it('rejects searchKeywords over 500 characters', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: '',
        searchKeywords: 'a'.repeat(501)
      })
      expect(result.success).toBe(false)
    })

    it('accepts searchKeywords at 500 characters', () => {
      const result = kanjiHeadlineSchema.safeParse({
        character: '水',
        shortMeaning: '',
        searchKeywords: 'a'.repeat(500)
      })
      expect(result.success).toBe(true)
    })
  })
})
