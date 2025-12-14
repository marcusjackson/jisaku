/**
 * Tests for KanjiDetailComponents component
 */

import { render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import KanjiDetailComponents from './KanjiDetailComponents.vue'

import type { ComponentOccurrenceWithPosition } from '@/shared/composables/use-component-occurrence-repository'
import type { Component, PositionType } from '@/shared/types/database-types'

interface OccurrenceWithComponent extends ComponentOccurrenceWithPosition {
  component: Component
}

const createMockComponent = (
  overrides: Partial<Component> = {}
): Component => ({
  canBeRadical: false,
  character: '日',
  createdAt: '2024-01-01',
  description: 'sun',
  id: 1,
  searchKeywords: null,
  kangxiMeaning: null,
  kangxiNumber: null,
  radicalNameJapanese: null,
  sourceKanjiId: null,
  strokeCount: 4,
  shortMeaning: null,
  updatedAt: '2024-01-01',
  ...overrides
})

const createMockOccurrence = (
  overrides: Partial<OccurrenceWithComponent> = {}
): OccurrenceWithComponent => ({
  analysisNotes: null,
  component: createMockComponent(),
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
    component: createMockComponent({
      character: '日',
      description: 'sun',
      id: 1
    }),
    componentId: 1,
    id: 1
  }),
  createMockOccurrence({
    component: createMockComponent({
      character: '月',
      description: 'moon',
      id: 2
    }),
    componentId: 2,
    id: 2
  })
]

const mockAllComponents: Component[] = [
  createMockComponent({ character: '日', id: 1 }),
  createMockComponent({ character: '月', id: 2 }),
  createMockComponent({ character: '水', id: 3 })
]

describe('KanjiDetailComponents', () => {
  const defaultGlobal = {
    stubs: {
      RouterLink: RouterLinkStub,
      SharedEntitySearch: { template: '<div>Entity Search</div>' },
      SharedQuickCreateComponent: { template: '<div>Quick Create</div>' }
    }
  }

  const defaultProps = {
    occurrences: mockOccurrences,
    kanjiId: 1,
    allComponents: mockAllComponents
  }

  it('renders Add button', () => {
    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: defaultProps
    })

    // Add button should be present
    expect(screen.getByText('+ Add')).toBeInTheDocument()
  })

  it('renders all component characters', () => {
    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: defaultProps
    })

    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
  })

  it('renders short meanings when available', () => {
    const occurrencesWithMeaning = [
      createMockOccurrence({
        component: createMockComponent({
          character: '日',
          shortMeaning: 'sun, day'
        })
      }),
      createMockOccurrence({
        component: createMockComponent({
          character: '月',
          shortMeaning: 'moon, month'
        })
      })
    ]

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { ...defaultProps, occurrences: occurrencesWithMeaning }
    })

    expect(screen.getByText('sun, day')).toBeInTheDocument()
    expect(screen.getByText('moon, month')).toBeInTheDocument()
  })

  it('renders view links to component detail pages', () => {
    const wrapper = render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: defaultProps
    })

    // RouterLinkStub renders as <a> elements
    const links = wrapper.container.querySelectorAll(
      '.kanji-detail-components-view-link'
    )
    expect(links).toHaveLength(2)
  })

  it('renders empty state message when occurrences array is empty', () => {
    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { ...defaultProps, occurrences: [] }
    })

    expect(
      screen.getByText('No components linked. Click "+ Add" to add components.')
    ).toBeInTheDocument()
  })

  it('handles component without short meaning', () => {
    const occurrenceWithoutMeaning = createMockOccurrence({
      component: createMockComponent({
        character: '火',
        description: null,
        id: 3,
        shortMeaning: null
      })
    })

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { ...defaultProps, occurrences: [occurrenceWithoutMeaning] }
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
      props: { ...defaultProps, occurrences: [occurrenceWithPosition] }
    })

    expect(screen.getByText('ε΄')).toBeInTheDocument()
  })

  it('renders radical badge when isRadical is true', () => {
    const radicalOccurrence = createMockOccurrence({
      isRadical: true
    })

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { ...defaultProps, occurrences: [radicalOccurrence] }
    })

    expect(screen.getByText('🔶 Radical')).toBeInTheDocument()
  })

  it('does not render analysis notes (simplified view)', () => {
    const occurrenceWithNotes = createMockOccurrence({
      analysisNotes: 'This component provides the meaning of sun'
    })

    render(KanjiDetailComponents, {
      global: defaultGlobal,
      props: { ...defaultProps, occurrences: [occurrenceWithNotes] }
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
      props: { ...defaultProps, occurrences: [basicOccurrence] }
    })

    expect(
      wrapper.container.querySelector('.kanji-detail-components-metadata')
    ).not.toBeInTheDocument()
  })
})
