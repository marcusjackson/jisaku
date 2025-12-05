/**
 * Tests for component form schema
 */

import { describe, expect, it } from 'vitest'

import { componentFormSchema } from './component-form-schema'

describe('componentFormSchema', () => {
  describe('character field', () => {
    it('accepts a single character', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: 2
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty string', () => {
      const result = componentFormSchema.safeParse({
        character: '',
        strokeCount: 2
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Character is required')
      }
    })

    it('rejects multiple characters', () => {
      const result = componentFormSchema.safeParse({
        character: '亻氵',
        strokeCount: 2
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          'Must be a single character'
        )
      }
    })
  })

  describe('strokeCount field', () => {
    it('accepts valid stroke count', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: 2
      })
      expect(result.success).toBe(true)
    })

    it('rejects zero', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: 0
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be at least 1')
      }
    })

    it('rejects negative numbers', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: -1
      })
      expect(result.success).toBe(false)
    })

    it('rejects numbers over 64', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: 65
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be at most 64')
      }
    })

    it('rejects non-integers', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: 2.5
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be a whole number')
      }
    })

    it('rejects missing stroke count', () => {
      const result = componentFormSchema.safeParse({
        character: '亻'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Stroke count is required')
      }
    })
  })

  describe('optional fields', () => {
    it('accepts all optional fields', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        description: 'Full description of the person radical.',
        descriptionShort: 'Person radical',
        japaneseName: 'にんべん',
        sourceKanjiId: 1,
        strokeCount: 2
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.descriptionShort).toBe('Person radical')
        expect(result.data.japaneseName).toBe('にんべん')
        expect(result.data.description).toBe(
          'Full description of the person radical.'
        )
        expect(result.data.sourceKanjiId).toBe(1)
      }
    })

    it('accepts empty optional fields', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: 2
      })
      expect(result.success).toBe(true)
    })

    it('accepts null sourceKanjiId', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        sourceKanjiId: null,
        strokeCount: 2
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.sourceKanjiId).toBe(null)
      }
    })
  })

  describe('valid complete form', () => {
    it('accepts minimal valid form', () => {
      const result = componentFormSchema.safeParse({
        character: '氵',
        strokeCount: 3
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          character: '氵',
          strokeCount: 3
        })
      }
    })

    it('accepts complete form', () => {
      const result = componentFormSchema.safeParse({
        character: '氵',
        description: 'Represents water or liquid.',
        descriptionShort: 'Water radical',
        japaneseName: 'さんずい',
        sourceKanjiId: 42,
        strokeCount: 3
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          character: '氵',
          description: 'Represents water or liquid.',
          descriptionShort: 'Water radical',
          japaneseName: 'さんずい',
          sourceKanjiId: 42,
          strokeCount: 3
        })
      }
    })
  })
})
