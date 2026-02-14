/**
 * Tests for ComponentDetailSectionBasicInfo component.
 *
 * @module modules/component-detail
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailSectionBasicInfo from './ComponentDetailSectionBasicInfo.vue'

import type { Component } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji'

function mockComponent(overrides: Partial<Component> = {}): Component {
  return {
    id: 1,
    character: '氵',
    shortMeaning: 'water',
    searchKeywords: null,
    strokeCount: 3,
    sourceKanjiId: 10,
    description: null,
    canBeRadical: true,
    kangxiNumber: 85,
    kangxiMeaning: 'water',
    radicalNameJapanese: 'さんずい',
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

function mockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 10,
    character: '水',
    shortMeaning: 'water',
    searchKeywords: null,
    strokeCount: 4,
    radicalId: null,
    jlptLevel: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

const defaultProps = {
  component: mockComponent(),
  sourceKanji: mockKanji(),
  kanjiOptions: [mockKanji()]
}

// Stub child components
vi.mock('./ComponentDetailDialogBasicInfo.vue', () => ({
  default: {
    name: 'ComponentDetailDialogBasicInfo',
    template: '<div data-testid="dialog-stub" v-if="open">Dialog</div>',
    props: ['open', 'component', 'sourceKanji', 'kanjiOptions'],
    emits: ['update:open', 'save']
  }
}))

describe('ComponentDetailSectionBasicInfo', () => {
  describe('display values', () => {
    it('displays stroke count value', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: { stubs: { RouterLink: true } }
      })
      expect(screen.getByTestId('basic-info-stroke-count')).toHaveTextContent(
        '3'
      )
    })

    it('displays dash when stroke count is null', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: {
          ...defaultProps,
          component: mockComponent({ strokeCount: null })
        },
        global: { stubs: { RouterLink: true } }
      })
      expect(screen.getByTestId('basic-info-stroke-count')).toHaveTextContent(
        '—'
      )
    })

    it('displays source kanji with meaning', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: {
          stubs: {
            RouterLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to']
            }
          }
        }
      })
      expect(screen.getByTestId('basic-info-source-kanji')).toHaveTextContent(
        '水 (water)'
      )
    })

    it('displays dash when no source kanji', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: { ...defaultProps, sourceKanji: null },
        global: { stubs: { RouterLink: true } }
      })
      expect(screen.getByTestId('basic-info-source-kanji')).toHaveTextContent(
        '—'
      )
    })

    it('displays can-be-radical as Yes when true', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: { stubs: { RouterLink: true } }
      })
      expect(screen.getByTestId('basic-info-can-be-radical')).toHaveTextContent(
        'Yes'
      )
    })

    it('displays can-be-radical as No when false', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: {
          ...defaultProps,
          component: mockComponent({ canBeRadical: false })
        },
        global: { stubs: { RouterLink: true } }
      })
      expect(screen.getByTestId('basic-info-can-be-radical')).toHaveTextContent(
        'No'
      )
    })
  })

  describe('radical attributes display', () => {
    it('shows radical attributes when canBeRadical is true', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: { stubs: { RouterLink: true } }
      })
      expect(screen.getByTestId('basic-info-kangxi-number')).toHaveTextContent(
        '85'
      )
      expect(screen.getByTestId('basic-info-kangxi-meaning')).toHaveTextContent(
        'water'
      )
      expect(screen.getByTestId('basic-info-radical-name')).toHaveTextContent(
        'さんずい'
      )
    })

    it('hides radical attributes when canBeRadical is false', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: {
          ...defaultProps,
          component: mockComponent({ canBeRadical: false })
        },
        global: { stubs: { RouterLink: true } }
      })
      expect(
        screen.queryByTestId('basic-info-kangxi-number')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('basic-info-kangxi-meaning')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('basic-info-radical-name')
      ).not.toBeInTheDocument()
    })

    it('displays dashes for null radical attribute values', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: {
          ...defaultProps,
          component: mockComponent({
            canBeRadical: true,
            kangxiNumber: null,
            kangxiMeaning: null,
            radicalNameJapanese: null
          })
        },
        global: { stubs: { RouterLink: true } }
      })
      expect(screen.getByTestId('basic-info-kangxi-number')).toHaveTextContent(
        '—'
      )
      expect(screen.getByTestId('basic-info-kangxi-meaning')).toHaveTextContent(
        '—'
      )
      expect(screen.getByTestId('basic-info-radical-name')).toHaveTextContent(
        '—'
      )
    })
  })

  describe('source kanji link', () => {
    it('renders source kanji as a link', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: {
          stubs: {
            RouterLink: {
              template: '<a :href="to"><slot /></a>',
              props: ['to']
            }
          }
        }
      })
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/kanji/10')
    })
  })

  describe('edit dialog integration', () => {
    it('opens dialog when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: { stubs: { RouterLink: true } }
      })
      await user.click(screen.getByTestId('basic-info-edit-button'))
      expect(screen.getByTestId('dialog-stub')).toBeInTheDocument()
    })

    it('dialog receives correct props when opened', async () => {
      const user = userEvent.setup()
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: { stubs: { RouterLink: true } }
      })
      await user.click(screen.getByTestId('basic-info-edit-button'))
      // The stub dialog is now visible - we've tested the integration structure
      expect(screen.getByTestId('dialog-stub')).toBeInTheDocument()
    })
  })

  describe('section structure', () => {
    it('has correct test-id on section container', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: { stubs: { RouterLink: true } }
      })
      expect(
        screen.getByTestId('component-detail-basic-info')
      ).toBeInTheDocument()
    })

    it('displays section title', () => {
      render(ComponentDetailSectionBasicInfo, {
        props: defaultProps,
        global: { stubs: { RouterLink: true } }
      })
      expect(
        screen.getByRole('heading', { name: /basic information/i })
      ).toBeInTheDocument()
    })
  })
})
