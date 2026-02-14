/**
 * Tests for VocabularyCard component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabularyCard from './VocabularyCard.vue'

import type { Vocabulary } from '@/legacy/shared/types/database-types'

function createMockVocabulary(overrides: Partial<Vocabulary> = {}): Vocabulary {
  return {
    id: 1,
    word: '日本',
    kana: 'にほん',
    shortMeaning: 'Japan',
    searchKeywords: null,
    jlptLevel: null,
    isCommon: false,
    description: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('VocabularyCard', () => {
  it('renders vocabulary word prominently', () => {
    const vocabulary = createMockVocabulary({ word: '日本' })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    expect(screen.getByText('日本')).toBeInTheDocument()
  })

  it('does not display kana when not set', () => {
    const vocabulary = createMockVocabulary({ kana: null })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    // Since we no longer display kana, this test just ensures no kana text appears
    expect(screen.queryByText('にほん')).not.toBeInTheDocument()
  })

  it('displays short meaning when set', () => {
    const vocabulary = createMockVocabulary({ shortMeaning: 'Japan' })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    expect(screen.getByText('Japan')).toBeInTheDocument()
  })

  it('displays JLPT level badge when set', () => {
    const vocabulary = createMockVocabulary({ jlptLevel: 'N5' })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
  })

  it('does not display JLPT badge when not set', () => {
    const vocabulary = createMockVocabulary({ jlptLevel: null })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    expect(screen.queryByText(/N[1-5]/)).not.toBeInTheDocument()
  })

  it('displays non-jlpt badge with Japanese label', () => {
    const vocabulary = createMockVocabulary({ jlptLevel: 'non-jlpt' })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    expect(screen.getByText('非JLPT')).toBeInTheDocument()
  })

  it('displays common word badge when isCommon is true', () => {
    const vocabulary = createMockVocabulary({ isCommon: true })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    expect(screen.getByText('常用')).toBeInTheDocument()
  })

  it('does not display common badge when isCommon is false', () => {
    const vocabulary = createMockVocabulary({ isCommon: false })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    expect(screen.queryByText('常用')).not.toBeInTheDocument()
  })

  it('links to vocabulary detail page', () => {
    const vocabulary = createMockVocabulary({ id: 42 })

    renderWithProviders(VocabularyCard, {
      props: { vocabulary }
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/vocabulary/42')
  })
})
