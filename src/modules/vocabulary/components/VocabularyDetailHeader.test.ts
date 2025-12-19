/**
 * Tests for VocabularyDetailHeader component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabularyDetailHeader from './VocabularyDetailHeader.vue'

import type { Vocabulary } from '@/shared/types/database-types'

const mockVocabulary: Vocabulary = {
  id: 1,
  word: '日本',
  kana: 'にほん',
  shortMeaning: 'Japan',
  searchKeywords: 'nippon, japan',
  jlptLevel: 'N5',
  isCommon: true,
  description: 'The country of Japan',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

describe('VocabularyDetailHeader', () => {
  it('renders vocabulary word', () => {
    render(VocabularyDetailHeader, { props: { vocabulary: mockVocabulary } })

    expect(screen.getByText('日本')).toBeInTheDocument()
  })

  it('renders vocabulary kana', () => {
    render(VocabularyDetailHeader, { props: { vocabulary: mockVocabulary } })

    expect(screen.getByText('にほん')).toBeInTheDocument()
  })

  it('renders short meaning', () => {
    render(VocabularyDetailHeader, { props: { vocabulary: mockVocabulary } })

    expect(screen.getByText('Japan')).toBeInTheDocument()
  })

  it('shows "No meaning set" when shortMeaning is null', () => {
    const vocabWithoutMeaning = { ...mockVocabulary, shortMeaning: null }
    render(VocabularyDetailHeader, {
      props: { vocabulary: vocabWithoutMeaning }
    })

    expect(screen.getByText('No meaning set')).toBeInTheDocument()
  })

  it('does not render kana when null', () => {
    const vocabWithoutKana = { ...mockVocabulary, kana: null }
    render(VocabularyDetailHeader, { props: { vocabulary: vocabWithoutKana } })

    // Should still show word, just no kana
    expect(screen.getByText('日本')).toBeInTheDocument()
    expect(screen.queryByText('にほん')).not.toBeInTheDocument()
  })

  it('renders edit button', () => {
    render(VocabularyDetailHeader, { props: { vocabulary: mockVocabulary } })

    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('emits edit event when edit button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(VocabularyDetailHeader, {
      props: { vocabulary: mockVocabulary }
    })

    const editButton = screen.getByRole('button', { name: 'Edit' })
    await user.click(editButton)

    expect(wrapper.emitted()).toHaveProperty('edit')
  })
})
