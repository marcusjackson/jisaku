/**
 * Tests for ComponentSectionDetail component
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentSectionDetail from './ComponentSectionDetail.vue'

import type { Component, Kanji } from '@/shared/types/database-types'

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    character: '亻',
    createdAt: new Date().toISOString(),
    description: null,
    descriptionShort: 'Person radical',
    id: 1,
    japaneseName: 'にんべん',
    sourceKanjiId: null,
    strokeCount: 2,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '休',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: null,
    joyoLevel: null,
    notesEtymology: null,
    notesCultural: null,
    notesPersonal: null,
    radicalId: null,
    strokeCount: 6,
    strokeDiagramImage: null,
    strokeGifImage: null,
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
      descriptionShort: 'Person radical'
    })

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    expect(screen.getByText('Person radical')).toBeInTheDocument()
  })

  it('renders japanese name', () => {
    const component = createMockComponent({ japaneseName: 'にんべん' })

    renderWithProviders(ComponentSectionDetail, {
      props: { component }
    })

    expect(screen.getByText('にんべん')).toBeInTheDocument()
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
    const linkedKanji = [
      createMockKanji({ id: 1, character: '休' }),
      createMockKanji({ id: 2, character: '体' })
    ]

    renderWithProviders(ComponentSectionDetail, {
      props: { component, linkedKanji }
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
