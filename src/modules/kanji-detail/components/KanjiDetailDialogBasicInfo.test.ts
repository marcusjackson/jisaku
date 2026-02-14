/**
 * Tests for KanjiDetailDialogBasicInfo component.
 *
 * @module modules/kanji-detail
 */

import { defineComponent } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailDialogBasicInfo from './KanjiDetailDialogBasicInfo.vue'

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

const defaultProps = {
  open: true,
  kanji: mockKanji(),
  radical: mockRadical(),
  allComponents: [mockRadical()],
  classifications: [] as KanjiClassification[],
  classificationTypes: [mockClassificationType()]
}

// Mock BaseDialog to render without teleport
vi.mock('@/base/components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  const MockDialog = defineComponent({
    name: 'BaseDialog',
    props: {
      open: { type: Boolean, required: true },
      title: { type: String, default: '' }
    },
    emits: ['update:open'],
    setup(_props, { emit }) {
      const handleClose = () => {
        emit('update:open', false)
      }
      return { handleClose }
    },
    template: `
      <div v-if="open" data-testid="dialog">
        <h2>{{ title }}</h2>
        <slot></slot>
        <button type="button" @click="handleClose">Close</button>
      </div>
    `
  })
  return {
    ...original,
    BaseDialog: MockDialog
  }
})

// Stub child components
vi.mock('./KanjiDetailBasicInfoFormFields.vue', () => ({
  default: {
    name: 'KanjiDetailBasicInfoFormFields',
    template: '<div data-testid="form-fields-stub">Form Fields</div>',
    props: ['allComponents', 'strokeCountError']
  }
}))

vi.mock('./KanjiDetailBasicInfoClassificationsList.vue', () => ({
  default: {
    name: 'KanjiDetailBasicInfoClassificationsList',
    template:
      '<div data-testid="classifications-list-stub">Classifications</div>',
    props: ['classificationsState', 'classificationTypes']
  }
}))

describe('KanjiDetailDialogBasicInfo', () => {
  describe('dialog rendering', () => {
    it('renders dialog title', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps })
      expect(screen.getByText('Edit Basic Information')).toBeInTheDocument()
    })

    it('renders form fields component', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps })
      expect(screen.getByTestId('form-fields-stub')).toBeInTheDocument()
    })

    it('renders classifications list component', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps })
      expect(
        screen.getByTestId('classifications-list-stub')
      ).toBeInTheDocument()
    })

    it('renders save and cancel buttons', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps })
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })
  })

  describe('cancel behavior', () => {
    it('emits update:open false when cancel is clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogBasicInfo, {
        props: defaultProps
      })

      await user.click(screen.getByRole('button', { name: /cancel/i }))

      expect(emitted()['update:open']).toContainEqual([false])
    })
  })

  describe('save behavior', () => {
    it('emits save and update:open when form is submitted', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogBasicInfo, {
        props: defaultProps
      })

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(emitted()['save']).toHaveLength(1)
      expect(emitted()['update:open']).toContainEqual([false])
    })
  })

  describe('not open', () => {
    it('does not render content when not open', () => {
      render(KanjiDetailDialogBasicInfo, {
        props: { ...defaultProps, open: false }
      })
      expect(
        screen.queryByText('Edit Basic Information')
      ).not.toBeInTheDocument()
    })
  })
})
