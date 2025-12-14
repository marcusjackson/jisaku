/**
 * Tests for quick-create component schema
 */

import { describe, expect, it } from 'vitest'

import { quickCreateComponentSchema } from './quick-create-component-schema'

describe('quickCreateComponentSchema', () => {
  describe('character field', () => {
    it('accepts a single character', () => {
      const result = quickCreateComponentSchema.safeParse({
        character: '亻'
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty string', () => {
      const result = quickCreateComponentSchema.safeParse({
        character: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Character is required')
      }
    })

    it('rejects multiple characters', () => {
      const result = quickCreateComponentSchema.safeParse({
        character: '亻氵'
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
      const result = quickCreateComponentSchema.safeParse({
        character: '亻',
        shortMeaning: 'person'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('person')
      }
    })

    it('accepts empty short meaning', () => {
      const result = quickCreateComponentSchema.safeParse({
        character: '亻',
        shortMeaning: ''
      })
      expect(result.success).toBe(true)
    })

    it('allows omitting short meaning', () => {
      const result = quickCreateComponentSchema.safeParse({
        character: '亻'
      })
      expect(result.success).toBe(true)
    })
  })

  describe('full form data', () => {
    it('accepts complete valid data', () => {
      const result = quickCreateComponentSchema.safeParse({
        character: '亻',
        shortMeaning: 'person'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          character: '亻',
          shortMeaning: 'person'
        })
      }
    })

    it('accepts minimal valid data', () => {
      const result = quickCreateComponentSchema.safeParse({
        character: '亻'
      })
      expect(result.success).toBe(true)
    })
  })
})
