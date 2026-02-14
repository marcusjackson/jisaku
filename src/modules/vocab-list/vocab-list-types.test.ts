/**
 * Vocab List Types Tests
 *
 * Tests for exported constants and type definitions.
 */

import { describe, expect, it } from 'vitest'

import {
  DESCRIPTION_FILTER_LABELS,
  FILTER_QUERY_KEYS,
  JLPT_LABELS
} from './vocab-list-types'

describe('vocab-list-types', () => {
  describe('FILTER_QUERY_KEYS', () => {
    it('defines query keys for all filters', () => {
      expect(FILTER_QUERY_KEYS).toBeDefined()
      expect(FILTER_QUERY_KEYS.word).toBe('word')
      expect(FILTER_QUERY_KEYS.search).toBe('search')
      expect(FILTER_QUERY_KEYS.kana).toBe('kana')
      expect(FILTER_QUERY_KEYS.jlptLevels).toBe('jlpt')
      expect(FILTER_QUERY_KEYS.isCommon).toBe('common')
      expect(FILTER_QUERY_KEYS.containsKanjiIds).toBe('kanji')
      expect(FILTER_QUERY_KEYS.descriptionFilled).toBe('description')
    })
  })

  describe('JLPT_LABELS', () => {
    it('defines labels for all JLPT levels', () => {
      expect(JLPT_LABELS.N5).toBe('N5')
      expect(JLPT_LABELS.N4).toBe('N4')
      expect(JLPT_LABELS.N3).toBe('N3')
      expect(JLPT_LABELS.N2).toBe('N2')
      expect(JLPT_LABELS.N1).toBe('N1')
      expect(JLPT_LABELS['non-jlpt']).toBe('非JLPT')
    })
  })

  describe('DESCRIPTION_FILTER_LABELS', () => {
    it('defines labels for description filter options', () => {
      expect(DESCRIPTION_FILTER_LABELS.filled).toBe('Has description')
      expect(DESCRIPTION_FILTER_LABELS.empty).toBe('No description')
    })
  })
})
