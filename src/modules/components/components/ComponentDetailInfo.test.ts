/**
 * Tests for ComponentDetailInfo component
 */

import { renderWithProviders } from '@test/helpers/render'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailInfo from './ComponentDetailInfo.vue'

import type { Component, Kanji } from '@/shared/types/database-types'

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    id: 1,
    character: '亻',
    strokeCount: 2,
    sourceKanjiId: null,
    descriptionShort: null,
    japaneseName: null,
    description: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '人',
    strokeCount: 2,
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

describe('ComponentDetailInfo', () => {
  it('displays japanese name when present', () => {
    const component = createMockComponent({ japaneseName: 'にんべん' })

    renderWithProviders(ComponentDetailInfo, {
      props: { component }
    })

    expect(screen.getByText('にんべん')).toBeInTheDocument()
    expect(screen.getByText('Japanese Name')).toBeInTheDocument()
  })

  it('displays short description when present', () => {
    const component = createMockComponent({
      descriptionShort: 'Person radical'
    })

    renderWithProviders(ComponentDetailInfo, {
      props: { component }
    })

    expect(screen.getByText('Person radical')).toBeInTheDocument()
  })

  it('displays full description when present', () => {
    const component = createMockComponent({
      description: 'The person radical represents a standing human figure.'
    })

    renderWithProviders(ComponentDetailInfo, {
      props: { component }
    })

    expect(
      screen.getByText('The person radical represents a standing human figure.')
    ).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
  })

  it('displays source kanji link when present', () => {
    const component = createMockComponent({ sourceKanjiId: 42 })
    const sourceKanji = createMockKanji({ id: 42, character: '人' })

    renderWithProviders(ComponentDetailInfo, {
      props: { component, sourceKanji }
    })

    expect(screen.getByText('Source Kanji')).toBeInTheDocument()
    const kanjiLink = screen.getByRole('link', { name: '人' })
    expect(kanjiLink).toHaveAttribute('href', '/kanji/42')
  })

  it('displays empty state when no additional info', () => {
    const component = createMockComponent()

    renderWithProviders(ComponentDetailInfo, {
      props: { component }
    })

    expect(screen.getByText(/no additional information/i)).toBeInTheDocument()
  })

  it('does not show empty state when has info', () => {
    const component = createMockComponent({ japaneseName: 'にんべん' })

    renderWithProviders(ComponentDetailInfo, {
      props: { component }
    })

    expect(
      screen.queryByText(/no additional information/i)
    ).not.toBeInTheDocument()
  })
})
