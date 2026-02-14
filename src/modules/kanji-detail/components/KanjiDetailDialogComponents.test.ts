/**
 * Tests for KanjiDetailDialogComponents
 */

import { render } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import KanjiDetailDialogComponents from './KanjiDetailDialogComponents.vue'

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
  },
  {
    id: 2,
    character: '月',
    shortMeaning: 'moon',
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

describe('KanjiDetailDialogComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without errors when open', () => {
    const { container } = render(KanjiDetailDialogComponents, {
      props: {
        open: true,
        allComponents: mockComponents,
        linkedOccurrences: mockOccurrences,
        destructiveMode: false
      }
    })

    expect(container).toBeTruthy()
  })

  it('accepts required props correctly', () => {
    const { rerender } = render(KanjiDetailDialogComponents, {
      props: {
        open: false,
        allComponents: mockComponents,
        linkedOccurrences: mockOccurrences,
        destructiveMode: false
      }
    })

    expect(rerender).toBeTruthy()
  })

  it('handles empty component lists', () => {
    const { container } = render(KanjiDetailDialogComponents, {
      props: {
        open: true,
        allComponents: [],
        linkedOccurrences: mockOccurrences,
        destructiveMode: false
      }
    })

    expect(container).toBeTruthy()
  })
})
