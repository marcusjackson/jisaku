/**
 * Tests for KanjiSectionDetail component
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionDetail from './KanjiSectionDetail.vue'

import type { Kanji } from '@/shared/types/database-types'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '日',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: 'Sun, day',
    identifier: null,
    radicalStrokeCount: null,
    radicalId: null,
    strokeCount: 4,
    shortMeaning: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiSectionDetail', () => {
  it('renders kanji character', () => {
    const kanji = createMockKanji()

    renderWithProviders(KanjiSectionDetail, {
      props: { kanji }
    })

    expect(screen.getByText('日')).toBeInTheDocument()
  })

  it('renders badges', () => {
    const kanji = createMockKanji({ jlptLevel: 'N5' })

    renderWithProviders(KanjiSectionDetail, {
      props: { kanji }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
  })

  it('renders notes', () => {
    const kanji = createMockKanji({ notesPersonal: 'Test notes' })

    renderWithProviders(KanjiSectionDetail, {
      props: { kanji }
    })

    expect(screen.getByText('Test notes')).toBeInTheDocument()
  })

  it('renders edit button with link', () => {
    const kanji = createMockKanji({ id: 5 })

    renderWithProviders(KanjiSectionDetail, {
      props: { kanji }
    })

    const editLink = screen.getByRole('link', { name: /edit/i })
    expect(editLink).toHaveAttribute('href', '/kanji/5/edit')
  })

  it('renders delete button', () => {
    const kanji = createMockKanji()

    renderWithProviders(KanjiSectionDetail, {
      props: { kanji }
    })

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog when delete clicked', async () => {
    const user = userEvent.setup()
    const kanji = createMockKanji()

    renderWithProviders(KanjiSectionDetail, {
      props: { kanji }
    })

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('emits delete event when confirmed', async () => {
    const user = userEvent.setup()
    const kanji = createMockKanji()
    const onDelete = vi.fn()

    renderWithProviders(KanjiSectionDetail, {
      props: { kanji, onDelete }
    })

    await user.click(screen.getByRole('button', { name: /^delete$/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(onDelete).toHaveBeenCalled()
  })

  it('disables delete button when isDeleting', () => {
    const kanji = createMockKanji()

    renderWithProviders(KanjiSectionDetail, {
      props: { isDeleting: true, kanji }
    })

    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled()
  })
})
