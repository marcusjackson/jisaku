/**
 * Tests for KanjiListSectionGrid component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListSectionGrid from './KanjiListSectionGrid.vue'

import type { Kanji } from '@/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '日',
    strokeCount: 4,
    radicalId: null,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesCultural: null,
    notesPersonal: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiListSectionGrid', () => {
  it('renders the page title', () => {
    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    expect(
      screen.getByRole('heading', { name: /kanji list/i })
    ).toBeInTheDocument()
  })

  it('renders empty state when no kanji', () => {
    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    expect(screen.getByText(/no kanji yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add your first kanji/i })
    ).toBeInTheDocument()
  })

  it('renders kanji cards when kanji exist', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '日' }),
      createMockKanji({ id: 2, character: '月' }),
      createMockKanji({ id: 3, character: '水' })
    ]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('水')).toBeInTheDocument()
  })

  it('renders Add Kanji button in header', () => {
    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    // Should have Add Kanji button in header
    expect(
      screen.getByRole('button', { name: /add kanji/i })
    ).toBeInTheDocument()
  })

  it('displays stroke count on kanji cards', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '日', strokeCount: 4 })
    ]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(screen.getByText(/4 strokes/i)).toBeInTheDocument()
  })

  it('displays JLPT level badge on kanji cards', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '日', jlptLevel: 'N5' })
    ]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
  })

  it('displays Joyo level badge on kanji cards', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '日', joyoLevel: 'elementary1' })
    ]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(screen.getByText('小1')).toBeInTheDocument()
  })
})
