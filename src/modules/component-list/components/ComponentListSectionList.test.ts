/**
 * ComponentListSectionList Tests
 *
 * Tests for the component list section component.
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentListSectionList from './ComponentListSectionList.vue'

import type { Component } from '@/api/component'

// Mock seed data composable
vi.mock('@/shared/composables', () => ({
  useSeedData: () => ({
    isSeeding: { value: false },
    seed: vi.fn()
  }),
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn()
  })
}))

const mockComponents: Component[] = [
  {
    id: 1,
    character: '亻',
    shortMeaning: 'person',
    searchKeywords: null,
    strokeCount: 2,
    kangxiNumber: 9,
    kangxiMeaning: 'person',
    canBeRadical: true,
    sourceKanjiId: null,
    description: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '氵',
    shortMeaning: 'water',
    searchKeywords: null,
    strokeCount: 3,
    kangxiNumber: 85,
    kangxiMeaning: 'water',
    canBeRadical: false,
    sourceKanjiId: null,
    description: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('ComponentListSectionList', () => {
  it('renders title and add button', () => {
    renderWithProviders(ComponentListSectionList, {
      props: { componentList: mockComponents }
    })

    expect(
      screen.getByRole('heading', { name: /component list/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add new/i })).toBeInTheDocument()
  })

  it('renders component cards', () => {
    renderWithProviders(ComponentListSectionList, {
      props: { componentList: mockComponents }
    })

    expect(screen.getByText('亻')).toBeInTheDocument()
    expect(screen.getByText('氵')).toBeInTheDocument()
  })

  it('shows filter empty state when no results', () => {
    renderWithProviders(ComponentListSectionList, {
      props: { componentList: [], hasActiveFilters: true }
    })

    expect(
      screen.getByText(/no components match your filters/i)
    ).toBeInTheDocument()
  })

  it('renders radical badge for radical components', () => {
    renderWithProviders(ComponentListSectionList, {
      props: { componentList: mockComponents }
    })

    // Only 亻 has isRadical: true
    const radicalBadges = screen.getAllByText('部首')
    expect(radicalBadges.length).toBe(1)
  })

  it('emits addComponent when add button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = renderWithProviders(ComponentListSectionList, {
      props: {
        componentList: mockComponents,
        onAddComponent: vi.fn()
      }
    })

    await user.click(screen.getByRole('button', { name: /add new/i }))

    expect(wrapper.emitted('addComponent')).toBeTruthy()
  })

  it('displays stroke count badges on cards', () => {
    renderWithProviders(ComponentListSectionList, {
      props: { componentList: mockComponents }
    })

    // 亻 has 2 strokes, 氵 has 3 strokes - displayed as "X画"
    expect(screen.getByText('2画')).toBeInTheDocument()
    expect(screen.getByText('3画')).toBeInTheDocument()
  })
})
