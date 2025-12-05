import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterRadical from './KanjiFilterRadical.vue'

import type { Radical } from '@/shared/types/database-types'

const mockRadicals: Radical[] = [
  {
    id: 1,
    character: '水',
    strokeCount: 4,
    number: 85,
    meaning: 'water',
    japaneseName: 'みず',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 2,
    character: '火',
    strokeCount: 4,
    number: 86,
    meaning: 'fire',
    japaneseName: 'ひ',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

describe('KanjiFilterRadical', () => {
  it('renders with label', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: mockRadicals
      }
    })

    expect(screen.getByText('Radical')).toBeInTheDocument()
  })

  it('renders combobox', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: mockRadicals
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows placeholder when no selection', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: mockRadicals
      }
    })

    expect(screen.getByText('All radicals')).toBeInTheDocument()
  })

  it('handles empty radicals array', () => {
    render(KanjiFilterRadical, {
      props: {
        modelValue: null,
        radicals: []
      }
    })

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })
})
