/**
 * Tests for VocabularyKanjiBreakdownCard component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VocabularyKanjiBreakdownCard from './VocabularyKanjiBreakdownCard.vue'

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

const mockKanji: Kanji = {
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

const mockVocabKanji: VocabKanjiWithKanji = {
  id: 1,
  vocabId: 1,
  kanjiId: 1,
  analysisNotes: 'Water component analysis',
  displayOrder: 0,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  kanji: mockKanji
}

describe('VocabularyKanjiBreakdownCard', () => {
  const defaultProps = {
    vocabKanji: mockVocabKanji,
    canMoveUp: true,
    canMoveDown: true,
    isDestructiveMode: false
  }

  it('renders kanji character', () => {
    render(VocabularyKanjiBreakdownCard, { props: defaultProps })

    expect(screen.getByText('水')).toBeInTheDocument()
  })

  it('renders kanji short meaning', () => {
    render(VocabularyKanjiBreakdownCard, { props: defaultProps })

    expect(screen.getByText('water')).toBeInTheDocument()
  })

  it('renders analysis notes in textarea', () => {
    render(VocabularyKanjiBreakdownCard, { props: defaultProps })

    const textarea = screen.getByLabelText(/Analysis Notes/)
    expect(textarea).toHaveValue('Water component analysis')
  })

  it('renders up and down buttons', () => {
    render(VocabularyKanjiBreakdownCard, { props: defaultProps })

    expect(screen.getByRole('button', { name: /↑/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /↓/ })).toBeInTheDocument()
  })

  it('disables up button when canMoveUp is false', () => {
    render(VocabularyKanjiBreakdownCard, {
      props: { ...defaultProps, canMoveUp: false }
    })

    expect(screen.getByRole('button', { name: /↑/ })).toBeDisabled()
  })

  it('disables down button when canMoveDown is false', () => {
    render(VocabularyKanjiBreakdownCard, {
      props: { ...defaultProps, canMoveDown: false }
    })

    expect(screen.getByRole('button', { name: /↓/ })).toBeDisabled()
  })

  it('does not show delete button when destructive mode is off', () => {
    render(VocabularyKanjiBreakdownCard, { props: defaultProps })

    expect(screen.queryByRole('button', { name: /×/ })).not.toBeInTheDocument()
  })

  it('shows delete button when destructive mode is on', () => {
    render(VocabularyKanjiBreakdownCard, {
      props: { ...defaultProps, isDestructiveMode: true }
    })

    expect(screen.getByRole('button', { name: /×/ })).toBeInTheDocument()
  })

  it('emits moveUp when up button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(VocabularyKanjiBreakdownCard, {
      props: defaultProps
    })

    await user.click(screen.getByRole('button', { name: /↑/ }))

    expect(wrapper.emitted()).toHaveProperty('moveUp')
  })

  it('emits moveDown when down button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(VocabularyKanjiBreakdownCard, {
      props: defaultProps
    })

    await user.click(screen.getByRole('button', { name: /↓/ }))

    expect(wrapper.emitted()).toHaveProperty('moveDown')
  })

  it('emits remove when delete button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(VocabularyKanjiBreakdownCard, {
      props: { ...defaultProps, isDestructiveMode: true }
    })

    await user.click(screen.getByRole('button', { name: /×/ }))

    expect(wrapper.emitted()).toHaveProperty('remove')
  })

  it('shows save button when notes are edited', async () => {
    const user = userEvent.setup()
    render(VocabularyKanjiBreakdownCard, { props: defaultProps })

    const textarea = screen.getByLabelText(/Analysis Notes/)
    await user.type(textarea, ' updated')

    const saveButton = screen.getByRole('button', { name: 'Save Notes' })
    expect(saveButton).not.toBeDisabled()
  })

  it('emits saveNotes when save button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(VocabularyKanjiBreakdownCard, {
      props: defaultProps
    })

    const textarea = screen.getByLabelText(/Analysis Notes/)
    await user.type(textarea, ' updated')

    const saveButton = screen.getByRole('button', { name: 'Save Notes' })
    await user.click(saveButton)

    expect(wrapper.emitted()).toHaveProperty('saveNotes')
    expect(wrapper.emitted()['saveNotes']?.[0]).toEqual([
      'Water component analysis updated'
    ])
  })
})
