/**
 * Tests for quick-create kanji schema
 */

import { describe, expect, it } from 'vitest'

import { quickCreateKanjiSchema } from './quick-create-kanji-schema'

describe('quickCreateKanjiSchema', () => {
  describe('character field', () => {
    it('accepts a single character', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '日',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty string', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '',
        strokeCount: 4
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Character is required')
      }
    })

    it('rejects multiple characters', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '日月',
        strokeCount: 4
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
    it('accepts optional short meaning', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '日',
        shortMeaning: 'sun, day'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('sun, day')
      }
    })

    it('accepts empty short meaning', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '日',
        shortMeaning: ''
      })
      expect(result.success).toBe(true)
    })

    it('allows omitting short meaning', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '日'
      })
      expect(result.success).toBe(true)
    })
  })

  describe('full form data', () => {
    it('accepts complete valid data', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '日',
        shortMeaning: 'sun, day'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          character: '日',
          shortMeaning: 'sun, day'
        })
      }
    })

    it('accepts minimal valid data', () => {
      const result = quickCreateKanjiSchema.safeParse({
        character: '日',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })
  })
})
