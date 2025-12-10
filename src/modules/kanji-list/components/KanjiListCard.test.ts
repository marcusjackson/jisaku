/**
 * Tests for KanjiListCard component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiListCard from './KanjiListCard.vue'

import type { Kanji } from '@/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '日',
    strokeCount: 4,
    shortMeaning: null,
    radicalId: null,
    jlptLevel: null,
    joyoLevel: null,
    kenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiListCard', () => {
  it('renders kanji character prominently', () => {
    const kanji = createMockKanji({ character: '日' })

    renderWithProviders(KanjiListCard, {
      props: { kanji }
    })

    expect(screen.getByText('日')).toBeInTheDocument()
  })

  it('displays JLPT level badge when set', () => {
    const kanji = createMockKanji({ jlptLevel: 'N5' })

    renderWithProviders(KanjiListCard, {
      props: { kanji }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
  })

  it('does not display JLPT badge when not set', () => {
    const kanji = createMockKanji({ jlptLevel: null })

    renderWithProviders(KanjiListCard, {
      props: { kanji }
    })

    expect(screen.queryByText(/N[1-5]/)).not.toBeInTheDocument()
  })

  it('displays Joyo level badge with Japanese label', () => {
    const testCases: { expected: string; joyoLevel: Kanji['joyoLevel'] }[] = [
      { expected: '小1', joyoLevel: 'elementary1' },
      { expected: '小2', joyoLevel: 'elementary2' },
      { expected: '小3', joyoLevel: 'elementary3' },
      { expected: '小4', joyoLevel: 'elementary4' },
      { expected: '小5', joyoLevel: 'elementary5' },
      { expected: '小6', joyoLevel: 'elementary6' },
      { expected: '中学', joyoLevel: 'secondary' }
    ]

    for (const { expected, joyoLevel } of testCases) {
      const kanji = createMockKanji({ joyoLevel })

      const result = renderWithProviders(KanjiListCard, {
        props: { kanji }
      })

      expect(screen.getByText(expected)).toBeInTheDocument()
      result.unmount()
    }
  })

  it('does not display Joyo badge when not set', () => {
    const kanji = createMockKanji({ joyoLevel: null })

    renderWithProviders(KanjiListCard, {
      props: { kanji }
    })

    expect(screen.queryByText(/小[1-6]|中学/)).not.toBeInTheDocument()
  })

  it('displays Kentei level badge when set', () => {
    const kanji = createMockKanji({ kenteiLevel: '3級' })

    renderWithProviders(KanjiListCard, {
      props: { kanji }
    })

    expect(screen.getByText('3級')).toBeInTheDocument()
  })

  it('does not display Kentei badge when not set', () => {
    const kanji = createMockKanji({ kenteiLevel: null })

    renderWithProviders(KanjiListCard, {
      props: { kanji }
    })

    expect(screen.queryByText(/[1-9]級|準[12]級/)).not.toBeInTheDocument()
  })

  it('renders as a link to kanji detail page', () => {
    const kanji = createMockKanji({ id: 42 })

    renderWithProviders(KanjiListCard, {
      props: { kanji }
    })

    // The RouterLink stub renders as an anchor tag with href
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/kanji/42')
  })
})
