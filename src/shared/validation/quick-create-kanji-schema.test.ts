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

    it('rejects empty character', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Character is required')
      }
    })

    it('rejects multiple characters', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明暗'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Must be a single character'
        )
      }
    })
  })

  describe('shortMeaning field', () => {
    it('accepts optional shortMeaning', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明',
        shortMeaning: 'bright'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('bright')
      }
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
      if (result.success) {
        expect(result.data.searchKeywords).toBe('bright, light, clear')
      }
    })

    it('accepts missing searchKeywords', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '明'
      })
      expect(result.success).toBe(true)
    })
  })
})
