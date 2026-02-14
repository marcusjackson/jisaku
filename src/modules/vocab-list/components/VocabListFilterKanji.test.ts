/**
 * VocabListFilterKanji Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListFilterKanji from './VocabListFilterKanji.vue'

import type { Kanji } from '@/api/kanji'

const mockKanjiList: Kanji[] = [
  {
    id: 1,
    character: '日',
    shortMeaning: 'day',
    jlptLevel: 'N5',
    strokeCount: 4,
    searchKeywords: null,
    radicalId: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 2,
    character: '本',
    shortMeaning: 'book',
    jlptLevel: 'N5',
    strokeCount: 5,
    searchKeywords: null,
    radicalId: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '',
    updatedAt: ''
  }
]

describe('VocabListFilterKanji', () => {
  it('renders combobox', () => {
    render(VocabListFilterKanji, {
      props: { modelValue: [], allKanji: mockKanjiList }
    })

    expect(
      screen.getByRole('combobox', { name: /contains kanji/i })
    ).toBeInTheDocument()
  })

  it('shows search placeholder when no selection', () => {
    render(VocabListFilterKanji, {
      props: { modelValue: [], allKanji: mockKanjiList }
    })

    expect(screen.getByPlaceholderText('Search kanji...')).toBeInTheDocument()
  })
})
