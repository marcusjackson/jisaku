/**
 * Tests for ComponentListSectionGrid component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListSectionGrid from './ComponentListSectionGrid.vue'

import type { Component } from '@/shared/types/database-types'

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    id: 1,
    character: '亻',
    strokeCount: 2,
    shortMeaning: null,
    sourceKanjiId: null,
    japaneseName: null,
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

describe('ComponentListSectionGrid', () => {
  it('renders the page title', () => {
    renderWithProviders(ComponentListSectionGrid, {
      props: { componentList: [] }
    })

    expect(
      screen.getByRole('heading', { name: /components/i })
    ).toBeInTheDocument()
  })

  it('renders empty state when no components', () => {
    renderWithProviders(ComponentListSectionGrid, {
      props: { componentList: [] }
    })

    expect(screen.getByText(/no components yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add your first component/i })
    ).toBeInTheDocument()
  })

  it('renders component cards when components exist', () => {
    const componentList = [
      createMockComponent({ id: 1, character: '亻' }),
      createMockComponent({ id: 2, character: '氵' }),
      createMockComponent({ id: 3, character: '火' })
    ]

    renderWithProviders(ComponentListSectionGrid, {
      props: { componentList }
    })

    expect(screen.getByText('亻')).toBeInTheDocument()
    expect(screen.getByText('氵')).toBeInTheDocument()
    expect(screen.getByText('火')).toBeInTheDocument()
  })

  it('renders Add Component button in header', () => {
    renderWithProviders(ComponentListSectionGrid, {
      props: { componentList: [] }
    })

    // Should have Add Component button in header
    expect(
      screen.getByRole('button', { name: /add component/i })
    ).toBeInTheDocument()
  })

  it('displays stroke count on component cards', () => {
    const componentList = [createMockComponent({ strokeCount: 3 })]

    renderWithProviders(ComponentListSectionGrid, {
      props: { componentList }
    })

    expect(screen.getByText(/3 strokes/i)).toBeInTheDocument()
  })

  it('hides empty state when components exist', () => {
    const componentList = [createMockComponent()]

    renderWithProviders(ComponentListSectionGrid, {
      props: { componentList }
    })

    expect(screen.queryByText(/no components yet/i)).not.toBeInTheDocument()
  })
})
