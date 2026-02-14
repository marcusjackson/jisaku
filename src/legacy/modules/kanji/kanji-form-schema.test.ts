/**
 * Tests for kanji form schema
 */

import { describe, expect, it } from 'vitest'

import { kanjiFormSchema } from './kanji-form-schema'

describe('kanjiFormSchema', () => {
  describe('character field', () => {
    it('accepts a single character', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('rejects empty string', () => {
      const result = kanjiFormSchema.safeParse({
        character: '',
        strokeCount: 4
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Character is required')
      }
    })

    it('rejects multiple characters', () => {
      const result = kanjiFormSchema.safeParse({
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

  describe('strokeCount field', () => {
    it('accepts valid stroke count', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('rejects zero', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: 0
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be at least 1')
      }
    })

    it('rejects negative numbers', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: -1
      })
      expect(result.success).toBe(false)
    })

    it('rejects numbers over 64', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: 65
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be at most 64')
      }
    })

    it('rejects non-integers', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: 4.5
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe('Must be a whole number')
      }
    })
  })

  describe('jlptLevel field', () => {
    it('accepts valid JLPT levels', () => {
      const levels = ['N5', 'N4', 'N3', 'N2', 'N1'] as const
      for (const level of levels) {
        const result = kanjiFormSchema.safeParse({
          character: '日',
          jlptLevel: level,
          strokeCount: 4
        })
        expect(result.success).toBe(true)
      }
    })

    it('accepts null', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        jlptLevel: null,
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid values', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        jlptLevel: 'N6',
        strokeCount: 4
      })
      expect(result.success).toBe(false)
    })
  })

  describe('joyoLevel field', () => {
    it('accepts valid Joyo levels', () => {
      const levels = [
        'elementary1',
        'elementary2',
        'elementary3',
        'elementary4',
        'elementary5',
        'elementary6',
        'secondary'
      ] as const
      for (const level of levels) {
        const result = kanjiFormSchema.safeParse({
          character: '日',
          joyoLevel: level,
          strokeCount: 4
        })
        expect(result.success).toBe(true)
      }
    })

    it('accepts null', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        joyoLevel: null,
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })
  })

  describe('notes fields', () => {
    it('accepts optional etymology notes', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        notesEtymology: 'Historical origins and character evolution.',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional semantic notes', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        notesSemantic: 'Semantic significance and usage.',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('accepts optional personal notes', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        notesPersonal: 'Sun, day. One of the most fundamental kanji.',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('accepts empty notes', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        notesEtymology: '',
        notesSemantic: '',
        notesPersonal: '',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })

    it('allows omitting all notes', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })
  })

  describe('full form data', () => {
    it('accepts complete valid data', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        jlptLevel: 'N5',
        joyoLevel: 'elementary1',
        notesEtymology: 'Sun pictograph',
        notesSemantic: 'Associated with Japan',
        notesPersonal: 'Sun, day',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toMatchObject({
          character: '日',
          jlptLevel: 'N5',
          joyoLevel: 'elementary1',
          notesPersonal: 'Sun, day',
          strokeCount: 4
        })
      }
    })

    it('accepts minimal valid data', () => {
      const result = kanjiFormSchema.safeParse({
        character: '日',
        strokeCount: 4
      })
      expect(result.success).toBe(true)
    })
  })
})
