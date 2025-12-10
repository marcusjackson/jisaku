/**
 * Component Occurrence Edit Schema Tests
 */

import { describe, expect, it } from 'vitest'

import { componentOccurrenceEditSchema } from './component-occurrence-edit-schema'

describe('componentOccurrenceEditSchema', () => {
  it('accepts valid data with all fields', () => {
    const result = componentOccurrenceEditSchema.safeParse({
      positionTypeId: 1,
      isRadical: true,
      analysisNotes: 'Provides meaning'
    })
    expect(result.success).toBe(true)
  })

  it('accepts null position type', () => {
    const result = componentOccurrenceEditSchema.safeParse({
      positionTypeId: null,
      isRadical: false,
      analysisNotes: ''
    })
    expect(result.success).toBe(true)
  })

  it('accepts minimal data with defaults', () => {
    const result = componentOccurrenceEditSchema.safeParse({
      positionTypeId: null,
      isRadical: false
    })
    expect(result.success).toBe(true)
  })

  it('accepts empty analysis notes', () => {
    const result = componentOccurrenceEditSchema.safeParse({
      positionTypeId: 1,
      isRadical: true,
      analysisNotes: ''
    })
    expect(result.success).toBe(true)
  })

  it('accepts undefined analysis notes', () => {
    const result = componentOccurrenceEditSchema.safeParse({
      positionTypeId: 1,
      isRadical: false
    })
    expect(result.success).toBe(true)
  })

  it('requires isRadical to be boolean', () => {
    const result = componentOccurrenceEditSchema.safeParse({
      positionTypeId: 1,
      isRadical: 'true' as unknown as boolean
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid position type', () => {
    const result = componentOccurrenceEditSchema.safeParse({
      positionTypeId: 'invalid' as unknown as number,
      isRadical: false
    })
    expect(result.success).toBe(false)
  })
})
