/**
 * Tests for VocabDetailKanjiBreakdownItem component.
 */

import { renderWithProviders } from '@test/helpers/render'
import { describe, expect, it } from 'vitest'

import VocabDetailKanjiBreakdownItem from './VocabDetailKanjiBreakdownItem.vue'

import type { Kanji } from '@/api/kanji'
import type { VocabKanjiWithKanji } from '@/api/vocabulary'

// Factory functions
function createTestKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '明',
    shortMeaning: 'bright',
    strokeCount: 8,
    jlptLevel: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
    searchKeywords: null,
    radicalId: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

function createTestVocabKanjiWithKanji(
  overrides: Partial<VocabKanjiWithKanji> = {}
): VocabKanjiWithKanji {
  return {
    id: 1,
    vocabId: 10,
    kanjiId: 1,
    analysisNotes: null,
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    kanji: createTestKanji(),
    ...overrides
  }
}

const defaultProps = {
  vocabKanji: createTestVocabKanjiWithKanji(),
  index: 1,
  total: 3,
  isDestructiveMode: false
}

describe('VocabDetailKanjiBreakdownItem', () => {
  it('displays kanji character as a link to kanji detail page', () => {
    const { getByText } = renderWithProviders(VocabDetailKanjiBreakdownItem, {
      props: defaultProps
    })

    const link = getByText('明')
    expect(link.closest('a')).toHaveAttribute('href', '/kanji/1')
  })

  it('displays shortMeaning when present', () => {
    const { getByText } = renderWithProviders(VocabDetailKanjiBreakdownItem, {
      props: defaultProps
    })

    expect(getByText('bright')).toBeInTheDocument()
  })

  it('does not display shortMeaning when null', () => {
    const vocabKanji = createTestVocabKanjiWithKanji({
      kanji: createTestKanji({ shortMeaning: null })
    })

    const { queryByText } = renderWithProviders(VocabDetailKanjiBreakdownItem, {
      props: { ...defaultProps, vocabKanji }
    })

    expect(queryByText('bright')).not.toBeInTheDocument()
  })

  it('displays analysisNotes when present', () => {
    const vocabKanji = createTestVocabKanjiWithKanji({
      analysisNotes: 'Important note about this kanji'
    })

    const { getByText } = renderWithProviders(VocabDetailKanjiBreakdownItem, {
      props: { ...defaultProps, vocabKanji }
    })

    expect(getByText('Important note about this kanji')).toBeInTheDocument()
  })

  it('disables Move Up button when index is 0', () => {
    const { getByLabelText } = renderWithProviders(
      VocabDetailKanjiBreakdownItem,
      { props: { ...defaultProps, index: 0 } }
    )

    expect(getByLabelText('Move up')).toBeDisabled()
    expect(getByLabelText('Move down')).not.toBeDisabled()
  })

  it('disables Move Down button when index is last', () => {
    const { getByLabelText } = renderWithProviders(
      VocabDetailKanjiBreakdownItem,
      { props: { ...defaultProps, index: 2, total: 3 } }
    )

    expect(getByLabelText('Move up')).not.toBeDisabled()
    expect(getByLabelText('Move down')).toBeDisabled()
  })

  it('always renders Edit button', () => {
    const { getByRole } = renderWithProviders(VocabDetailKanjiBreakdownItem, {
      props: defaultProps
    })

    expect(getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('renders Delete button only in destructive mode', () => {
    const { queryByRole } = renderWithProviders(VocabDetailKanjiBreakdownItem, {
      props: { ...defaultProps, isDestructiveMode: false }
    })

    expect(queryByRole('button', { name: /delete/i })).not.toBeInTheDocument()
  })

  it('renders Delete button when destructive mode is enabled', () => {
    const { getByRole } = renderWithProviders(VocabDetailKanjiBreakdownItem, {
      props: { ...defaultProps, isDestructiveMode: true }
    })

    expect(getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })
})
