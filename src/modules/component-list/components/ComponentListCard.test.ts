/**
 * Tests for ComponentListCard component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListCard from './ComponentListCard.vue'

import type { Component } from '@/shared/types/database-types'

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    id: 1,
    character: '亻',
    strokeCount: 2,
    shortMeaning: null,
    sourceKanjiId: null,
    searchKeywords: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('ComponentListCard', () => {
  it('renders component character prominently', () => {
    const component = createMockComponent({ character: '亻' })

    renderWithProviders(ComponentListCard, {
      props: { component }
    })

    expect(screen.getByText('亻')).toBeInTheDocument()
  })

  it('displays stroke count', () => {
    const component = createMockComponent({ strokeCount: 2 })

    renderWithProviders(ComponentListCard, {
      props: { component }
    })

    expect(screen.getByText(/2画/i)).toBeInTheDocument()
  })

  it('displays short meaning when present', () => {
    const component = createMockComponent({
      shortMeaning: 'person'
    })

    renderWithProviders(ComponentListCard, {
      props: { component }
    })

    expect(screen.getByText('person')).toBeInTheDocument()
  })

  it('does not display meaning when not present', () => {
    const component = createMockComponent({ shortMeaning: null })

    renderWithProviders(ComponentListCard, {
      props: { component }
    })

    expect(screen.queryByText(/person/i)).not.toBeInTheDocument()
  })

  it('links to component detail page', () => {
    const component = createMockComponent({ id: 42 })

    renderWithProviders(ComponentListCard, {
      props: { component }
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/components/42')
  })
})
