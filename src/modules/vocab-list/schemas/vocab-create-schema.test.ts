/**
 * Vocab Create Schema Tests
 */

import { describe, expect, it } from 'vitest'

import { vocabCreateSchema } from './vocab-create-schema'

describe('vocabCreateSchema', () => {
  describe('valid inputs', () => {
    it('accepts valid word and kana', () => {
      const result = vocabCreateSchema.safeParse({
        word: '日本',
        kana: 'にほん'
      })
      expect(result.success).toBe(true)
    })

    it('accepts single character word', () => {
      const result = vocabCreateSchema.safeParse({
        word: '水',
        kana: 'みず'
      })
      expect(result.success).toBe(true)
    })
  })

  describe('invalid inputs', () => {
    it('rejects empty word', () => {
      const result = vocabCreateSchema.safeParse({
        word: '',
        kana: 'にほん'
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Word is required')
      }
    })

    it('allows empty kana (optional field)', () => {
      const result = vocabCreateSchema.safeParse({
        word: '日本',
        kana: ''
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.kana).toBe('')
      }
    })

    it('rejects word over 100 characters', () => {
      const result = vocabCreateSchema.safeParse({
        word: 'あ'.repeat(101),
        kana: 'あ'
      })
      expect(result.success).toBe(false)
    })

    it('rejects kana over 100 characters', () => {
      const result = vocabCreateSchema.safeParse({
        word: '日本',
        kana: 'あ'.repeat(101)
      })
      expect(result.success).toBe(false)
    })
  })
})
