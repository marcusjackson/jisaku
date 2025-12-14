import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListSectionFilters from './KanjiListSectionFilters.vue'

import type { Component, KanjiFilters } from '@/shared/types/database-types'

const mockComponents: Component[] = [
  {
    id: 1,
    character: '氵',
    strokeCount: 3,
    shortMeaning: null,
    sourceKanjiId: null,
    description: 'Water',
    searchKeywords: 'さんずい',
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

const mockRadicals: Component[] = []

const defaultProps = {
  filters: {} as KanjiFilters,
  characterSearch: '',
  hasActiveFilters: false,
  components: mockComponents,
  radicals: mockRadicals
}

describe('KanjiListSectionFilters', () => {
  it('renders filter section with label', () => {
    render(KanjiListSectionFilters, { props: defaultProps })

    expect(
      screen.getByRole('region', { name: 'Filter kanji' })
    ).toBeInTheDocument()
  })

  it('renders character filter', () => {
    render(KanjiListSectionFilters, { props: defaultProps })

    expect(
      screen.getByRole('textbox', { name: 'Character' })
    ).toBeInTheDocument()
  })

  it('renders stroke range filters', () => {
    render(KanjiListSectionFilters, { props: defaultProps })

    expect(
      screen.getByRole('spinbutton', { name: 'Minimum strokes' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('spinbutton', { name: 'Maximum strokes' })
    ).toBeInTheDocument()
  })

  it('renders JLPT level filter', () => {
    render(KanjiListSectionFilters, { props: defaultProps })

    expect(screen.getByText('JLPT Level')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N5' })).toBeInTheDocument()
  })

  it('renders Joyo level filter', () => {
    render(KanjiListSectionFilters, { props: defaultProps })

    expect(screen.getByText('Joyo Level')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: '小1 (Grade 1)' })
    ).toBeInTheDocument()
  })

  it('renders component filter', () => {
    render(KanjiListSectionFilters, { props: defaultProps })

    expect(screen.getByText('Component')).toBeInTheDocument()
  })

  it('does not show clear button when no filters active', () => {
    render(KanjiListSectionFilters, { props: defaultProps })

    expect(
      screen.queryByRole('button', { name: 'Clear filters' })
    ).not.toBeInTheDocument()
  })

  it('shows clear button when filters are active', () => {
    render(KanjiListSectionFilters, {
      props: { ...defaultProps, hasActiveFilters: true }
    })

    expect(
      screen.getByRole('button', { name: 'Clear filters' })
    ).toBeInTheDocument()
  })

  it('emits clearFilters when clear button clicked', async () => {
    const user = userEvent.setup()
    const result = render(KanjiListSectionFilters, {
      props: { ...defaultProps, hasActiveFilters: true }
    })

    await user.click(screen.getByRole('button', { name: 'Clear filters' }))

    expect(result.emitted()['clearFilters']).toBeTruthy()
  })

  it('emits update:characterSearch when character input changes', async () => {
    const user = userEvent.setup()
    const result = render(KanjiListSectionFilters, { props: defaultProps })

    await user.type(screen.getByRole('textbox', { name: 'Character' }), '漢')

    expect(result.emitted()['update:characterSearch']).toBeTruthy()
  })

  it('emits updateFilter when JLPT chip clicked', async () => {
    const user = userEvent.setup()
    const result = render(KanjiListSectionFilters, { props: defaultProps })

    await user.click(screen.getByRole('button', { name: 'N3' }))

    expect(result.emitted()['updateFilter']).toBeTruthy()
    expect(result.emitted()['updateFilter']?.[0]).toEqual([
      'jlptLevels',
      ['N3']
    ])
  })
})
