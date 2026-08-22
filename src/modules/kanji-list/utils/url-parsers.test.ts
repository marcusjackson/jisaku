/**
 * URL Parsers Tests
 *
 * Tests for URL query parameter parsing functions.
 */

import { describe, expect, it } from 'vitest'

import {
  parseAnalysisFilters,
  parseJlptLevels,
  parseJoyoLevels,
  parseKenteiLevels,
  parseNumber,
  parseNumberArray,
  parseString,
  parseStrokeOrderFilter
} from './url-parsers'

describe('url-parsers', () => {
  describe('parseString', () => {
    it('returns string value when valid', () => {
      expect(parseString('hello')).toBe('hello')
    })

    it('returns undefined for empty string', () => {
      expect(parseString('')).toBeUndefined()
    })

    it('returns undefined for non-string values', () => {
      expect(parseString(123)).toBeUndefined()
      expect(parseString(null)).toBeUndefined()
      expect(parseString(undefined)).toBeUndefined()
    })
  })

  describe('parseNumber', () => {
    it('parses valid number string', () => {
      expect(parseNumber('42')).toBe(42)
      expect(parseNumber('0')).toBe(0)
      expect(parseNumber('-5')).toBe(-5)
    })

    it('returns undefined for non-numeric strings', () => {
      expect(parseNumber('abc')).toBeUndefined()
      expect(parseNumber('')).toBeUndefined()
    })

    it('returns undefined for non-string values', () => {
      expect(parseNumber(42)).toBeUndefined()
      expect(parseNumber(null)).toBeUndefined()
    })
  })

  describe('parseNumberArray', () => {
    it('parses comma-separated numbers', () => {
      expect(parseNumberArray('1,2,3')).toEqual([1, 2, 3])
    })

    it('filters out invalid numbers', () => {
      expect(parseNumberArray('1,abc,3')).toEqual([1, 3])
    })

    it('returns undefined for empty string', () => {
      expect(parseNumberArray('')).toBeUndefined()
    })

    it('returns undefined when all values are invalid', () => {
      expect(parseNumberArray('abc,def')).toBeUndefined()
    })
  })

  describe('parseJlptLevels', () => {
    it('parses valid JLPT levels', () => {
      expect(parseJlptLevels('N5,N4,N3')).toEqual(['N5', 'N4', 'N3'])
    })

    it('filters out invalid levels', () => {
      expect(parseJlptLevels('N5,N6,N4')).toEqual(['N5', 'N4'])
    })

    it('returns undefined for empty string', () => {
      expect(parseJlptLevels('')).toBeUndefined()
    })

    it('returns undefined for non-string values', () => {
      expect(parseJlptLevels(123)).toBeUndefined()
    })
  })

  describe('parseJoyoLevels', () => {
    it('parses valid Joyo levels', () => {
      expect(parseJoyoLevels('elementary1,elementary2')).toEqual([
        'elementary1',
        'elementary2'
      ])
    })

    it('filters out invalid levels', () => {
      expect(parseJoyoLevels('elementary1,invalid,secondary')).toEqual([
        'elementary1',
        'secondary'
      ])
    })

    it('returns undefined for empty string', () => {
      expect(parseJoyoLevels('')).toBeUndefined()
    })
  })

  describe('parseKenteiLevels', () => {
    it('parses valid Kentei levels', () => {
      expect(parseKenteiLevels('10,9,8')).toEqual(['10', '9', '8'])
    })

    it('handles pre levels', () => {
      expect(parseKenteiLevels('pre2,2,pre1,1')).toEqual([
        'pre2',
        '2',
        'pre1',
        '1'
      ])
    })

    it('returns undefined for empty string', () => {
      expect(parseKenteiLevels('')).toBeUndefined()
    })
  })

  describe('parseStrokeOrderFilter', () => {
    it('returns "has" for "has" value', () => {
      expect(parseStrokeOrderFilter('has')).toBe('has')
    })

    it('returns "missing" for "missing" value', () => {
      expect(parseStrokeOrderFilter('missing')).toBe('missing')
    })

    it('returns null for invalid values', () => {
      expect(parseStrokeOrderFilter('invalid')).toBeNull()
      expect(parseStrokeOrderFilter('')).toBeNull()
      expect(parseStrokeOrderFilter(null)).toBeNull()
    })
  })

  describe('parseAnalysisFilters', () => {
    it('parses valid analysis filter pairs', () => {
      const result = parseAnalysisFilters('notesEtymology:short')
      expect(result).toEqual([{ field: 'notesEtymology', threshold: 'short' }])
    })

    it('parses multiple filters', () => {
      const result = parseAnalysisFilters(
        'notesEtymology:short,notesSemantic:medium'
      )
      expect(result).toEqual([
        { field: 'notesEtymology', threshold: 'short' },
        { field: 'notesSemantic', threshold: 'medium' }
      ])
    })

    it('filters out invalid pairs', () => {
      const result = parseAnalysisFilters('notesEtymology:short,invalid:value')
      expect(result).toEqual([{ field: 'notesEtymology', threshold: 'short' }])
    })

    it('returns undefined for empty string', () => {
      expect(parseAnalysisFilters('')).toBeUndefined()
    })

    it('returns undefined when all pairs are invalid', () => {
      expect(parseAnalysisFilters('invalid:value')).toBeUndefined()
    })
  })
})
