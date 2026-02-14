/**
 * Component List Types Tests
 *
 * Tests for exported constants and type definitions.
 */

import { describe, expect, it } from 'vitest'

import {
  FILTER_QUERY_KEYS,
  STORAGE_KEY_FILTERS_COLLAPSED
} from './component-list-types'

describe('component-list-types', () => {
  describe('FILTER_QUERY_KEYS', () => {
    it('defines query keys for all filters', () => {
      expect(FILTER_QUERY_KEYS).toBeDefined()
      expect(FILTER_QUERY_KEYS.character).toBe('character')
      expect(FILTER_QUERY_KEYS.searchKeywords).toBe('keywords')
      expect(FILTER_QUERY_KEYS.kangxiSearch).toBe('kangxi')
      expect(FILTER_QUERY_KEYS.strokeCountMin).toBe('strokeMin')
      expect(FILTER_QUERY_KEYS.strokeCountMax).toBe('strokeMax')
      expect(FILTER_QUERY_KEYS.canBeRadical).toBe('radical')
      expect(FILTER_QUERY_KEYS.descriptionPresence).toBe('description')
      expect(FILTER_QUERY_KEYS.formsPresence).toBe('forms')
      expect(FILTER_QUERY_KEYS.groupingsPresence).toBe('groupings')
    })
  })

  describe('STORAGE_KEY_FILTERS_COLLAPSED', () => {
    it('defines a storage key for collapsed state', () => {
      expect(STORAGE_KEY_FILTERS_COLLAPSED).toBe(
        'component-list-filters-collapsed'
      )
    })
  })
})
