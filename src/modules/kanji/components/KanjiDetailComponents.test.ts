/**
 * Tests for KanjiDetailComponents component
 */

import { render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import KanjiDetailComponents from './KanjiDetailComponents.vue'

import type { ComponentOccurrenceWithPosition } from '@/modules/components/composables/use-component-occurrence-repository'
import type { Component, PositionType } from '@/shared/types/database-types'

interface OccurrenceWithComponent extends ComponentOccurrenceWithPosition {
  component: Component
}

const createMockOccurrence = (
  overrides: Partial<OccurrenceWithComponent> = {}
): OccurrenceWithComponent => ({
  analysisNotes: null,
  component: {
    canBeRadical: false,
    character: '日',
    createdAt: '2024-01-01',
    description: 'sun',
    id: 1,
    japaneseName: null,
    kangxiMeaning: null,
    kangxiNumber: null,
    radicalNameJapanese: null,
    sourceKanjiId: null,
    strokeCount: 4,
    shortMeaning: null,
    updatedAt: '2024-01-01'
  },
  componentFormId: null,
  componentId: 1,
  createdAt: '2024-01-01',
  displayOrder: 0,
  id: 1,
  isRadical: false,
  kanjiId: 1,
  position: null,
  positionTypeId: null,
  updatedAt: '2024-01-01',
  ...overrides
})

const mockOccurrences: OccurrenceWithComponent[] = [
  createMockOccurrence({
    component: {
      canBeRadical: false,
      character: '日',
      createdAt: '2024-01-01',
      description: 'sun',
      id: 1,
      japaneseName: null,
      kangxiMeaning: null,
      kangxiNumber: null,
      radicalNameJapanese: null,
      sourceKanjiId: null,
      strokeCount: 4,
      shortMeaning: null,
      updatedAt: '2024-01-01'
    },
    componentId: 1,
    id: 1
  }),
  createMockOccurrence({
    component: {
      canBeRadical: false,
      character: '月',
      createdAt: '2024-01-01',
      description: 'moon',
      id: 2,
      japaneseName: null,
      kangxiMeaning: null,
      kangxiNumber: null,
      radicalNameJapanese: null,
      sourceKanjiId: null,
      strokeCount: 4,
      shortMeaning: null,
      updatedAt: '2024-01-01'
    },
    componentId: 2,
    id: 2
  })
]

describe('KanjiDetailComponents', () => {
  const defaultGlobal = {
    stubs: {
      RouterLink: RouterLinkStub
    }
  }

  it('renders component title', () => {
    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: mockOccurrences }
    })

    expect(screen.getByText('Components')).toBeInTheDocument()
  })

  it('renders all component characters', () => {
    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: mockOccurrences }
    })

    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
  })

  it('renders short meanings when available', () => {
    const occurrencesWithMeaning = [
      createMockOccurrence({
        component: {
          ...mockOccurrences[0]!.component,
          shortMeaning: 'sun, day'
        }
      }),
      createMockOccurrence({
        component: {
          ...mockOccurrences[1]!.component,
          shortMeaning: 'moon, month'
        }
      })
    ]

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: occurrencesWithMeaning }
    })

    expect(screen.getByText('sun, day')).toBeInTheDocument()
    expect(screen.getByText('moon, month')).toBeInTheDocument()
  })

  it('renders view links to component detail pages', () => {
    const wrapper = render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: mockOccurrences }
    })

    // RouterLinkStub renders as <a> elements
    const links = wrapper.container.querySelectorAll(
      '.kanji-detail-components-view-link'
    )
    expect(links).toHaveLength(2)
  })

  it('does not render section when occurrences array is empty', () => {
    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: [] }
    })

    expect(screen.queryByText('Components')).not.toBeInTheDocument()
  })

  it('handles component without short meaning', () => {
    const occurrenceWithoutMeaning = createMockOccurrence({
      component: {
        canBeRadical: false,
        character: '火',
        createdAt: '2024-01-01',
        description: null,
        id: 3,
        japaneseName: null,
        kangxiMeaning: null,
        kangxiNumber: null,
        radicalNameJapanese: null,
        sourceKanjiId: null,
        strokeCount: 4,
        shortMeaning: null,
        updatedAt: '2024-01-01'
      }
    })

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: [occurrenceWithoutMeaning] }
    })

    expect(screen.getByText('火')).toBeInTheDocument()
    // Should not crash when shortMeaning is null
  })

  it('renders position badge when position is provided', () => {
    const mockPosition: PositionType = {
      createdAt: '2024-01-01',
      description: 'Left side',
      descriptionShort: 'Left',
      displayOrder: 0,
      id: 1,
      nameEnglish: 'Left side',
      nameJapanese: 'ε΄',
      positionName: 'hen',
      updatedAt: '2024-01-01'
    }

    const occurrenceWithPosition = createMockOccurrence({
      position: mockPosition,
      positionTypeId: 1
    })

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: [occurrenceWithPosition] }
    })

    expect(screen.getByText('ε΄')).toBeInTheDocument()
  })

  it('renders radical badge when isRadical is true', () => {
    const radicalOccurrence = createMockOccurrence({
      isRadical: true
    })

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: [radicalOccurrence] }
    })

    expect(screen.getByText('🔶 Radical')).toBeInTheDocument()
  })

  it('does not render analysis notes (simplified view)', () => {
    const occurrenceWithNotes = createMockOccurrence({
      analysisNotes: 'This component provides the meaning of sun'
    })

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: [occurrenceWithNotes] }
    })

    // Analysis notes are NOT shown in simplified kanji page view
    // Users must navigate to component page to see them
    expect(
      screen.queryByText('This component provides the meaning of sun')
    ).not.toBeInTheDocument()
  })

  it('does not render metadata section when no position and not radical', () => {
    const basicOccurrence = createMockOccurrence({
      isRadical: false,
      position: null
    })

    const wrapper = render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { occurrences: [basicOccurrence] }
    })

    expect(
      wrapper.container.querySelector('.kanji-detail-components-metadata')
    ).not.toBeInTheDocument()
  })
})
