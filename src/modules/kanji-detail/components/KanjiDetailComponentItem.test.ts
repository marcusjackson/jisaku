/**
 * Tests for KanjiDetailComponentItem component
 */

import { renderWithProviders as render } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailComponentItem from './KanjiDetailComponentItem.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'

describe('KanjiDetailComponentItem', () => {
  const mockOccurrence: ComponentOccurrenceWithDetails = {
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
  }

  it('renders component character', () => {
    render(KanjiDetailComponentItem, {
      props: { occurrence: mockOccurrence }
    })

    expect(screen.getByText('δΊΊ')).toBeInTheDocument()
  })

  it('renders component short meaning', () => {
    render(KanjiDetailComponentItem, {
      props: { occurrence: mockOccurrence }
    })

    expect(screen.getByText('person')).toBeInTheDocument()
  })

  it('does not render short meaning when null', () => {
    const occurrenceWithoutMeaning: ComponentOccurrenceWithDetails = {
      ...mockOccurrence,
      component: {
        ...mockOccurrence.component,
        shortMeaning: null
      }
    }

    render(KanjiDetailComponentItem, {
      props: { occurrence: occurrenceWithoutMeaning }
    })

    expect(screen.queryByText('person')).not.toBeInTheDocument()
  })

  it('renders as a link to component detail page', () => {
    render(KanjiDetailComponentItem, {
      props: { occurrence: mockOccurrence }
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/components/10')
  })

  it('does not render position badge when position is null', () => {
    render(KanjiDetailComponentItem, {
      props: { occurrence: mockOccurrence }
    })

    // SharedPositionBadge should not be rendered
    expect(screen.queryByText(/Position/i)).not.toBeInTheDocument()
  })

  it('renders position badge when position exists', () => {
    const occurrenceWithPosition: ComponentOccurrenceWithDetails = {
      ...mockOccurrence,
      positionTypeId: 1,
      position: {
        id: 1,
        positionName: 'Left',
        nameJapanese: 'ε',
        nameEnglish: 'Left',
        description: 'Left side of kanji',
        displayOrder: 1
      }
    }

    render(KanjiDetailComponentItem, {
      props: { occurrence: occurrenceWithPosition }
    })

    expect(screen.getByText('ε')).toBeInTheDocument()
  })

  it('does not render radical badge when isRadical is false', () => {
    render(KanjiDetailComponentItem, {
      props: { occurrence: mockOccurrence }
    })

    expect(screen.queryByText('部首')).not.toBeInTheDocument()
  })

  it('renders radical badge when isRadical is true', () => {
    const radicalOccurrence: ComponentOccurrenceWithDetails = {
      ...mockOccurrence,
      isRadical: true
    }

    render(KanjiDetailComponentItem, {
      props: { occurrence: radicalOccurrence }
    })

    expect(screen.getByText('部首')).toBeInTheDocument()
  })

  it('renders both position and radical badge when both exist', () => {
    const occurrenceWithBoth: ComponentOccurrenceWithDetails = {
      ...mockOccurrence,
      isRadical: true,
      positionTypeId: 1,
      position: {
        id: 1,
        positionName: 'Left',
        nameJapanese: 'ε',
        nameEnglish: 'Left',
        description: 'Left side of kanji',
        displayOrder: 1
      }
    }

    render(KanjiDetailComponentItem, {
      props: { occurrence: occurrenceWithBoth }
    })

    expect(screen.getByText('ε')).toBeInTheDocument()
    expect(screen.getByText('部首')).toBeInTheDocument()
  })

  it('renders with minimum touch target size', () => {
    const { container } = render(KanjiDetailComponentItem, {
      props: { occurrence: mockOccurrence }
    })

    const card = container.querySelector('.kanji-detail-component-item')
    expect(card).toBeInTheDocument()
  })
})
