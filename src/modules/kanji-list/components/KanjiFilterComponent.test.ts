import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterComponent from './KanjiFilterComponent.vue'

import type { Component } from '@/shared/types/database-types'

const mockComponents: Component[] = [
  {
    id: 1,
    character: '氵',
    strokeCount: 3,
    sourceKanjiId: null,
    descriptionShort: 'Water',
    japaneseName: 'さんずい',
    description: 'Water radical',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    character: '火',
    strokeCount: 4,
    sourceKanjiId: null,
    descriptionShort: 'Fire',
    japaneseName: 'ひ',
    description: 'Fire component',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('KanjiFilterComponent', () => {
  it('renders with label', () => {
    render(KanjiFilterComponent, {
      props: {
        modelValue: null,
        components: mockComponents
      }
    })

    expect(screen.getByText('Component')).toBeInTheDocument()
  })

  it('renders combobox', () => {
    render(KanjiFilterComponent, {
      props: {
        modelValue: null,
        components: mockComponents
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows placeholder when no selection', () => {
    render(KanjiFilterComponent, {
      props: {
        modelValue: null,
        components: mockComponents
      }
    })

    expect(screen.getByText('All components')).toBeInTheDocument()
  })

  it('handles empty components array', () => {
    render(KanjiFilterComponent, {
      props: {
        modelValue: null,
        components: []
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
