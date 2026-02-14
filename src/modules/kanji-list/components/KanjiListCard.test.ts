/**
 * KanjiListCard Tests
 *
 * Tests for kanji card display component.
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListCard from './KanjiListCard.vue'

import type { Kanji } from '@/api/kanji'

const mockKanji: Kanji = {
  id: 1,
  character: '山',
  shortMeaning: 'mountain',
  searchKeywords: null,
  strokeCount: 3,
  jlptLevel: 'N5',
  joyoLevel: 'elementary1',
  kanjiKenteiLevel: '10',
  radicalId: null,
  strokeDiagramImage: null,
  strokeGifImage: null,
  notesEtymology: null,
  notesSemantic: null,
  notesEducationMnemonics: null,
  notesPersonal: null,
  identifier: null,
  radicalStrokeCount: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const mockClassification = {
  id: 1,
  kanjiId: 1,
  classificationTypeId: 1,
  displayOrder: 1,
  classificationType: {
    id: 1,
    typeName: 'pictograph',
    nameJapanese: '象形文字',
    nameEnglish: null,
    description: null,
    descriptionShort: null,
    displayOrder: 1
  }
}

describe('KanjiListCard', () => {
  it('renders kanji character', () => {
    renderWithProviders(KanjiListCard, {
      props: { kanji: mockKanji }
    })

    expect(screen.getByText('山')).toBeInTheDocument()
  })

  it('renders short meaning', () => {
    renderWithProviders(KanjiListCard, {
      props: { kanji: mockKanji }
    })

    expect(screen.getByText('mountain')).toBeInTheDocument()
  })

  it('renders kentei level badge', () => {
    renderWithProviders(KanjiListCard, {
      props: { kanji: mockKanji }
    })

    expect(screen.getByText('10級')).toBeInTheDocument()
  })

  it('renders classification badge when provided', () => {
    renderWithProviders(KanjiListCard, {
      props: {
        kanji: mockKanji,
        classification: mockClassification
      }
    })

    // Abbreviated as 象形
    expect(screen.getByText('象形')).toBeInTheDocument()
  })

  it('links to kanji detail page', () => {
    renderWithProviders(KanjiListCard, {
      props: { kanji: mockKanji }
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/kanji/1')
  })

  it('does not render missing optional fields', () => {
    const kanjiWithoutOptional: Kanji = {
      ...mockKanji,
      shortMeaning: null,
      kanjiKenteiLevel: null
    }

    renderWithProviders(KanjiListCard, {
      props: { kanji: kanjiWithoutOptional }
    })

    expect(screen.queryByText('mountain')).not.toBeInTheDocument()
    expect(screen.queryByText(/級/)).not.toBeInTheDocument()
  })
})
