/**
 * Tests for VocabularyDetailKanjiBreakdown component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VocabularyDetailKanjiBreakdown from './VocabularyDetailKanjiBreakdown.vue'

import type { Kanji, VocabKanjiWithKanji } from '@/shared/types/database-types'

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

const mockKanji1: Kanji = {
  id: 1,
  character: '水',
  strokeCount: 4,
  shortMeaning: 'water',
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

const mockKanji2: Kanji = {
  id: 2,
  character: '泳',
  strokeCount: 8,
  shortMeaning: 'swim',
  searchKeywords: null,
  radicalId: null,
  jlptLevel: 'N4',
  joyoLevel: 'elementary3',
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
    analysisNotes: 'Water component',
    displayOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    kanji: mockKanji1
  },
  {
    id: 2,
    vocabId: 1,
    kanjiId: 2,
    analysisNotes: null,
    displayOrder: 1,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    kanji: mockKanji2
  }
]

describe('VocabularyDetailKanjiBreakdown', () => {
  const defaultProps = {
    kanjiBreakdown: mockKanjiBreakdown,
    allKanji: [mockKanji1, mockKanji2]
  }

  it('renders kanji characters', () => {
    render(VocabularyDetailKanjiBreakdown, { props: defaultProps })

    expect(screen.getByText('水')).toBeInTheDocument()
    expect(screen.getByText('泳')).toBeInTheDocument()
  })

  it('renders kanji meanings', () => {
    render(VocabularyDetailKanjiBreakdown, { props: defaultProps })

    expect(screen.getByText('water')).toBeInTheDocument()
    expect(screen.getByText('swim')).toBeInTheDocument()
  })

  it('shows empty state when no kanji in breakdown', () => {
    render(VocabularyDetailKanjiBreakdown, {
      props: { ...defaultProps, kanjiBreakdown: [] }
    })

    expect(screen.getByText(/No kanji in breakdown/)).toBeInTheDocument()
  })

  it('renders arrow buttons for reordering', () => {
    render(VocabularyDetailKanjiBreakdown, { props: defaultProps })

    // Should have up and down buttons for each kanji
    const upButtons = screen.getAllByRole('button', { name: /↑/ })
    const downButtons = screen.getAllByRole('button', { name: /↓/ })

    expect(upButtons.length).toBe(2)
    expect(downButtons.length).toBe(2)
  })

  it('disables up button for first item', () => {
    render(VocabularyDetailKanjiBreakdown, { props: defaultProps })

    const upButtons = screen.getAllByRole('button', { name: /↑/ })
    expect(upButtons[0]).toBeDisabled()
  })

  it('disables down button for last item', () => {
    render(VocabularyDetailKanjiBreakdown, { props: defaultProps })

    const downButtons = screen.getAllByRole('button', { name: /↓/ })
    expect(downButtons[1]).toBeDisabled()
  })

  it('does not show delete buttons when destructive mode is off', () => {
    render(VocabularyDetailKanjiBreakdown, {
      props: { ...defaultProps, isDestructiveMode: false }
    })

    const deleteButtons = screen.queryAllByRole('button', { name: /×/ })
    expect(deleteButtons.length).toBe(0)
  })

  it('shows delete buttons when destructive mode is on', () => {
    render(VocabularyDetailKanjiBreakdown, {
      props: { ...defaultProps, isDestructiveMode: true }
    })

    const deleteButtons = screen.getAllByRole('button', { name: /×/ })
    expect(deleteButtons.length).toBe(2)
  })

  it('renders search for adding kanji', () => {
    render(VocabularyDetailKanjiBreakdown, { props: defaultProps })

    expect(screen.getByPlaceholderText(/Search for kanji/)).toBeInTheDocument()
  })

  it('emits reorder when down button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(VocabularyDetailKanjiBreakdown, {
      props: defaultProps
    })

    const downButtons = screen.getAllByRole('button', { name: /↓/ })
    await user.click(downButtons[0]!)

    expect(wrapper.emitted()).toHaveProperty('reorder')
    // After moving first item down, order should be [2, 1]
    expect(wrapper.emitted()['reorder']?.[0]).toEqual([[2, 1]])
  })

  it('emits reorder when up button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(VocabularyDetailKanjiBreakdown, {
      props: defaultProps
    })

    const upButtons = screen.getAllByRole('button', { name: /↑/ })
    await user.click(upButtons[1]!)

    expect(wrapper.emitted()).toHaveProperty('reorder')
    // After moving second item up, order should be [2, 1]
    expect(wrapper.emitted()['reorder']?.[0]).toEqual([[2, 1]])
  })
})
