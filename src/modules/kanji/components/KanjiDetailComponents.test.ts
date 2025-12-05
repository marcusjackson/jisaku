/**
 * Tests for KanjiDetailComponents component
 */

import { render, screen } from '@testing-library/vue'
import { RouterLinkStub } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import KanjiDetailComponents from './KanjiDetailComponents.vue'

import type { Component } from '@/shared/types/database-types'

const mockComponents: Component[] = [
  {
    id: 1,
    character: '日',
    strokeCount: 4,
    sourceKanjiId: null,
    descriptionShort: 'sun',
    japaneseName: null,
    description: 'The sun radical',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '月',
    strokeCount: 4,
    sourceKanjiId: null,
    descriptionShort: 'moon',
    japaneseName: null,
    description: 'The moon radical',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('KanjiDetailComponents', () => {
  const defaultGlobal = {
    stubs: {
      RouterLink: RouterLinkStub
    }
  }

  it('renders component title', () => {
    render(KanjiDetailComponents, {
      props: { components: mockComponents },
      global: defaultGlobal
    })

    expect(screen.getByText('Components')).toBeInTheDocument()
  })

  it('renders all component characters', () => {
    render(KanjiDetailComponents, {
      props: { components: mockComponents },
      global: defaultGlobal
    })

    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
  })

  it('renders component descriptions', () => {
    render(KanjiDetailComponents, {
      props: { components: mockComponents },
      global: defaultGlobal
    })

    expect(screen.getByText('sun')).toBeInTheDocument()
    expect(screen.getByText('moon')).toBeInTheDocument()
  })

  it('renders links to component detail pages', () => {
    const wrapper = render(KanjiDetailComponents, {
      props: { components: mockComponents },
      global: defaultGlobal
    })

    // RouterLinkStub renders as <a> elements without href (has to attribute instead)
    const links = wrapper.container.querySelectorAll(
      '.kanji-detail-components-link'
    )
    expect(links).toHaveLength(2)
  })

  it('does not render section when components array is empty', () => {
    render(KanjiDetailComponents, {
      props: { components: [] },
      global: defaultGlobal
    })

    expect(screen.queryByText('Components')).not.toBeInTheDocument()
  })

  it('handles component without description', () => {
    const componentWithoutDesc: Component[] = [
      {
        id: 1,
        character: '火',
        strokeCount: 4,
        sourceKanjiId: null,
        descriptionShort: null,
        japaneseName: null,
        description: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    render(KanjiDetailComponents, {
      props: { components: componentWithoutDesc },
      global: defaultGlobal
    })

    expect(screen.getByText('火')).toBeInTheDocument()
    // Should not render description element
    expect(screen.queryByText('sun')).not.toBeInTheDocument()
  })
})
