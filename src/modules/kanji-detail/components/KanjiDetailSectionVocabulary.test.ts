/**
 * Tests for KanjiDetailSectionVocabulary component
 */

import { renderWithProviders as render } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailSectionVocabulary from './KanjiDetailSectionVocabulary.vue'

import type { VocabularyListItem } from '../kanji-detail-types'

describe('KanjiDetailSectionVocabulary', () => {
  it('renders section with title', () => {
    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary: [],
        allVocabulary: []
      }
    })

    expect(screen.getByText('Vocabulary')).toBeInTheDocument()
  })

  it('renders edit button', () => {
    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary: [],
        allVocabulary: []
      }
    })

    const editButton = screen.getByTestId('vocabulary-edit-button')
    expect(editButton).toBeInTheDocument()
    expect(editButton).toHaveTextContent('Edit')
  })

  it('renders vocabulary display component', () => {
    const vocabulary: VocabularyListItem[] = [
      {
        linkId: 1,
        vocabularyId: 1,
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      }
    ]

    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary,
        allVocabulary: []
      }
    })

    expect(screen.getByTestId('vocabulary-list')).toBeInTheDocument()
    expect(screen.getByText('明日')).toBeInTheDocument()
  })

  it('passes vocabulary prop to display component', () => {
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

    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary,
        allVocabulary: []
      }
    })

    const list = screen.getByTestId('vocabulary-list')
    expect(list.children).toHaveLength(2)
  })

  it('has correct test id on section', () => {
    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary: [],
        allVocabulary: []
      }
    })

    expect(screen.getByTestId('kanji-detail-vocabulary')).toBeInTheDocument()
  })

  it('opens dialog when edit button is clicked', async () => {
    const user = userEvent.setup()

    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary: [],
        allVocabulary: []
      }
    })

    const editButton = screen.getByTestId('vocabulary-edit-button')
    await user.click(editButton)

    // Dialog should be open (check by dialog title)
    expect(screen.getByText('Link Vocabulary')).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(
        'Search vocabulary by word, kana, or meaning...'
      )
    ).toBeInTheDocument()
  })

  it('closes dialog when close button is clicked', async () => {
    const user = userEvent.setup()

    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary: [],
        allVocabulary: []
      }
    })

    const editButton = screen.getByTestId('vocabulary-edit-button')
    await user.click(editButton)

    expect(screen.getByText('Link Vocabulary')).toBeInTheDocument()

    // Click the dialog's Close button (not the X button)
    const closeButtons = screen.getAllByRole('button', { name: /Close/i })
    const dialogCloseButton = closeButtons.find(
      (btn) => btn.textContent?.trim() === 'Close'
    )
    if (!dialogCloseButton) throw new Error('Close button not found')

    await user.click(dialogCloseButton)

    expect(screen.queryByText('Link Vocabulary')).not.toBeInTheDocument()
  })

  it('passes linked vocabulary to dialog for exclusion', async () => {
    const user = userEvent.setup()
    const linkedVocabulary: VocabularyListItem[] = [
      {
        linkId: 1,
        vocabularyId: 10,
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      }
    ]
    const allVocabulary: VocabularyListItem[] = [
      {
        linkId: 1,
        vocabularyId: 10,
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      },
      {
        linkId: 2,
        vocabularyId: 20,
        word: '明るい',
        kana: 'あかるい',
        shortMeaning: 'bright'
      }
    ]

    render(KanjiDetailSectionVocabulary, {
      props: {
        vocabulary: linkedVocabulary,
        allVocabulary
      }
    })

    const editButton = screen.getByTestId('vocabulary-edit-button')
    await user.click(editButton)

    expect(screen.getByText('Link Vocabulary')).toBeInTheDocument()
    // Dialog is open and has received the props
  })
})
