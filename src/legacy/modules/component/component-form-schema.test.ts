/**
 * Tests for component form schema
 */

import { describe, expect, it } from 'vitest'

import { componentFormSchema } from './component-form-schema'

describe('componentFormSchema', () => {
  describe('character field', () => {
    it('accepts a single character', () => {
      const result = componentFormSchema.safeParse({
        character: '亻'
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty string', () => {
      const result = componentFormSchema.safeParse({
        character: ''
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Character is required')
      }
    })

    it('rejects multiple characters', () => {
      const result = componentFormSchema.safeParse({
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

  describe('strokeCount field', () => {
    it('accepts valid stroke count', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: 2
      })
      expect(result.success).toBe(true)
    })

    it('accepts null stroke count', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: null
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.strokeCount).toBe(null)
      }
    })

    it('accepts undefined stroke count', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        strokeCount: undefined
      })
      expect(result.success).toBe(true)
    })

    it('accepts omitted stroke count', () => {
      const result = componentFormSchema.safeParse({
        character: '亻'
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
  })

  describe('optional fields', () => {
    it('accepts all optional fields', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        description: 'Person radical',
        searchKeywords: 'にんべん',
        sourceKanjiId: 1,
        strokeCount: 2
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.description).toBe('Person radical')
        expect(result.data.searchKeywords).toBe('にんべん')
        expect(result.data.sourceKanjiId).toBe(1)
      }
    })

    it('accepts empty optional fields', () => {
      const result = componentFormSchema.safeParse({
        character: '亻'
      })
      expect(result.success).toBe(true)
    })

    it('accepts null sourceKanjiId', () => {
      const result = componentFormSchema.safeParse({
        character: '亻',
        sourceKanjiId: null
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
        character: '氵'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          character: '氵'
        })
      }
    })

    it('accepts complete form', () => {
      const result = componentFormSchema.safeParse({
        character: '氵',
        description: 'Water radical',
        searchKeywords: 'さんずい',
        sourceKanjiId: 42,
        strokeCount: 3
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toEqual({
          character: '氵',
          description: 'Water radical',
          searchKeywords: 'さんずい',
          sourceKanjiId: 42,
          strokeCount: 3
        })
      }
    })
  })
})
