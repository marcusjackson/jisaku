/**
 * Tests for kanji basic info validation schema
 */

import { describe, expect, it } from 'vitest'

import {
  classificationItemSchema,
  kanjiBasicInfoSchema
} from './basic-info-schema'

describe('classificationItemSchema', () => {
  it('validates valid classification item with id', () => {
    const result = classificationItemSchema.safeParse({
      id: 1,
      classificationTypeId: 10,
      displayOrder: 0
    })

    expect(result.success).toBe(true)
  })

  it('validates classification item without id', () => {
    const result = classificationItemSchema.safeParse({
      id: undefined,
      classificationTypeId: 10,
      displayOrder: 0
    })

    expect(result.success).toBe(true)
  })

  it('requires classificationTypeId', () => {
    const result = classificationItemSchema.safeParse({
      displayOrder: 0
    })

    expect(result.success).toBe(false)
  })

  it('requires displayOrder', () => {
    const result = classificationItemSchema.safeParse({
      classificationTypeId: 10
    })

    expect(result.success).toBe(false)
  })
})

describe('kanjiBasicInfoSchema', () => {
  const validData = {
    strokeCount: 5,
    jlptLevel: 'N3' as const,
    joyoLevel: 'elementary3' as const,
    kanjiKenteiLevel: '5' as const,
    radicalId: 1,
    classifications: []
  }

  describe('strokeCount', () => {
    it('accepts valid stroke count', () => {
      const result = kanjiBasicInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('accepts null stroke count', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        strokeCount: null
      })
      expect(result.success).toBe(true)
    })

    it('rejects stroke count below 1', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        strokeCount: 0
      })
      expect(result.success).toBe(false)
    })

    it('rejects stroke count above 64', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        strokeCount: 65
      })
      expect(result.success).toBe(false)
    })

    it('rejects non-integer stroke count', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        strokeCount: 5.5
      })
      expect(result.success).toBe(false)
    })
  })

  describe('jlptLevel', () => {
    it.each(['N5', 'N4', 'N3', 'N2', 'N1'] as const)(
      'accepts valid JLPT level %s',
      (level) => {
        const result = kanjiBasicInfoSchema.safeParse({
          ...validData,
          jlptLevel: level
        })
        expect(result.success).toBe(true)
      }
    )

    it('accepts null jlptLevel', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        jlptLevel: null
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid jlptLevel', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        jlptLevel: 'N6'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('joyoLevel', () => {
    it.each([
      'elementary1',
      'elementary2',
      'elementary3',
      'elementary4',
      'elementary5',
      'elementary6',
      'secondary'
    ] as const)('accepts valid Joyo level %s', (level) => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        joyoLevel: level
      })
      expect(result.success).toBe(true)
    })

    it('accepts null joyoLevel', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        joyoLevel: null
      })
      expect(result.success).toBe(true)
    })
  })

  describe('kanjiKenteiLevel', () => {
    it.each([
      '10',
      '9',
      '8',
      '7',
      '6',
      '5',
      '4',
      '3',
      'pre2',
      '2',
      'pre1',
      '1'
    ] as const)('accepts valid Kentei level %s', (level) => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        kanjiKenteiLevel: level
      })
      expect(result.success).toBe(true)
    })

    it('accepts null kanjiKenteiLevel', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        kanjiKenteiLevel: null
      })
      expect(result.success).toBe(true)
    })
  })

  describe('radicalId', () => {
    it('accepts valid radicalId', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        radicalId: 42
      })
      expect(result.success).toBe(true)
    })

    it('accepts null radicalId', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        radicalId: null
      })
      expect(result.success).toBe(true)
    })
  })

  describe('classifications', () => {
    it('accepts empty classifications array', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        classifications: []
      })
      expect(result.success).toBe(true)
    })

    it('accepts array with valid classifications', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        classifications: [
          { id: 1, classificationTypeId: 10, displayOrder: 0 },
          { id: undefined, classificationTypeId: 20, displayOrder: 1 }
        ]
      })
      expect(result.success).toBe(true)
    })
  })

  describe('newRadicalCharacter', () => {
    it('accepts optional newRadicalCharacter', () => {
      const result = kanjiBasicInfoSchema.safeParse({
        ...validData,
        newRadicalCharacter: '氵'
      })
      expect(result.success).toBe(true)
    })

    it('works without newRadicalCharacter', () => {
      const result = kanjiBasicInfoSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })
  })
})
