/**
 * Tests for VocabularySectionList component
 */

import userEvent from '@testing-library/user-event'
import { cleanup, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import VocabularySectionList from './VocabularySectionList.vue'

import type { Vocabulary } from '@/legacy/shared/types/database-types'

// Mock useSeedData
vi.mock('@/legacy/shared/composables/use-seed-data', () => ({
  useSeedData: () => ({
    isSeeding: { value: false },
    seed: vi.fn()
  })
}))

// Mock useToast
vi.mock('@/legacy/shared/composables/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  }
}))

const mockVocabulary: Vocabulary[] = [
  {
    id: 1,
    word: '日本',
    kana: 'にほん',
    shortMeaning: 'Japan',
    searchKeywords: null,
    jlptLevel: 'N5',
    isCommon: true,
    description: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    word: '食べる',
    kana: 'たべる',
    shortMeaning: 'to eat',
    searchKeywords: null,
    jlptLevel: 'N5',
    isCommon: true,
    description: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('VocabularySectionList', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders section header with title', () => {
    render(VocabularySectionList, {
      props: {
        vocabularyList: mockVocabulary
      }
    })

    expect(
      screen.getByRole('heading', { name: 'Vocabulary' })
    ).toBeInTheDocument()
  })

  it('renders Add Vocabulary button', () => {
    render(VocabularySectionList, {
      props: {
        vocabularyList: mockVocabulary
      }
    })

    expect(
      screen.getByRole('button', { name: 'Add Vocabulary' })
    ).toBeInTheDocument()
  })

  it('renders vocabulary cards', () => {
    render(VocabularySectionList, {
      props: {
        vocabularyList: mockVocabulary
      }
    })

    expect(screen.getByText('日本')).toBeInTheDocument()
    expect(screen.getByText('食べる')).toBeInTheDocument()
  })

  it('shows empty state message when no vocabulary and filters active', () => {
    render(VocabularySectionList, {
      props: {
        vocabularyList: [],
        hasActiveFilters: true
      }
    })

    expect(
      screen.getByText(/No vocabulary matches your filters/i)
    ).toBeInTheDocument()
  })

  it('shows no vocabulary message when empty and no filters', () => {
    render(VocabularySectionList, {
      props: {
        vocabularyList: [],
        hasActiveFilters: false
      }
    })

    expect(screen.getByText(/No vocabulary yet/i)).toBeInTheDocument()
  })

  it('opens quick create dialog when clicking Add Vocabulary', async () => {
    render(VocabularySectionList, {
      props: {
        vocabularyList: mockVocabulary
      }
    })

    const addButton = screen.getByRole('button', { name: 'Add Vocabulary' })
    await userEvent.click(addButton)

    // Dialog should be present (title rendered in dialog)
    expect(screen.getByText('Quick Create Vocabulary')).toBeInTheDocument()
  })
})
