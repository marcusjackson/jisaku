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
    kenteiLevel: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    searchKeywords: null,
    radicalId: null,
    strokeCount: 4,
    shortMeaning: null,
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

  it('renders different characters correctly', () => {
    const kanji = createMockKanji({ character: '漢' })

    renderWithProviders(KanjiDetailHeader, {
      props: { kanji }
    })

    expect(screen.getByText('漢')).toBeInTheDocument()
  })
})
