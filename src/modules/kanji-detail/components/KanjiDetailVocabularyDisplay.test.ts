/**
 * Tests for KanjiDetailVocabularyDisplay component
 */

import { renderWithProviders as render } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailVocabularyDisplay from './KanjiDetailVocabularyDisplay.vue'

import type { VocabularyListItem } from '../kanji-detail-types'

describe('KanjiDetailVocabularyDisplay', () => {
  it('renders empty state when no vocabulary', () => {
    render(KanjiDetailVocabularyDisplay, {
      props: { vocabulary: [] }
    })

    expect(screen.getByTestId('vocabulary-empty-state')).toBeInTheDocument()
    expect(
      screen.getByText('No vocabulary entries found for this kanji.')
    ).toBeInTheDocument()
  })

  it('renders vocabulary list when vocabulary exists', () => {
    const vocabulary: VocabularyListItem[] = [
      {
        linkId: 1,
        vocabularyId: 1,
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      },
      {
        linkId: 2,
        vocabularyId: 2,
        word: '明るい',
        kana: 'あかるい',
        shortMeaning: 'bright'
      }
    ]

    render(KanjiDetailVocabularyDisplay, {
      props: { vocabulary }
    })

    expect(screen.getByTestId('vocabulary-list')).toBeInTheDocument()
    expect(screen.getByText('明日')).toBeInTheDocument()
    expect(screen.getByText('明るい')).toBeInTheDocument()
  })

  it('renders correct number of vocabulary items', () => {
    const vocabulary: VocabularyListItem[] = [
      {
        linkId: 1,
        vocabularyId: 1,
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      },
      {
        linkId: 2,
        vocabularyId: 2,
        word: '明るい',
        kana: 'あかるい',
        shortMeaning: 'bright'
      },
      {
        linkId: 3,
        vocabularyId: 3,
        word: '説明',
        kana: 'せつめい',
        shortMeaning: 'explanation'
      }
    ]

    render(KanjiDetailVocabularyDisplay, {
      props: { vocabulary }
    })

    const list = screen.getByTestId('vocabulary-list')
    expect(list.children).toHaveLength(3)
  })

  it('does not show empty state when vocabulary list is not empty', () => {
    const vocabulary: VocabularyListItem[] = [
      {
        linkId: 1,
        vocabularyId: 1,
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      }
    ]

    render(KanjiDetailVocabularyDisplay, {
      props: { vocabulary }
    })

    expect(
      screen.queryByTestId('vocabulary-empty-state')
    ).not.toBeInTheDocument()
  })

  it('does not show list when vocabulary is empty', () => {
    render(KanjiDetailVocabularyDisplay, {
      props: { vocabulary: [] }
    })

    expect(screen.queryByTestId('vocabulary-list')).not.toBeInTheDocument()
  })
})
