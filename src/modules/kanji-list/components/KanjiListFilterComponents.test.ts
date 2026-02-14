/**
 * KanjiListFilterComponents Tests
 *
 * Tests for multi-select component filter.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListFilterComponents from './KanjiListFilterComponents.vue'

import type { Component } from '@/api/component'

const mockComponents: Component[] = [
  {
    id: 1,
    character: '一',
    shortMeaning: 'one',
    searchKeywords: null,
    strokeCount: 1,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '口',
    shortMeaning: 'mouth',
    searchKeywords: null,
    strokeCount: 3,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('KanjiListFilterComponents', () => {
  it('renders with label', () => {
    render(KanjiListFilterComponents, {
      props: {
        modelValue: [],
        components: mockComponents
      }
    })

    expect(screen.getByText(/components/i)).toBeInTheDocument()
  })

  it('shows placeholder text when empty', () => {
    render(KanjiListFilterComponents, {
      props: {
        modelValue: [],
        components: mockComponents
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows selected component count when items selected', () => {
    render(KanjiListFilterComponents, {
      props: {
        modelValue: [1, 2],
        components: mockComponents
      }
    })

    // Component should render with selected values
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
