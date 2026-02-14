import { describe, expect, it } from 'vitest'

import {
  defaultOnReadingValues,
  isReadingLevel,
  kanjiDetailOnReadingSchema,
  readingLevels
} from './kanji-detail-on-reading-schema'

describe('kanjiDetailOnReadingSchema', () => {
  it('accepts valid on-reading data', () => {
    const result = kanjiDetailOnReadingSchema.safeParse({
      reading: 'メイ',
      readingLevel: '小'
    })
    expect(result.success).toBe(true)
  })

  it('accepts all valid reading levels', () => {
    for (const level of readingLevels) {
      const result = kanjiDetailOnReadingSchema.safeParse({
        reading: 'メイ',
        readingLevel: level
      })
      expect(result.success).toBe(true)
    }
  })

  it('rejects empty reading', () => {
    const result = kanjiDetailOnReadingSchema.safeParse({
      reading: '',
      readingLevel: '小'
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('Reading is required')
    }
  })

  it('rejects invalid reading level', () => {
    const result = kanjiDetailOnReadingSchema.safeParse({
      reading: 'メイ',
      readingLevel: 'invalid'
    })
    expect(result.success).toBe(false)
  })
})

describe('defaultOnReadingValues', () => {
  it('has correct default values', () => {
    expect(defaultOnReadingValues).toEqual({
      reading: '',
      readingLevel: '小'
    })
  })
})

describe('isReadingLevel', () => {
  it('returns true for valid levels', () => {
    expect(isReadingLevel('小')).toBe(true)
    expect(isReadingLevel('中')).toBe(true)
    expect(isReadingLevel('高')).toBe(true)
    expect(isReadingLevel('外')).toBe(true)
  })

  it('returns false for invalid levels', () => {
    expect(isReadingLevel('invalid')).toBe(false)
    expect(isReadingLevel('')).toBe(false)
  })
})
