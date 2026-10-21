/**
 * Tests for KanjiDetailDialogBasicInfo component.
 *
 * @module modules/kanji-detail
 */

import { defineComponent } from 'vue';

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { describe, expect, it, vi } from 'vitest';

import KanjiDetailDialogBasicInfo from './KanjiDetailDialogBasicInfo.vue';

import type {
  ClassificationType,
  KanjiClassification,
} from '@/api/classification/classification-types';
import type { Component as RadicalComponent } from '@/api/component/component-types';
import type { Kanji } from '@/api/kanji/kanji-types';

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
    ...overrides,
  };
}

function mockRadical(overrides: Partial<RadicalComponent> = {}): RadicalComponent {
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
    ...overrides,
  };
}

function mockClassificationType(overrides: Partial<ClassificationType> = {}): ClassificationType {
  return {
    id: 1,
    typeName: 'pictograph',
    description: null,
    descriptionShort: null,
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    nameJapanese: '象形文字',
    nameEnglish: null,
    ...overrides,
  };
}

const defaultProps = {
  open: true,
  kanji: mockKanji(),
  radical: mockRadical(),
  allComponents: [mockRadical()],
  classifications: [] as KanjiClassification[],
  classificationTypes: [mockClassificationType()],
};

// Mock BaseDialog to render without teleport
vi.mock('@/base/components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>();
  const MockDialog = defineComponent({
    name: 'BaseDialog',
    props: {
      open: { type: Boolean, required: true },
      title: { type: String, default: '' },
    },
    emits: ['update:open'],
    setup(_props, { emit }) {
      const handleClose = () => {
        emit('update:open', false);
      };
      return { handleClose };
    },
    template: `
      <div v-if="open" data-testid="dialog">
        <h2>{{ title }}</h2>
        <slot></slot>
        <button type="button" @click="handleClose">Close</button>
      </div>
    `,
  });
  return {
    ...original,
    BaseDialog: MockDialog,
  };
});

// Stub child components
vi.mock('./KanjiDetailBasicInfoFormFields.vue', () => ({
  default: {
    name: 'KanjiDetailBasicInfoFormFields',
    template: `
      <div data-testid="form-fields-stub">
        Form Fields
        <button type="button" @click="$emit('update:strokeCount', 2.5)">stroke 2.5</button>
        <button type="button" @click="$emit('update:strokeCount', 65)">stroke 65</button>
        <button type="button" @click="$emit('update:strokeCount', null)">stroke none</button>
        <button type="button" @click="$emit('createRadical', '新')">new radical</button>
        <p v-if="strokeCountError" role="alert">{{ strokeCountError }}</p>
      </div>
    `,
    props: ['allComponents', 'strokeCountError'],
    emits: ['update:strokeCount', 'createRadical'],
  },
}));

vi.mock('./KanjiDetailBasicInfoClassificationsList.vue', () => ({
  default: {
    name: 'KanjiDetailBasicInfoClassificationsList',
    template: '<div data-testid="classifications-list-stub">Classifications</div>',
    props: ['classificationsState', 'classificationTypes'],
  },
}));

describe('KanjiDetailDialogBasicInfo', () => {
  describe('dialog rendering', () => {
    it('renders dialog title', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps });
      expect(screen.getByText('Edit Basic Information')).toBeInTheDocument();
    });

    it('renders form fields component', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps });
      expect(screen.getByTestId('form-fields-stub')).toBeInTheDocument();
    });

    it('renders classifications list component', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps });
      expect(screen.getByTestId('classifications-list-stub')).toBeInTheDocument();
    });

    it('renders save and cancel buttons', () => {
      render(KanjiDetailDialogBasicInfo, { props: defaultProps });
      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });
  });

  describe('cancel behavior', () => {
    it('emits update:open false when cancel is clicked', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailDialogBasicInfo, {
        props: defaultProps,
      });

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(emitted()['update:open']).toContainEqual([false]);
    });
  });

  describe('save behavior', () => {
    it('emits save without closing itself when the form is submitted', async () => {
      const user = userEvent.setup();
      const { emitted } = render(KanjiDetailDialogBasicInfo, {
        props: defaultProps,
      });

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(emitted()['save']).toHaveLength(1);
      expect(emitted()['update:open']).toBeUndefined();
    });
  });

  describe('save payload', () => {
    async function openDialog(kanji: Kanji) {
      const user = userEvent.setup();
      const view = render(KanjiDetailDialogBasicInfo, {
        props: { ...defaultProps, open: false, kanji },
      });
      await view.rerender({ open: true });
      return { user, ...view };
    }

    it('emits the kanji values, with unset levels as null', async () => {
      const kanji = mockKanji({
        strokeCount: null,
        jlptLevel: null,
        joyoLevel: null,
        kanjiKenteiLevel: null,
        radicalId: null,
      });
      const { emitted, user } = await openDialog(kanji);

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(emitted()['save']).toEqual([
        [
          {
            strokeCount: null,
            jlptLevel: null,
            joyoLevel: null,
            kanjiKenteiLevel: null,
            radicalId: null,
            classifications: [],
          },
        ],
      ]);
    });

    it('emits the current levels and radical when they are set', async () => {
      const { emitted, user } = await openDialog(mockKanji());

      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(emitted()['save']).toEqual([
        [
          {
            strokeCount: 4,
            jlptLevel: 'N5',
            joyoLevel: 'elementary1',
            kanjiKenteiLevel: '10',
            radicalId: 1,
            classifications: [],
          },
        ],
      ]);
    });

    it('emits the character to create when a new radical is chosen', async () => {
      const { emitted, user } = await openDialog(mockKanji());

      await user.click(screen.getByRole('button', { name: 'new radical' }));
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(emitted()['save']).toEqual([
        [expect.objectContaining({ radicalId: null, newRadicalCharacter: '新' })],
      ]);
    });

    it('saves an emptied stroke count as null', async () => {
      const { emitted, user } = await openDialog(mockKanji());

      await user.click(screen.getByRole('button', { name: 'stroke none' }));
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(emitted()['save']).toEqual([[expect.objectContaining({ strokeCount: null })]]);
    });

    it.each([
      ['65', 'stroke 65'],
      ['2.5', 'stroke 2.5'],
    ])('rejects a stroke count of %s with "Must be 1-64" and emits no save', async (_n, button) => {
      const { emitted, user } = await openDialog(mockKanji());

      await user.click(screen.getByRole('button', { name: button }));
      await user.click(screen.getByRole('button', { name: /save/i }));

      expect(emitted()['save']).toBeUndefined();
      expect(screen.getByRole('alert')).toHaveTextContent('Must be 1-64');
    });
  });

  describe('not open', () => {
    it('does not render content when not open', () => {
      render(KanjiDetailDialogBasicInfo, {
        props: { ...defaultProps, open: false },
      });
      expect(screen.queryByText('Edit Basic Information')).not.toBeInTheDocument();
    });
  });
});
