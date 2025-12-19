/**
 * Tests for VocabularySectionFilters component
 */

import userEvent from '@testing-library/user-event'
import { cleanup, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import VocabularySectionFilters from './VocabularySectionFilters.vue'

import type { Kanji, VocabularyFilters } from '@/shared/types/database-types'

const mockKanji: Kanji[] = [
  {
    id: 1,
    character: '日',
    strokeCount: 4,
    shortMeaning: 'day',
    searchKeywords: null,
    radicalId: null,
    jlptLevel: null,
    joyoLevel: null,
    kenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '本',
    strokeCount: 5,
    shortMeaning: 'book',
    searchKeywords: null,
    radicalId: null,
    jlptLevel: null,
    joyoLevel: null,
    kenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const defaultFilters: VocabularyFilters = {}

describe('VocabularySectionFilters', () => {
  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('renders filters section', () => {
    render(VocabularySectionFilters, {
      props: {
        filters: defaultFilters,
        searchText: '',
        hasActiveFilters: false,
        allKanji: mockKanji
      }
    })

    expect(screen.getByLabelText('Filter vocabulary')).toBeInTheDocument()
  })

  it('displays filter header with toggle', () => {
    render(VocabularySectionFilters, {
      props: {
        filters: defaultFilters,
        searchText: '',
        hasActiveFilters: false,
        allKanji: mockKanji
      }
    })

    expect(screen.getByRole('button', { name: /Filters/i })).toBeInTheDocument()
  })

  it('shows active filter count badge when filters are active', () => {
    render(VocabularySectionFilters, {
      props: {
        filters: { jlptLevels: ['N5'] },
        searchText: '',
        hasActiveFilters: true,
        allKanji: mockKanji
      }
    })

    // Badge should show count
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('emits update:searchText when search input changes', async () => {
    const updateHandler = vi.fn()
    render(VocabularySectionFilters, {
      props: {
        filters: defaultFilters,
        searchText: '',
        hasActiveFilters: false,
        allKanji: mockKanji
      },
      attrs: {
        'onUpdate:searchText': updateHandler
      }
    })

    const searchInput = screen.getByLabelText('Search')
    await userEvent.type(searchInput, 'test')

    expect(updateHandler).toHaveBeenCalled()
  })

  it('displays JLPT level filter options', () => {
    render(VocabularySectionFilters, {
      props: {
        filters: defaultFilters,
        searchText: '',
        hasActiveFilters: false,
        allKanji: mockKanji
      }
    })

    // JLPT levels should be visible
    expect(screen.getByText('JLPT Level')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N1' })).toBeInTheDocument()
  })

  it('emits clearFilters when clear button is clicked', async () => {
    const clearHandler = vi.fn()
    render(VocabularySectionFilters, {
      props: {
        filters: { jlptLevels: ['N5'] },
        searchText: 'test',
        hasActiveFilters: true,
        allKanji: mockKanji
      },
      attrs: {
        onClearFilters: clearHandler
      }
    })

    const clearButton = screen.getByRole('button', { name: /Clear filters/i })
    await userEvent.click(clearButton)

    expect(clearHandler).toHaveBeenCalled()
  })

  it('does not show clear button when no active filters', () => {
    render(VocabularySectionFilters, {
      props: {
        filters: defaultFilters,
        searchText: '',
        hasActiveFilters: false,
        allKanji: mockKanji
      }
    })

    // Clear button should not be present when no filters active
    expect(
      screen.queryByRole('button', { name: /Clear filters/i })
    ).not.toBeInTheDocument()
  })
})
