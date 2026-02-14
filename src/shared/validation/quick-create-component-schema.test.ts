/**
 * Tests for quick-create-component-schema
 */

import { describe, expect, it } from 'vitest'

import {
  type QuickCreateComponentData,
  quickCreateComponentSchema
} from './quick-create-component-schema'

describe('quick-create-component-schema', () => {
  it('validates valid component data', () => {
    const validData = {
      character: '日',
      shortMeaning: 'sun'
    }

    const result = quickCreateComponentSchema.safeParse(validData)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.character).toBe('日')
      expect(result.data.shortMeaning).toBe('sun')
    }
  })

  it('validates component with only character', () => {
    const validData = {
      character: '月'
    }

    const result = quickCreateComponentSchema.safeParse(validData)

    expect(result.success).toBe(true)
  })

  it('rejects empty character', () => {
    const invalidData = {
      character: '',
      shortMeaning: 'test'
    }

    const result = quickCreateComponentSchema.safeParse(invalidData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('Character is required')
    }
  })

  it('rejects multi-character string', () => {
    const invalidData = {
      character: '日月',
      shortMeaning: 'test'
    }

    const result = quickCreateComponentSchema.safeParse(invalidData)

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain('single character')
    }
  })

  it('rejects missing character field', () => {
    const invalidData = {
      shortMeaning: 'test'
    }

    const result = quickCreateComponentSchema.safeParse(invalidData)

    expect(result.success).toBe(false)
  })

  it('exports QuickCreateComponentData type correctly', () => {
    const data: QuickCreateComponentData = {
      character: '山',
      shortMeaning: 'mountain'
    }

    expect(data.character).toBe('山')
    expect(data.shortMeaning).toBe('mountain')
  })
})
