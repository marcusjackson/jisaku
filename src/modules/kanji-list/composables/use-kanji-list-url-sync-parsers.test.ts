/**
 * URL Sync Parsers Tests
 *
 * Tests for URL query parameter parsing helper functions.
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import {
  parseAnalysisFiltersFromQuery,
  parseLevelFiltersFromQuery,
  parseNumericFiltersFromQuery,
  parseRelationalFiltersFromQuery,
  parseStrokeFiltersFromQuery,
  parseTextFiltersFromRefs
} from './use-kanji-list-url-sync-parsers'

describe('use-kanji-list-url-sync-parsers', () => {
  describe('parseTextFiltersFromRefs', () => {
    it('returns empty object when all refs are empty', () => {
      const result = parseTextFiltersFromRefs(
        ref(''),
        ref(''),
        ref(''),
        ref(''),
        ref('')
      )
      expect(result).toEqual({})
    })

    it('includes character filter when set', () => {
      const result = parseTextFiltersFromRefs(
        ref('山'),
        ref(''),
        ref(''),
        ref(''),
        ref('')
      )
      expect(result).toEqual({ character: '山' })
    })

    it('includes keywords filter when set', () => {
      const result = parseTextFiltersFromRefs(
        ref(''),
        ref('mountain'),
        ref(''),
        ref(''),
        ref('')
      )
      expect(result).toEqual({ searchKeywords: 'mountain' })
    })

    it('includes onYomi filter when set', () => {
      const result = parseTextFiltersFromRefs(
        ref(''),
        ref(''),
        ref(''),
        ref('サン'),
        ref('')
      )
      expect(result).toEqual({ onYomi: 'サン' })
    })

    it('includes kunYomi filter when set', () => {
      const result = parseTextFiltersFromRefs(
        ref(''),
        ref(''),
        ref(''),
        ref(''),
        ref('やま')
      )
      expect(result).toEqual({ kunYomi: 'やま' })
    })

    it('combines multiple filters', () => {
      const result = parseTextFiltersFromRefs(
        ref('山'),
        ref('mountain'),
        ref(''),
        ref('サン'),
        ref('やま')
      )
      expect(result).toEqual({
        character: '山',
        searchKeywords: 'mountain',
        onYomi: 'サン',
        kunYomi: 'やま'
      })
    })
  })

  describe('parseNumericFiltersFromQuery', () => {
    it('returns empty object for empty query', () => {
      const result = parseNumericFiltersFromQuery({})
      expect(result).toEqual({})
    })

    it('parses strokeMin', () => {
      const result = parseNumericFiltersFromQuery({ strokeMin: '5' })
      expect(result).toEqual({ strokeCountMin: 5 })
    })

    it('parses strokeMax', () => {
      const result = parseNumericFiltersFromQuery({ strokeMax: '10' })
      expect(result).toEqual({ strokeCountMax: 10 })
    })

    it('parses both stroke bounds', () => {
      const result = parseNumericFiltersFromQuery({
        strokeMin: '5',
        strokeMax: '10'
      })
      expect(result).toEqual({ strokeCountMin: 5, strokeCountMax: 10 })
    })

    it('ignores invalid values', () => {
      const result = parseNumericFiltersFromQuery({ strokeMin: 'abc' })
      expect(result).toEqual({})
    })
  })

  describe('parseLevelFiltersFromQuery', () => {
    it('returns empty object for empty query', () => {
      const result = parseLevelFiltersFromQuery({})
      expect(result).toEqual({})
    })

    it('parses JLPT levels', () => {
      const result = parseLevelFiltersFromQuery({ jlpt: 'N5,N4' })
      expect(result).toEqual({ jlptLevels: ['N5', 'N4'] })
    })

    it('parses Joyo levels', () => {
      const result = parseLevelFiltersFromQuery({
        joyo: 'elementary1,elementary2'
      })
      expect(result).toEqual({ joyoLevels: ['elementary1', 'elementary2'] })
    })

    it('parses Kentei levels', () => {
      const result = parseLevelFiltersFromQuery({ kentei: '10,9,8' })
      expect(result).toEqual({ kenteiLevels: ['10', '9', '8'] })
    })

    it('combines multiple level filters', () => {
      const result = parseLevelFiltersFromQuery({
        jlpt: 'N5',
        joyo: 'elementary1',
        kentei: '10'
      })
      expect(result).toEqual({
        jlptLevels: ['N5'],
        joyoLevels: ['elementary1'],
        kenteiLevels: ['10']
      })
    })
  })

  describe('parseRelationalFiltersFromQuery', () => {
    it('returns empty object for empty query', () => {
      const result = parseRelationalFiltersFromQuery({})
      expect(result).toEqual({})
    })

    it('parses radical ID', () => {
      const result = parseRelationalFiltersFromQuery({ radical: '42' })
      expect(result).toEqual({ radicalId: 42 })
    })

    it('parses component IDs', () => {
      const result = parseRelationalFiltersFromQuery({ components: '1,2,3' })
      expect(result).toEqual({ componentIds: [1, 2, 3] })
    })

    it('parses classification type IDs', () => {
      const result = parseRelationalFiltersFromQuery({
        classifications: '5,6'
      })
      expect(result).toEqual({ classificationTypeIds: [5, 6] })
    })
  })

  describe('parseStrokeFiltersFromQuery', () => {
    it('returns empty object for empty query', () => {
      const result = parseStrokeFiltersFromQuery({})
      expect(result).toEqual({})
    })

    it('parses stroke order diagram filter', () => {
      const result = parseStrokeFiltersFromQuery({ diagram: 'has' })
      expect(result).toEqual({ strokeOrderDiagram: 'has' })
    })

    it('parses stroke order animation filter', () => {
      const result = parseStrokeFiltersFromQuery({ animation: 'missing' })
      expect(result).toEqual({ strokeOrderAnimation: 'missing' })
    })

    it('combines diagram and animation filters', () => {
      const result = parseStrokeFiltersFromQuery({
        diagram: 'has',
        animation: 'missing'
      })
      expect(result).toEqual({
        strokeOrderDiagram: 'has',
        strokeOrderAnimation: 'missing'
      })
    })
  })

  describe('parseAnalysisFiltersFromQuery', () => {
    it('returns empty object for empty query', () => {
      const result = parseAnalysisFiltersFromQuery({})
      expect(result).toEqual({})
    })

    it('parses analysis filters', () => {
      const result = parseAnalysisFiltersFromQuery({
        analysis: 'notesEtymology:short'
      })
      expect(result).toEqual({
        analysisFilters: [{ field: 'notesEtymology', threshold: 'short' }]
      })
    })

    it('parses multiple analysis filters', () => {
      const result = parseAnalysisFiltersFromQuery({
        analysis: 'notesEtymology:short,notesSemantic:medium'
      })
      expect(result).toEqual({
        analysisFilters: [
          { field: 'notesEtymology', threshold: 'short' },
          { field: 'notesSemantic', threshold: 'medium' }
        ]
      })
    })
  })
})
