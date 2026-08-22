/**
 * Quick-Create Kanji Schema Tests
 */

import { describe, expect, it } from 'vitest'

import { quickCreateKanjiSchema } from './quick-create-kanji-schema'

describe('quickCreateKanjiSchema', () => {
  describe('character field', () => {
    it('accepts valid single character', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明'
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid surrogate-pair character (multi-code-unit single grapheme)', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '\uD840\uDC0B' // 𠀋 — single grapheme, two UTF-16 code units
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty character', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: ''
      })
      expect(result.success).toBe(false)
      if (result.success) throw new Error('Expected parse to fail')
      expect(result.error.issues[0]?.message).toBe('Please enter a character')
    })

    it('rejects multiple characters', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明暗'
      })
      expect(result.success).toBe(false)
      if (result.success) throw new Error('Expected parse to fail')
      expect(result.error.issues[0]?.message).toBe(
        'Please enter only one character'
      )
    })
  })

  describe('shortMeaning field', () => {
    it('accepts optional shortMeaning', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明',
        shortMeaning: 'bright'
      })
      expect(result.success).toBe(true)
      if (!result.success) throw new Error('Expected parse to succeed')
      expect(result.data.shortMeaning).toBe('bright')
    })

    it('accepts missing shortMeaning', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明'
      })
      expect(result.success).toBe(true)
    })
  })

  describe('searchKeywords field', () => {
    it('accepts optional searchKeywords', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明',
        searchKeywords: 'bright, light, clear'
      })
      expect(result.success).toBe(true)
      if (!result.success) throw new Error('Expected parse to succeed')
      expect(result.data.searchKeywords).toBe('bright, light, clear')
    })

    it('accepts missing searchKeywords', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明'
      })
      expect(result.success).toBe(true)
    })
  })
})
