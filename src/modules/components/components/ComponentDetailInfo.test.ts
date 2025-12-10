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
    shortMeaning: null,
    sourceKanjiId: null,
    japaneseName: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
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
    shortMeaning: null,
    radicalId: null,
    jlptLevel: null,
    joyoLevel: null,
    kenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
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
      description: 'Person radical'
    })

    renderWithProviders(ComponentDetailInfo, {
      props: { component }
    })

    // Description appears both in the Short Description field and Description section
    expect(screen.getAllByText('Person radical').length).toBeGreaterThan(0)
  })

  it('displays full description when present', () => {
    const component = createMockComponent({
      description: 'The person radical represents a standing human figure.'
    })

    renderWithProviders(ComponentDetailInfo, {
      props: { component }
    })

    // Description appears both in definition list and description section
    expect(
      screen.getAllByText(
        'The person radical represents a standing human figure.'
      ).length
    ).toBeGreaterThan(0)
    // "Description" label appears twice (in dt and h3)
    expect(screen.getAllByText('Description').length).toBeGreaterThan(0)
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
