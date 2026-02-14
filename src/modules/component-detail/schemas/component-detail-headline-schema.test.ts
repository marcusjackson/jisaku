/**
 * Tests for Component Headline Schema
 */

import { describe, expect, it } from 'vitest'

import { componentHeadlineSchema } from './component-detail-headline-schema'

describe('componentHeadlineSchema', () => {
  describe('character field', () => {
    it('accepts valid component character', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.character).toBe('氵')
      }
    })

    it('rejects empty character', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('rejects multiple characters', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵氺',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('rejects missing character field', () => {
      const result = componentHeadlineSchema.safeParse({
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })
  })

  describe('shortMeaning field', () => {
    it('accepts empty string', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid short meaning', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: 'water',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.shortMeaning).toBe('water')
      }
    })

    it('rejects shortMeaning over 100 characters', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: 'a'.repeat(101),
        searchKeywords: ''
      })
      expect(result.success).toBe(false)
    })

    it('accepts shortMeaning at 100 characters', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: 'a'.repeat(100),
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })
  })

  describe('searchKeywords field', () => {
    it('accepts empty string', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: '',
        searchKeywords: ''
      })
      expect(result.success).toBe(true)
    })

    it('accepts valid search keywords', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: '',
        searchKeywords: 'mizu, sui, sanzui'
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.searchKeywords).toBe('mizu, sui, sanzui')
      }
    })

    it('rejects searchKeywords over 500 characters', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: '',
        searchKeywords: 'a'.repeat(501)
      })
      expect(result.success).toBe(false)
    })

    it('accepts searchKeywords at 500 characters', () => {
      const result = componentHeadlineSchema.safeParse({
        character: '氵',
        shortMeaning: '',
        searchKeywords: 'a'.repeat(500)
      })
      expect(result.success).toBe(true)
    })
  })
})
