/**
 * Tests for KanjiDetailSectionComponents
 */

import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import KanjiDetailSectionComponents from './KanjiDetailSectionComponents.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { Component } from '@/api/component/component-types'

// Mock composables that rely on database
vi.mock('@/api/component/component-form-repository', () => ({
  useComponentFormRepository: () => ({
    getByParentId: vi.fn(() => [])
  })
}))

vi.mock('@/api/position/position-type-repository', () => ({
  usePositionTypeRepository: () => ({
    getAll: vi.fn(() => [])
  })
}))

const mockComponents: Component[] = [
  {
    id: 1,
    character: '日',
    shortMeaning: 'sun',
    strokeCount: 4,
    searchKeywords: '',
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: ''
  }
]

const mockOccurrences: ComponentOccurrenceWithDetails[] = []

describe('KanjiDetailSectionComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders section title', () => {
    render(KanjiDetailSectionComponents, {
      props: {
        linkedOccurrences: mockOccurrences,
        allComponents: mockComponents,
        destructiveMode: false
      }
    })

    expect(screen.getByText('Components')).toBeInTheDocument()
  })

  it('renders edit button', () => {
    render(KanjiDetailSectionComponents, {
      props: {
        linkedOccurrences: mockOccurrences,
        allComponents: mockComponents,
        destructiveMode: false
      }
    })

    expect(screen.getByTestId('basic-info-edit-button')).toBeInTheDocument()
  })

  it('renders empty state when no occurrences', () => {
    render(KanjiDetailSectionComponents, {
      props: {
        linkedOccurrences: [],
        allComponents: mockComponents,
        destructiveMode: false
      }
    })

    expect(
      screen.getByText(/No components have been linked/i)
    ).toBeInTheDocument()
  })
})
