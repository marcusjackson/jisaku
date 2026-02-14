/**
 * Tests for KanjiDetailComponentsDisplay component
 */

import { renderWithProviders as render } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailComponentsDisplay from './KanjiDetailComponentsDisplay.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'

describe('KanjiDetailComponentsDisplay', () => {
  const mockOccurrences: ComponentOccurrenceWithDetails[] = [
    {
      id: 1,
      componentId: 10,
      kanjiId: 1,
      positionTypeId: null,
      componentFormId: null,
      isRadical: false,
      analysisNotes: null,
      displayOrder: 1,
      component: {
        id: 10,
        character: 'δΊΊ',
        shortMeaning: 'person'
      },
      position: null,
      form: null,
      createdAt: '',
      updatedAt: ''
    },
    {
      id: 2,
      componentId: 11,
      kanjiId: 1,
      positionTypeId: null,
      componentFormId: null,
      isRadical: true,
      analysisNotes: null,
      displayOrder: 2,
      component: {
        id: 11,
        character: 'ζœ¨',
        shortMeaning: 'tree, wood'
      },
      position: null,
      form: null,
      createdAt: '',
      updatedAt: ''
    }
  ]

  it('renders empty state when no occurrences', () => {
    render(KanjiDetailComponentsDisplay, {
      props: { occurrences: [] }
    })

    expect(
      screen.getByText('No components have been linked to this kanji yet.')
    ).toBeInTheDocument()
  })

  it('renders component grid when occurrences exist', () => {
    render(KanjiDetailComponentsDisplay, {
      props: { occurrences: mockOccurrences }
    })

    expect(screen.getByText('δΊΊ')).toBeInTheDocument()
    expect(screen.getByText('ζœ¨')).toBeInTheDocument()
  })

  it('renders correct number of component items', () => {
    const { container } = render(KanjiDetailComponentsDisplay, {
      props: { occurrences: mockOccurrences }
    })

    const grid = container.querySelector(
      '.kanji-detail-components-display-grid'
    )
    expect(grid?.children).toHaveLength(2)
  })

  it('does not show empty state when occurrences list is not empty', () => {
    render(KanjiDetailComponentsDisplay, {
      props: { occurrences: mockOccurrences }
    })

    expect(
      screen.queryByText('No components have been linked to this kanji yet.')
    ).not.toBeInTheDocument()
  })

  it('does not show grid when occurrences is empty', () => {
    const { container } = render(KanjiDetailComponentsDisplay, {
      props: { occurrences: [] }
    })

    expect(
      container.querySelector('.kanji-detail-components-display-grid')
    ).not.toBeInTheDocument()
  })

  it('renders all component characters correctly', () => {
    render(KanjiDetailComponentsDisplay, {
      props: { occurrences: mockOccurrences }
    })

    expect(screen.getByText('δΊΊ')).toBeInTheDocument()
    expect(screen.getByText('ζœ¨')).toBeInTheDocument()
    expect(screen.getByText('person')).toBeInTheDocument()
    expect(screen.getByText('tree, wood')).toBeInTheDocument()
  })

  it('renders with single occurrence', () => {
    render(KanjiDetailComponentsDisplay, {
      props: { occurrences: [mockOccurrences[0]] }
    })

    expect(screen.getByText('δΊΊ')).toBeInTheDocument()
    expect(screen.queryByText('ζœ¨')).not.toBeInTheDocument()
  })
})
