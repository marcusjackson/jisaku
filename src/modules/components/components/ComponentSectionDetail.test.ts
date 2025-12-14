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
} from '@/shared/types/database-types'

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

  it('renders short description', () => {
    const component = createMockComponent({
      description: 'Person radical'
    })

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    // Description appears in multiple places in ComponentDetailInfo
    expect(screen.getAllByText('Person radical').length).toBeGreaterThan(0)
  })

  it('renders description when present', () => {
    const component = createMockComponent({
      description: 'Person radical description'
    })

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    expect(screen.getByText('Person radical description')).toBeInTheDocument()
  })

  it('renders edit button with link', () => {
    const component = createMockComponent({ id: 5 })

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    const editLink = screen.getByRole('link', { name: /edit/i })
    expect(editLink).toHaveAttribute('href', '/components/5/edit')
  })

  it('renders delete button', () => {
    const component = createMockComponent()

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument()
  })

  it('shows confirmation dialog when delete clicked', async () => {
    const user = userEvent.setup()
    const component = createMockComponent()

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
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
        linkedKanjiCount: 3
      }
    })

    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(screen.getByText(/linked to 3 kanji/i)).toBeInTheDocument()
  })
})
