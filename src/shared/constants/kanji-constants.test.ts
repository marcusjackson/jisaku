import { describe, expect, it } from 'vitest'

import {
  JLPT_LEVELS,
  JLPT_OPTIONS,
  JOYO_LEVELS,
  JOYO_OPTIONS
} from './kanji-constants'

describe('kanji-constants', () => {
  describe('JLPT_OPTIONS', () => {
    it('contains all 6 JLPT levels including Non-JLPT', () => {
      expect(JLPT_OPTIONS).toHaveLength(6)
    })

    it('has correct values in order from N5 to N1 plus Non-JLPT', () => {
      const values = JLPT_OPTIONS.map((opt) => opt.value)
      expect(values).toEqual(['N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt'])
    })

    it('has labels with level information', () => {
      const first = JLPT_OPTIONS[0]
      const last = JLPT_OPTIONS[4]
      const nonJlpt = JLPT_OPTIONS[5]
      expect(first?.label).toBe('N5')
      expect(last?.label).toBe('N1')
      expect(nonJlpt?.label).toBe('非JLPT')
    })
  })

  describe('JLPT_LEVELS', () => {
    it('contains all 6 JLPT level values including Non-JLPT', () => {
      expect(JLPT_LEVELS).toEqual(['N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt'])
    })
  })

  describe('JOYO_OPTIONS', () => {
    it('contains all 8 Joyo levels including Non-Joyo', () => {
      expect(JOYO_OPTIONS).toHaveLength(8)
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

    it('has secondary and non-joyo as the last options', () => {
      const secondary = JOYO_OPTIONS[6]
      const nonJoyo = JOYO_OPTIONS[7]
      expect(secondary?.value).toBe('secondary')
      expect(secondary?.label).toBe('中学')
      expect(nonJoyo?.value).toBe('non-joyo')
      expect(nonJoyo?.label).toBe('非常用')
    })

    it('has Japanese grade labels', () => {
      const first = JOYO_OPTIONS[0]
      const secondary = JOYO_OPTIONS[6]
      expect(first?.label).toBe('小1')
      expect(secondary?.label).toBe('中学')
    })
  })

  describe('JOYO_LEVELS', () => {
    it('contains all 8 Joyo level values including Non-Joyo', () => {
      expect(JOYO_LEVELS).toHaveLength(8)
      expect(JOYO_LEVELS).toContain('elementary1')
      expect(JOYO_LEVELS).toContain('secondary')
      expect(JOYO_LEVELS).toContain('non-joyo')
    })
  })
})
