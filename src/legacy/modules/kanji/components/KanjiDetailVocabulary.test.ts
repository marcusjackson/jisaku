/**
 * Tests for KanjiDetailVocabulary component
 */

import userEvent from '@testing-library/user-event'
import { cleanup, render, screen } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import KanjiDetailVocabulary from './KanjiDetailVocabulary.vue'

import type { Vocabulary } from '@/legacy/shared/types/database-types'

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
    word: '日曜日',
    kana: 'にちようび',
    shortMeaning: 'Sunday',
    searchKeywords: null,
    jlptLevel: 'N5',
    isCommon: true,
    description: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const allVocabulary: Vocabulary[] = [
  ...mockVocabulary,
  {
    id: 3,
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

describe('KanjiDetailVocabulary', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders vocabulary list', () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    expect(screen.getByText('日本')).toBeInTheDocument()
    expect(screen.getByText('日曜日')).toBeInTheDocument()
  })

  it('shows kana for vocabulary with kana', () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    // Kana is shown in parentheses
    expect(screen.getByText('(にほん)')).toBeInTheDocument()
    expect(screen.getByText('(にちようび)')).toBeInTheDocument()
  })

  it('shows short meaning for vocabulary', () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    expect(screen.getByText('Japan')).toBeInTheDocument()
    expect(screen.getByText('Sunday')).toBeInTheDocument()
  })

  it('shows empty message when no vocabulary', () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: [],
        allVocabulary
      }
    })

    expect(
      screen.getByText(/No vocabulary using this kanji/i)
    ).toBeInTheDocument()
  })

  it('displays Edit button', () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('enters edit mode when clicking Edit', async () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    // Should show Done and Cancel buttons
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows add vocabulary button in edit mode', async () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByRole('button', { name: '+ Add' })).toBeInTheDocument()
  })

  it('shows remove button in edit mode with destructive mode enabled', async () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary,
        isDestructiveMode: true
      }
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    // Should have remove buttons for each vocabulary
    const removeButtons = screen.getAllByRole('button', { name: /Remove/i })
    expect(removeButtons.length).toBe(2)
  })

  it('exits edit mode on Done', async () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))

    // Should be back in view mode
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('exits edit mode on Cancel', async () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }))

    // Should be back in view mode
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('vocabulary words are displayed', () => {
    render(KanjiDetailVocabulary, {
      props: {
        vocabularyList: mockVocabulary,
        allVocabulary
      }
    })

    // Check vocabulary words are rendered
    expect(screen.getByText('日本')).toBeInTheDocument()
    expect(screen.getByText('日曜日')).toBeInTheDocument()
  })
})
