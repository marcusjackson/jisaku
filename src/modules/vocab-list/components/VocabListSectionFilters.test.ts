/**
 * VocabListSectionFilters Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VocabListSectionFilters from './VocabListSectionFilters.vue'

import type { VocabListFilters } from '../vocab-list-types'
import type { Kanji } from '@/api/kanji'

const mockFilters: VocabListFilters = {}
const mockKanjiList: Kanji[] = []

const defaultProps = {
  filters: mockFilters,
  wordSearch: '',
  searchText: '',
  kanaSearch: '',
  allKanji: mockKanjiList,
  hasActiveFilters: false,
  activeFilterCount: 0,
  'onUpdate:wordSearch': vi.fn(),
  'onUpdate:searchText': vi.fn(),
  'onUpdate:kanaSearch': vi.fn(),
  onUpdateFilter: vi.fn(),
  onClearFilters: vi.fn()
}

describe('VocabListSectionFilters', () => {
  it('renders filters toggle button', () => {
    render(VocabListSectionFilters, { props: defaultProps })
    expect(screen.getByTestId('vocab-list-filters-toggle')).toBeInTheDocument()
  })

  it('shows filter count badge when active', () => {
    render(VocabListSectionFilters, {
      props: { ...defaultProps, activeFilterCount: 2, hasActiveFilters: true }
    })
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('disables clear button when no filters', () => {
    render(VocabListSectionFilters, { props: defaultProps })
    expect(screen.getByTestId('vocab-list-filters-clear')).toBeDisabled()
  })
})
