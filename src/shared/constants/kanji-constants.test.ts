import { describe, expect, it } from 'vitest'

import {
  JLPT_LEVELS,
  JLPT_OPTIONS,
  JOYO_LEVELS,
  JOYO_OPTIONS
} from './kanji-constants'

describe('kanji-constants', () => {
  describe('JLPT_OPTIONS', () => {
    it('contains all 5 JLPT levels', () => {
      expect(JLPT_OPTIONS).toHaveLength(5)
    })

    it('has correct values in order from N5 to N1', () => {
      const values = JLPT_OPTIONS.map((opt) => opt.value)
      expect(values).toEqual(['N5', 'N4', 'N3', 'N2', 'N1'])
    })

    it('has labels with level information', () => {
      const first = JLPT_OPTIONS[0]
      const last = JLPT_OPTIONS[4]
      expect(first?.label).toContain('N5')
      expect(first?.label).toContain('Beginner')
      expect(last?.label).toContain('N1')
      expect(last?.label).toContain('Advanced')
    })
  })

  describe('JLPT_LEVELS', () => {
    it('contains all 5 JLPT level values', () => {
      expect(JLPT_LEVELS).toEqual(['N5', 'N4', 'N3', 'N2', 'N1'])
    })
  })

  describe('JOYO_OPTIONS', () => {
    it('contains all 7 Joyo levels', () => {
      expect(JOYO_OPTIONS).toHaveLength(7)
    })

    it('has correct values for elementary grades', () => {
      const elementaryValues = JOYO_OPTIONS.slice(0, 6).map((opt) => opt.value)
      expect(elementaryValues).toEqual([
        'elementary1',
        'elementary2',
        'elementary3',
        'elementary4',
        'elementary5',
        'elementary6'
      ])
    })

    it('has secondary as the last option', () => {
      const last = JOYO_OPTIONS[6]
      expect(last?.value).toBe('secondary')
      expect(last?.label).toContain('Secondary')
    })

    it('has Japanese grade labels', () => {
      const first = JOYO_OPTIONS[0]
      const last = JOYO_OPTIONS[6]
      expect(first?.label).toContain('小1')
      expect(last?.label).toContain('中学')
    })
  })

  describe('JOYO_LEVELS', () => {
    it('contains all 7 Joyo level values', () => {
      expect(JOYO_LEVELS).toHaveLength(7)
      expect(JOYO_LEVELS).toContain('elementary1')
      expect(JOYO_LEVELS).toContain('secondary')
    })
  })
})
