/**
 * Tests for grouping validation schema
 */

import { describe, expect, it } from 'vitest'

import { groupingSchema } from './grouping-schema'

describe('groupingSchema', () => {
  it('validates a valid grouping with name only', () => {
    const result = groupingSchema.safeParse({ name: 'Left side' })
    expect(result.success).toBe(true)
  })

  it('validates a valid grouping with name and description', () => {
    const result = groupingSchema.safeParse({
      name: 'Left side',
      description: 'Appears on the left'
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty name', () => {
    const result = groupingSchema.safeParse({ name: '' })
    expect(result.success).toBe(false)
  })

  it('transforms empty description to null', () => {
    const result = groupingSchema.safeParse({
      name: 'Test',
      description: ''
    })
    expect(result.success).toBe(true)
    if (!result.success) throw new Error('Expected parse to succeed')
    expect(result.data.description).toBeNull()
  })

  it('allows null description', () => {
    const result = groupingSchema.safeParse({
      name: 'Test',
      description: null
    })
    expect(result.success).toBe(true)
    if (!result.success) throw new Error('Expected parse to succeed')
    expect(result.data.description).toBeNull()
  })
})
