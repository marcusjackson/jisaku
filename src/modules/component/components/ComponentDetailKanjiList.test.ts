/**
 * Tests for ComponentDetailKanjiList component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailKanjiList from './ComponentDetailKanjiList.vue'

import type { Kanji, OccurrenceWithKanji } from '@/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '休',
    createdAt: new Date().toISOString(),
    id: 1,
    identifier: null,
    jlptLevel: null,
    joyoLevel: null,
    kenteiLevel: null,
    notesEducationMnemonics: null,
    notesEtymology: null,
    notesPersonal: null,
    notesSemantic: null,
    radicalId: null,
    radicalStrokeCount: null,
    searchKeywords: null,
    strokeCount: 6,
    shortMeaning: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockOccurrence(
  overrides: Partial<OccurrenceWithKanji> = {}
): OccurrenceWithKanji {
  return {
    analysisNotes: null,
    componentFormId: null,
    componentId: 1,
    createdAt: new Date().toISOString(),
    displayOrder: 0,
    id: 1,
    isRadical: false,
    kanji: createMockKanji(),
    kanjiId: 1,
    position: null,
    positionTypeId: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('ComponentDetailKanjiList', () => {
  it('renders title', () => {
    renderWithProviders(ComponentDetailKanjiList, {
      props: {
        allKanji: [],
        componentId: 1,
        occurrences: []
      }
    })

    expect(screen.getByText('Kanji Using This Component')).toBeInTheDocument()
  })

  it('displays empty state when no kanji linked', () => {
    renderWithProviders(ComponentDetailKanjiList, {
      props: {
        allKanji: [],
        componentId: 1,
        occurrences: []
      }
    })

    expect(
      screen.getByText(/no kanji are currently linked/i)
    ).toBeInTheDocument()
  })

  it('displays kanji characters when present', () => {
    const occurrences = [
      createMockOccurrence({
        id: 1,
        kanji: createMockKanji({ id: 1, character: '休' })
      }),
      createMockOccurrence({
        id: 2,
        kanji: createMockKanji({ id: 2, character: '体' })
      })
    ]

    renderWithProviders(ComponentDetailKanjiList, {
      props: {
        allKanji: [],
        componentId: 1,
        occurrences
      }
    })

    expect(screen.getByText('休')).toBeInTheDocument()
    expect(screen.getByText('体')).toBeInTheDocument()
  })

  it('links kanji to their detail pages', () => {
    const occurrences = [
      createMockOccurrence({
        id: 1,
        kanji: createMockKanji({ id: 42, character: '休' })
      })
    ]

    renderWithProviders(ComponentDetailKanjiList, {
      props: {
        allKanji: [],
        componentId: 1,
        occurrences
      }
    })

    const link = screen.getByRole('link', { name: '休' })
    expect(link).toHaveAttribute('href', '/kanji/42')
  })

  it('does not show empty state when kanji present', () => {
    const occurrences = [createMockOccurrence()]

    renderWithProviders(ComponentDetailKanjiList, {
      props: {
        allKanji: [],
        componentId: 1,
        occurrences
      }
    })

    expect(
      screen.queryByText(/no kanji are currently linked/i)
    ).not.toBeInTheDocument()
  })
})
