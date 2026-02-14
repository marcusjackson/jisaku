import { describe, expect, it } from 'vitest'

import { componentCreateSchema } from './component-create-schema'

describe('componentCreateSchema', () => {
  describe('valid inputs', () => {
    it('accepts a single Japanese character', () => {
      const result = componentCreateSchema.safeParse({ character: '亻' })
      expect(result.success).toBe(true)
    })

    it('accepts a kanji character', () => {
      const result = componentCreateSchema.safeParse({ character: '日' })
      expect(result.success).toBe(true)
    })

    it('trims whitespace around character', () => {
      const result = componentCreateSchema.safeParse({ character: ' 月 ' })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('rejects empty string', () => {
      const result = componentCreateSchema.safeParse({ character: '' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Please enter a character')
      }
    })

    it('rejects multiple characters', () => {
      const result = componentCreateSchema.safeParse({ character: '日月' })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Please enter only one character'
        )
      }
    })

    it('rejects whitespace-only input', () => {
      const result = componentCreateSchema.safeParse({ character: '   ' })
      expect(result.success).toBe(false)
    })
  })
})
