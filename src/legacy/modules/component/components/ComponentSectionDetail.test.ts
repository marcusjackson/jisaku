/**
 * Tests for ComponentSectionDetail component
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentSectionDetail from './ComponentSectionDetail.vue'

import type {
  Component,
  Kanji,
  OccurrenceWithKanji
} from '@/legacy/shared/types/database-types'

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    canBeRadical: false,
    character: '亻',
    createdAt: new Date().toISOString(),
    description: 'Person radical',
    id: 1,
    searchKeywords: 'にんべん',
    kangxiMeaning: null,
    kangxiNumber: null,
    radicalNameJapanese: null,
    sourceKanjiId: null,
    strokeCount: 2,
    shortMeaning: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

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

describe('ComponentSectionDetail', () => {
  it('renders component character', () => {
    const component = createMockComponent()

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    expect(screen.getByText('亻')).toBeInTheDocument()
  })

  it('renders description section', () => {
    const component = createMockComponent({
      description: 'Person radical'
    })

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    // Description section should be visible
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('renders header edit button', () => {
    const component = createMockComponent({ id: 5 })

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    // Should have Edit button in header (not link anymore)
    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    expect(editButtons.length).toBeGreaterThan(0)
  })

  it('renders delete button (disabled by default)', () => {
    const component = createMockComponent()

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    expect(deleteButton).toBeInTheDocument()
    expect(deleteButton).toBeDisabled() // Destructive mode is off by default
  })

  it('enables delete button when destructive mode is on', () => {
    const component = createMockComponent()

    renderWithProviders(ComponentSectionDetail, {
      props: { component, isDestructiveMode: true }
    })

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    expect(deleteButton).not.toBeDisabled()
  })

  it('shows confirmation dialog when delete clicked in destructive mode', async () => {
    const user = userEvent.setup()
    const component = createMockComponent()

    renderWithProviders(ComponentSectionDetail, {
      props: { component, isDestructiveMode: true }
    })

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument()
  })

  it('emits delete event when confirmed', async () => {
    const user = userEvent.setup()
    const component = createMockComponent()
    const onDelete = vi.fn()

    renderWithProviders(ComponentSectionDetail, {
      props: {
        component,
        isDestructiveMode: true,
        onDelete: onDelete
      }
    })

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /^delete$/i }))

    expect(onDelete).toHaveBeenCalled()
  })

  it('displays linked kanji when present', () => {
    const component = createMockComponent()
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

    renderWithProviders(ComponentSectionDetail, {
      props: { component, occurrences }
    })

    expect(screen.getByText('休')).toBeInTheDocument()
    expect(screen.getByText('体')).toBeInTheDocument()
  })

  it('shows warning in delete dialog when kanji are linked', async () => {
    const user = userEvent.setup()
    const component = createMockComponent()

    renderWithProviders(ComponentSectionDetail, {
      props: {
        component,
        linkedKanjiCount: 3,
        isDestructiveMode: true
      }
    })

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByText(/linked to 3 kanji/i)).toBeInTheDocument()
  })
})
