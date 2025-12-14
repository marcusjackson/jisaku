/**
 * Tests for ComponentDetailHeader component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailHeader from './ComponentDetailHeader.vue'

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

describe('ComponentDetailHeader', () => {
  it('renders component character prominently', () => {
    const component = createMockComponent({ character: '氵' })

    renderWithProviders(ComponentDetailHeader, {
      props: { component }
    })

    expect(screen.getByText('氵')).toBeInTheDocument()
  })

  it('displays stroke count', () => {
    const component = createMockComponent({ strokeCount: 3 })

    renderWithProviders(ComponentDetailHeader, {
      props: { component }
    })

    expect(screen.getByText('3 strokes')).toBeInTheDocument()
  })
})
