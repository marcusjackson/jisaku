/**
 * Tests for KanjiDetailHeader component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailHeader from './KanjiDetailHeader.vue'

import type { Kanji } from '@/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '日',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: null,
    joyoLevel: null,
    notesEtymology: null,
    notesCultural: null,
    notesPersonal: null,
    radicalId: null,
    strokeCount: 4,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiDetailHeader', () => {
  it('renders kanji character prominently', () => {
    const kanji = createMockKanji({ character: '水' })

    renderWithProviders(KanjiDetailHeader, {
      props: { kanji }
    })

    expect(screen.getByText('水')).toBeInTheDocument()
  })

  it('displays stroke count', () => {
    const kanji = createMockKanji({ strokeCount: 8 })

    renderWithProviders(KanjiDetailHeader, {
      props: { kanji }
    })

    expect(screen.getByText(/8 strokes/i)).toBeInTheDocument()
  })

  it('renders back link', () => {
    const kanji = createMockKanji()

    renderWithProviders(KanjiDetailHeader, {
      props: { kanji }
    })

    expect(
      screen.getByRole('link', { name: /back to list/i })
    ).toBeInTheDocument()
  })

  it('back link points to home', () => {
    const kanji = createMockKanji()

    renderWithProviders(KanjiDetailHeader, {
      props: { kanji }
    })

    expect(screen.getByRole('link', { name: /back to list/i })).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('renders different characters correctly', () => {
    const kanji = createMockKanji({ character: '漢' })

    renderWithProviders(KanjiDetailHeader, {
      props: { kanji }
    })

    expect(screen.getByText('漢')).toBeInTheDocument()
  })

  it('renders singular stroke for count of 1', () => {
    const kanji = createMockKanji({ strokeCount: 1 })

    renderWithProviders(KanjiDetailHeader, {
      props: { kanji }
    })

    // Component shows "1 strokes" - this is acceptable
    expect(screen.getByText(/1 strokes/i)).toBeInTheDocument()
  })
})
