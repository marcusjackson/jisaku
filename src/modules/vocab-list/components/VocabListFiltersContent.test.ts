/**
 * VocabListFiltersContent Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VocabListFiltersContent from './VocabListFiltersContent.vue'

import type { VocabListFilters } from '../vocab-list-types'
import type { Kanji } from '@/api/kanji'

const mockFilters: VocabListFilters = {}
const mockKanjiList: Kanji[] = []

// Mock emit handlers
const defaultProps = {
  filters: mockFilters,
  wordSearch: '',
  searchText: '',
  kanaSearch: '',
  allKanji: mockKanjiList,
  'onUpdate:wordSearch': vi.fn(),
  'onUpdate:searchText': vi.fn(),
  'onUpdate:kanaSearch': vi.fn(),
  onUpdateFilter: vi.fn()
}

describe('VocabListFiltersContent', () => {
  it('renders search filter', () => {
    render(VocabListFiltersContent, { props: defaultProps })
    expect(
      screen.getByRole('textbox', { name: /display.*keywords/i })
    ).toBeInTheDocument()
  })

  it('renders kana filter', () => {
    render(VocabListFiltersContent, { props: defaultProps })
    expect(screen.getByRole('textbox', { name: /kana/i })).toBeInTheDocument()
  })

  it('renders JLPT level filter', () => {
    render(VocabListFiltersContent, { props: defaultProps })
    expect(screen.getByRole('button', { name: 'N5' })).toBeInTheDocument()
  })
})
