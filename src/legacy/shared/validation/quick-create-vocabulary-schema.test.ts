/**
 * Tests for quick-create-vocabulary-schema
 */

import { describe, expect, it } from 'vitest'

import { quickCreateVocabularySchema } from './quick-create-vocabulary-schema'

import type { QuickCreateVocabularyData } from './quick-create-vocabulary-schema'

describe('quickCreateVocabularySchema', () => {
  describe('valid input', () => {
    it('accepts word only', () => {
      const input = { word: '日本' }
      const result = quickCreateVocabularySchema.parse(input)
      expect(result.word).toBe('日本')
      expect(result.kana).toBeUndefined()
      expect(result.shortMeaning).toBeUndefined()
    })

    it('accepts word with kana', () => {
      const input = { word: '日本', kana: 'にほん' }
      const result = quickCreateVocabularySchema.parse(input)
      expect(result.word).toBe('日本')
      expect(result.kana).toBe('にほん')
    })

    it('accepts word with short meaning', () => {
      const input = { word: '日本', shortMeaning: 'Japan' }
      const result = quickCreateVocabularySchema.parse(input)
      expect(result.word).toBe('日本')
      expect(result.shortMeaning).toBe('Japan')
    })

    it('accepts all fields', () => {
      const input: QuickCreateVocabularyData = {
        word: '食べる',
        kana: 'たべる',
        shortMeaning: 'to eat'
      }
      const result = quickCreateVocabularySchema.parse(input)
      expect(result).toEqual(input)
    })

    it('accepts empty string for optional kana', () => {
      const input = { word: '日本', kana: '' }
      const result = quickCreateVocabularySchema.parse(input)
      expect(result.kana).toBe('')
    })

    it('accepts empty string for optional shortMeaning', () => {
      const input = { word: '日本', shortMeaning: '' }
      const result = quickCreateVocabularySchema.parse(input)
      expect(result.shortMeaning).toBe('')
    })
  })

  describe('invalid input', () => {
    it('rejects empty word', () => {
      const input = { word: '' }
      const result = quickCreateVocabularySchema.safeParse(input)
      expect(result.success).toBe(false)
      if (!result.success && result.error.issues[0]) {
        expect(result.error.issues[0].message).toBe('Word is required')
      }
    })

    it('rejects missing word', () => {
      const input = { kana: 'にほん' }
      const result = quickCreateVocabularySchema.safeParse(input)
      expect(result.success).toBe(false)
    })

    it('rejects non-string word', () => {
      const input = { word: 123 }
      const result = quickCreateVocabularySchema.safeParse(input)
      expect(result.success).toBe(false)
    })
  })

  describe('type inference', () => {
    it('correctly infers QuickCreateVocabularyData type', () => {
      const data: QuickCreateVocabularyData = {
        word: '日本',
        kana: 'にほん',
        shortMeaning: 'Japan'
      }

      // Type should match schema output
      const parsed = quickCreateVocabularySchema.parse(data)
      expect(parsed.word).toBe(data.word)
      expect(parsed.kana).toBe(data.kana)
      expect(parsed.shortMeaning).toBe(data.shortMeaning)
    })
  })
})
