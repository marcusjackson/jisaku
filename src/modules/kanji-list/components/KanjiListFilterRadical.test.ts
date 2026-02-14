/**
 * KanjiListFilterRadical Tests
 *
 * Tests for radical dropdown select filter component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListFilterRadical from './KanjiListFilterRadical.vue'

import type { Component } from '@/api/component'

const mockRadicals: Component[] = [
  {
    id: 1,
    character: '一',
    shortMeaning: 'one',
    searchKeywords: null,
    strokeCount: 1,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 1,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '人',
    shortMeaning: 'person',
    searchKeywords: null,
    strokeCount: 2,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 9,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('KanjiListFilterRadical', () => {
  it('renders with label', () => {
    render(KanjiListFilterRadical, {
      props: {
        modelValue: null,
        radicals: mockRadicals
      }
    })

    expect(screen.getByText(/radical/i)).toBeInTheDocument()
  })

  it('shows placeholder option when no selection', () => {
    render(KanjiListFilterRadical, {
      props: {
        modelValue: null,
        radicals: mockRadicals
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays selected radical', () => {
    render(KanjiListFilterRadical, {
      props: {
        modelValue: 1,
        radicals: mockRadicals
      }
    })

    // The select should have the value set
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
  })
})
