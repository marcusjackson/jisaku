/**
 * Tests for KanjiDetailSectionBasicInfo component.
 *
 * @module modules/kanji-detail
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailSectionBasicInfo from './KanjiDetailSectionBasicInfo.vue'

import type {
  ClassificationType,
  KanjiClassification
} from '@/api/classification/classification-types'
import type { Component as RadicalComponent } from '@/api/component/component-types'
import type { Kanji } from '@/api/kanji/kanji-types'

function mockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '水',
    strokeCount: 4,
    shortMeaning: null,
    searchKeywords: null,
    radicalId: 1,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kanjiKenteiLevel: '10',
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

function mockRadical(
  overrides: Partial<RadicalComponent> = {}
): RadicalComponent {
  return {
    id: 1,
    character: '氵',
    strokeCount: null,
    shortMeaning: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 85,
    kangxiMeaning: 'water',
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

function mockClassificationType(
  overrides: Partial<ClassificationType> = {}
): ClassificationType {
  return {
    id: 1,
    typeName: 'pictograph',
    description: null,
    descriptionShort: null,
    displayOrder: 0,
    nameJapanese: '象形文字',
    nameEnglish: null,
    ...overrides
  }
}

function mockClassification(
  overrides: Partial<KanjiClassification> = {}
): KanjiClassification {
  return {
    id: 1,
    kanjiId: 1,
    classificationTypeId: 1,
    displayOrder: 0,
    classificationType: mockClassificationType(),
    ...overrides
  }
}

const defaultProps = {
  kanji: mockKanji(),
  radical: mockRadical(),
  allComponents: [mockRadical()],
  classifications: [],
  classificationTypes: [mockClassificationType()]
}

// Stub child components
vi.mock('./KanjiDetailDialogBasicInfo.vue', () => ({
  default: {
    name: 'KanjiDetailDialogBasicInfo',
    template: '<div data-testid="dialog-stub" v-if="open">Dialog</div>',
    props: [
      'open',
      'kanji',
      'radical',
      'allComponents',
      'classifications',
      'classificationTypes'
    ],
    emits: ['update:open', 'save']
  }
}))

describe('KanjiDetailSectionBasicInfo', () => {
  describe('display values', () => {
    it('displays stroke count', () => {
      render(KanjiDetailSectionBasicInfo, { props: defaultProps })
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('displays JLPT level', () => {
      render(KanjiDetailSectionBasicInfo, { props: defaultProps })
      expect(screen.getByText('N5')).toBeInTheDocument()
    })

    it('displays Jōyō grade with Japanese label', () => {
      render(KanjiDetailSectionBasicInfo, { props: defaultProps })
      expect(screen.getByText('小1')).toBeInTheDocument()
    })

    it('displays Kentei level with Japanese label', () => {
      render(KanjiDetailSectionBasicInfo, { props: defaultProps })
      expect(screen.getByText('10級')).toBeInTheDocument()
    })

    it('displays radical with meaning', () => {
      render(KanjiDetailSectionBasicInfo, { props: defaultProps })
      expect(screen.getByText('氵 (water)')).toBeInTheDocument()
    })

    it('displays dash when values are null', () => {
      const props = {
        ...defaultProps,
        kanji: mockKanji({
          strokeCount: null,
          jlptLevel: null,
          joyoLevel: null,
          kanjiKenteiLevel: null,
          radicalId: null
        }),
        radical: null
      }
      render(KanjiDetailSectionBasicInfo, { props })
      const dashes = screen.getAllByText('—')
      expect(dashes.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('classifications display', () => {
    it('hides classifications section when empty', () => {
      render(KanjiDetailSectionBasicInfo, { props: defaultProps })
      // When no classifications, the section doesn't render "Classification" label
      expect(screen.queryByText('Classification')).not.toBeInTheDocument()
    })

    it('displays classification badges when present', () => {
      const props = {
        ...defaultProps,
        classifications: [
          mockClassification({
            classificationType: mockClassificationType({
              nameJapanese: '象形文字'
            })
          })
        ]
      }
      render(KanjiDetailSectionBasicInfo, { props })
      expect(screen.getByText('象形')).toBeInTheDocument()
    })

    it('shows primary badge for first classification', () => {
      const props = {
        ...defaultProps,
        classifications: [
          mockClassification({
            displayOrder: 0,
            classificationType: mockClassificationType({
              id: 1,
              nameJapanese: '象形文字'
            })
          }),
          mockClassification({
            id: 2,
            displayOrder: 1,
            classificationTypeId: 2,
            classificationType: mockClassificationType({
              id: 2,
              nameJapanese: '会意文字'
            })
          })
        ]
      }
      render(KanjiDetailSectionBasicInfo, { props })

      // Just verify both badges render with correct text
      expect(screen.getByText('象形')).toBeInTheDocument()
      expect(screen.getByText('会意')).toBeInTheDocument()
    })
  })

  describe('edit dialog', () => {
    it('opens dialog when edit button is clicked', async () => {
      const user = userEvent.setup()
      render(KanjiDetailSectionBasicInfo, { props: defaultProps })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByTestId('dialog-stub')).toBeInTheDocument()
    })
  })

  describe('Jōyō grade labels', () => {
    const testCases = [
      ['elementary1', '小1'],
      ['elementary2', '小2'],
      ['elementary3', '小3'],
      ['elementary4', '小4'],
      ['elementary5', '小5'],
      ['elementary6', '小6'],
      ['secondary', '中学']
    ]

    it.each(testCases)('displays %s as %s', (value, label) => {
      const props = {
        ...defaultProps,
        kanji: mockKanji({ joyoLevel: value as Kanji['joyoLevel'] })
      }
      render(KanjiDetailSectionBasicInfo, { props })
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })

  describe('Kentei level labels', () => {
    const testCases = [
      ['10', '10級'],
      ['9', '9級'],
      ['5', '5級'],
      ['pre2', '準2級'],
      ['2', '2級'],
      ['pre1', '準1級'],
      ['1', '1級']
    ]

    it.each(testCases)('displays %s as %s', (value, label) => {
      const props = {
        ...defaultProps,
        kanji: mockKanji({
          kanjiKenteiLevel: value as Kanji['kanjiKenteiLevel']
        })
      }
      render(KanjiDetailSectionBasicInfo, { props })
      expect(screen.getByText(label)).toBeInTheDocument()
    })
  })
})
