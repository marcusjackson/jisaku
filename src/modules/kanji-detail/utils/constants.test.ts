import { describe, expect, it } from 'vitest'

import { JLPT_OPTIONS, JOYO_OPTIONS, KENTEI_OPTIONS, NONE } from './constants'

describe('kanji-detail utils/constants', () => {
  it('exports NONE constant', () => {
    expect(NONE).toBe('__none__')
  })

  it('exports JLPT_OPTIONS with correct structure', () => {
    expect(JLPT_OPTIONS).toBeInstanceOf(Array)
    expect(JLPT_OPTIONS.length).toBeGreaterThan(0)
    expect(JLPT_OPTIONS[0]).toHaveProperty('label')
    expect(JLPT_OPTIONS[0]).toHaveProperty('value')
  })

  it('exports JOYO_OPTIONS with correct structure', () => {
    expect(JOYO_OPTIONS).toBeInstanceOf(Array)
    expect(JOYO_OPTIONS.length).toBeGreaterThan(0)
    expect(JOYO_OPTIONS[0]).toHaveProperty('label')
    expect(JOYO_OPTIONS[0]).toHaveProperty('value')
  })

  it('exports KENTEI_OPTIONS with correct structure', () => {
    expect(KENTEI_OPTIONS).toBeInstanceOf(Array)
    expect(KENTEI_OPTIONS.length).toBeGreaterThan(0)
    expect(KENTEI_OPTIONS[0]).toHaveProperty('label')
    expect(KENTEI_OPTIONS[0]).toHaveProperty('value')
  })
})
