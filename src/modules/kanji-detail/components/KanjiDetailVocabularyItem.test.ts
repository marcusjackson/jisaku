/**
 * Tests for KanjiDetailVocabularyItem component
 */

import { renderWithProviders as render } from '@test/helpers/render'
import { userEvent } from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailVocabularyItem from './KanjiDetailVocabularyItem.vue'

import type { VocabularyListItem } from '../kanji-detail-types'

describe('KanjiDetailVocabularyItem', () => {
  const mockVocabulary: VocabularyListItem = {
    linkId: 1,
    vocabularyId: 1,
    word: '明日',
    kana: 'あした',
    shortMeaning: 'tomorrow'
  }

  it('renders vocabulary word', () => {
    render(KanjiDetailVocabularyItem, {
      props: { vocabulary: mockVocabulary }
    })

    expect(screen.getByText('明日')).toBeInTheDocument()
  })

  it('renders vocabulary kana in parentheses', () => {
    render(KanjiDetailVocabularyItem, {
      props: { vocabulary: mockVocabulary }
    })

    expect(screen.getByText('(あした)', { exact: false })).toBeInTheDocument()
  })

  it('renders vocabulary short meaning with dash prefix', () => {
    render(KanjiDetailVocabularyItem, {
      props: { vocabulary: mockVocabulary }
    })

    expect(screen.getByText('- tomorrow', { exact: false })).toBeInTheDocument()
  })

  it('does not render kana when not provided', () => {
    const vocabWithoutKana: VocabularyListItem = {
      linkId: 1,
      vocabularyId: 1,
      word: '明日',
      kana: '',
      shortMeaning: 'tomorrow'
    }

    render(KanjiDetailVocabularyItem, {
      props: { vocabulary: vocabWithoutKana }
    })

    expect(screen.queryByText(/\(/)).not.toBeInTheDocument()
  })

  it('does not render short meaning when null', () => {
    const vocabWithoutMeaning: VocabularyListItem = {
      linkId: 1,
      vocabularyId: 1,
      word: '明日',
      kana: 'あした',
      shortMeaning: null
    }

    render(KanjiDetailVocabularyItem, {
      props: { vocabulary: vocabWithoutMeaning }
    })

    expect(screen.queryByText(/-/)).not.toBeInTheDocument()
  })

  it('renders as a link to vocabulary detail page', () => {
    render(KanjiDetailVocabularyItem, {
      props: { vocabulary: mockVocabulary }
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/vocabulary/1')
  })

  it('includes test id with vocabulary id', () => {
    render(KanjiDetailVocabularyItem, {
      props: { vocabulary: mockVocabulary }
    })

    expect(screen.getByTestId('vocabulary-item-1')).toBeInTheDocument()
  })

  describe('edit mode', () => {
    it('renders as editable item when editMode is true', () => {
      render(KanjiDetailVocabularyItem, {
        props: { vocabulary: mockVocabulary, editMode: true }
      })

      // Should not be a link
      expect(screen.queryByRole('link')).not.toBeInTheDocument()

      // Should display content
      expect(screen.getByText('明日')).toBeInTheDocument()
    })

    it('does not show remove button when destructiveMode is false', () => {
      render(KanjiDetailVocabularyItem, {
        props: {
          vocabulary: mockVocabulary,
          editMode: true,
          destructiveMode: false
        }
      })

      expect(
        screen.queryByTestId('vocabulary-remove-button')
      ).not.toBeInTheDocument()
    })

    it('shows remove button when destructiveMode is true', () => {
      render(KanjiDetailVocabularyItem, {
        props: {
          vocabulary: mockVocabulary,
          editMode: true,
          destructiveMode: true
        }
      })

      expect(screen.getByTestId('vocabulary-remove-button')).toBeInTheDocument()
    })

    it('emits remove event when remove button clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailVocabularyItem, {
        props: {
          vocabulary: mockVocabulary,
          editMode: true,
          destructiveMode: true
        }
      })

      const removeButton = screen.getByTestId('vocabulary-remove-button')
      await user.click(removeButton)

      expect(emitted()['remove']).toBeTruthy()
      expect(emitted()['remove']).toHaveLength(1)
    })
  })
})
