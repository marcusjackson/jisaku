/**
 * Tests for ComponentDetailKanjiList component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailKanjiList from './ComponentDetailKanjiList.vue'

import type { Kanji } from '@/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '休',
    strokeCount: 6,
    radicalId: null,
    jlptLevel: null,
    joyoLevel: null,
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

describe('ComponentDetailKanjiList', () => {
  it('renders title', () => {
    renderWithProviders(ComponentDetailKanjiList, {
      props: { kanjiList: [] }
    })

    expect(screen.getByText('Kanji Using This Component')).toBeInTheDocument()
  })

  it('displays empty state when no kanji linked', () => {
    renderWithProviders(ComponentDetailKanjiList, {
      props: { kanjiList: [] }
    })

    expect(
      screen.getByText(/no kanji are currently linked/i)
    ).toBeInTheDocument()
  })

  it('displays kanji characters when present', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '休' }),
      createMockKanji({ id: 2, character: '体' })
    ]

    renderWithProviders(ComponentDetailKanjiList, {
      props: { kanjiList }
    })

    expect(screen.getByText('休')).toBeInTheDocument()
    expect(screen.getByText('体')).toBeInTheDocument()
  })

  it('links kanji to their detail pages', () => {
    const kanjiList = [createMockKanji({ id: 42, character: '休' })]

    renderWithProviders(ComponentDetailKanjiList, {
      props: { kanjiList }
    })

    const link = screen.getByRole('link', { name: '休' })
    expect(link).toHaveAttribute('href', '/kanji/42')
  })

  it('does not show empty state when kanji present', () => {
    const kanjiList = [createMockKanji()]

    renderWithProviders(ComponentDetailKanjiList, {
      props: { kanjiList }
    })

    expect(
      screen.queryByText(/no kanji are currently linked/i)
    ).not.toBeInTheDocument()
  })
})
