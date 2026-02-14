/**
 * Tests for Kanji Create Schema
 */

import { describe, expect, it } from 'vitest'

import { kanjiCreateSchema } from './kanji-create-schema'

describe('kanjiCreateSchema', () => {
  it('accepts valid kanji character', () => {
    const result = kanjiCreateSchema.safeParse({ character: '水' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.character).toBe('水')
    }
  })

  it('rejects empty character', () => {
    const result = kanjiCreateSchema.safeParse({ character: '' })
    expect(result.success).toBe(false)
  })

  it('rejects multiple characters', () => {
    const result = kanjiCreateSchema.safeParse({ character: '水火' })
    expect(result.success).toBe(false)
  })

  it('rejects missing character field', () => {
    const result = kanjiCreateSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})
