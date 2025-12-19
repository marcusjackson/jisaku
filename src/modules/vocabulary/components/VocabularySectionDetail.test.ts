/**
 * Tests for VocabularySectionDetail component
 */

import { cleanup, render, within } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import VocabularySectionDetail from './VocabularySectionDetail.vue'

import type {
  Kanji,
  VocabKanjiWithKanji,
  Vocabulary
} from '@/shared/types/database-types'

// Mock vue-router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' },
    path: '/vocabulary/1'
  }),
  RouterLink: {
    template: '<a><slot /></a>'
  }
}))

const mockVocabulary: Vocabulary = {
  id: 1,
  word: '日本',
  kana: 'にほん',
  shortMeaning: 'Japan',
  searchKeywords: 'nippon',
  jlptLevel: 'N5',
  isCommon: true,
  description: 'The country of Japan',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const mockKanji: Kanji = {
  id: 1,
  character: '日',
  strokeCount: 4,
  shortMeaning: 'sun, day',
  searchKeywords: null,
  radicalId: null,
  jlptLevel: 'N5',
  joyoLevel: 'elementary1',
  kenteiLevel: null,
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

const mockKanjiBreakdown: VocabKanjiWithKanji[] = [
  {
    id: 1,
    vocabId: 1,
    kanjiId: 1,
    analysisNotes: 'Sun/day kanji',
    displayOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    kanji: mockKanji
  }
]

describe('VocabularySectionDetail', () => {
  const defaultProps = {
    vocabulary: mockVocabulary,
    kanjiBreakdown: mockKanjiBreakdown,
    allKanji: [mockKanji]
  }

  afterEach(() => {
    cleanup()
  })

  it('renders vocabulary header with word', () => {
    const { container } = render(VocabularySectionDetail, {
      props: defaultProps
    })
    const header = container.querySelector('.vocabulary-detail-header')
    expect(header).toBeInTheDocument()
    expect(within(header as HTMLElement).getByText('日本')).toBeInTheDocument()
  })

  it('renders vocabulary kana', () => {
    const { container } = render(VocabularySectionDetail, {
      props: defaultProps
    })
    const header = container.querySelector('.vocabulary-detail-header')
    expect(
      within(header as HTMLElement).getByText('にほん')
    ).toBeInTheDocument()
  })

  it('renders Basic Information section title', () => {
    const { container } = render(VocabularySectionDetail, {
      props: defaultProps
    })
    const content = container.querySelector(
      '.vocabulary-section-detail-content'
    )
    expect(
      within(content as HTMLElement).getByText('Basic Information')
    ).toBeInTheDocument()
  })

  it('renders Kanji Breakdown section title', () => {
    const { container } = render(VocabularySectionDetail, {
      props: defaultProps
    })
    const content = container.querySelector(
      '.vocabulary-section-detail-content'
    )
    expect(
      within(content as HTMLElement).getByText('Kanji Breakdown')
    ).toBeInTheDocument()
  })

  it('renders kanji character in breakdown', () => {
    const { container } = render(VocabularySectionDetail, {
      props: defaultProps
    })
    const breakdownSection = container.querySelector(
      '.vocabulary-detail-kanji-breakdown'
    )
    expect(
      within(breakdownSection as HTMLElement).getByText('日')
    ).toBeInTheDocument()
  })

  it('renders delete button', () => {
    const { container } = render(VocabularySectionDetail, {
      props: defaultProps
    })
    const actionsArea = container.querySelector(
      '.vocabulary-section-detail-actions'
    )
    const deleteButton = within(actionsArea as HTMLElement).getByRole(
      'button',
      { name: /Delete/i }
    )
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toBeDisabled()
  })

  it('enables delete button when destructive mode is on', () => {
    const { container } = render(VocabularySectionDetail, {
      props: { ...defaultProps, isDestructiveMode: true }
    })
    const actionsArea = container.querySelector(
      '.vocabulary-section-detail-actions'
    )
    const deleteButton = within(actionsArea as HTMLElement).getByRole(
      'button',
      { name: /Delete/i }
    )
    expect(deleteButton).not.toBeDisabled()
  })
})
