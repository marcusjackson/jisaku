/**
 * ComponentListCard Tests
 *
 * Tests for component card display component.
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListCard from './ComponentListCard.vue'

import type { Component } from '@/api/component'

const mockComponent: Component = {
  id: 1,
  character: '亻',
  shortMeaning: 'person',
  searchKeywords: 'human, man',
  strokeCount: 2,
  sourceKanjiId: null,
  description: 'A component representing a person',
  canBeRadical: true,
  kangxiNumber: 9,
  kangxiMeaning: 'person',
  radicalNameJapanese: 'にんべん',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

describe('ComponentListCard', () => {
  it('renders component character', () => {
    renderWithProviders(ComponentListCard, {
      props: { component: mockComponent }
    })

    expect(screen.getByText('亻')).toBeInTheDocument()
  })

  it('renders short meaning', () => {
    renderWithProviders(ComponentListCard, {
      props: { component: mockComponent }
    })

    expect(screen.getByText('person')).toBeInTheDocument()
  })

  it('renders stroke count badge', () => {
    renderWithProviders(ComponentListCard, {
      props: { component: mockComponent }
    })

    expect(screen.getByText('2画')).toBeInTheDocument()
  })

  it('renders radical badge when canBeRadical is true', () => {
    renderWithProviders(ComponentListCard, {
      props: { component: mockComponent }
    })

    expect(screen.getByText('部首')).toBeInTheDocument()
  })

  it('does not render radical badge when canBeRadical is false', () => {
    const nonRadicalComponent: Component = {
      ...mockComponent,
      canBeRadical: false
    }

    renderWithProviders(ComponentListCard, {
      props: { component: nonRadicalComponent }
    })

    expect(screen.queryByText('部首')).not.toBeInTheDocument()
  })

  it('links to component detail page', () => {
    renderWithProviders(ComponentListCard, {
      props: { component: mockComponent }
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/components/1')
  })

  it('does not render missing optional fields', () => {
    const componentWithoutOptional: Component = {
      ...mockComponent,
      shortMeaning: null,
      strokeCount: null,
      canBeRadical: false
    }

    renderWithProviders(ComponentListCard, {
      props: { component: componentWithoutOptional }
    })

    expect(screen.getByText('亻')).toBeInTheDocument()
    expect(screen.queryByText('部首')).not.toBeInTheDocument()
    // Stroke badge should not appear
    expect(screen.queryByText(/画/)).not.toBeInTheDocument()
  })
})
