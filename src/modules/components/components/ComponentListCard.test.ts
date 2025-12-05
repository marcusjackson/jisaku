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
    sourceKanjiId: null,
    descriptionShort: null,
    japaneseName: null,
    description: null,
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

    expect(screen.getByText(/2 strokes/i)).toBeInTheDocument()
  })

  it('displays short description when present', () => {
    const component = createMockComponent({
      descriptionShort: 'Person radical'
    })

    renderWithProviders(ComponentListCard, {
      props: { component }
    })

    expect(screen.getByText('Person radical')).toBeInTheDocument()
  })

  it('does not display description when not present', () => {
    const component = createMockComponent({ descriptionShort: null })

    renderWithProviders(ComponentListCard, {
      props: { component }
    })

    expect(screen.queryByText(/radical/i)).not.toBeInTheDocument()
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
