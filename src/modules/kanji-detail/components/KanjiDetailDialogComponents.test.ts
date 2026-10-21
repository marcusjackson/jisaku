/**
 * Tests for KanjiDetailDialogComponents
 */

import { userEvent } from '@testing-library/user-event';
import { render, screen, waitFor, within } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import KanjiDetailDialogComponents from './KanjiDetailDialogComponents.vue';

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types';
import type { Component } from '@/api/component/component-types';

// BaseDialog portals its content out of reach of the test queries; render it inline instead.
vi.mock('@/base/components/BaseDialog.vue', async () => {
  const { defineComponent } = await import('vue');
  return {
    default: defineComponent({
      name: 'BaseDialog',
      props: { open: { type: Boolean, required: true }, title: { type: String, default: '' } },
      emits: ['update:open'],
      template: `<section v-if="open" role="dialog" :aria-label="title">
        <h2>{{ title }}</h2><slot /><slot name="footer" />
      </section>`,
    }),
  };
});

// Mock composables that rely on database
vi.mock('@/api/component/component-form-repository', () => ({
  useComponentFormRepository: () => ({
    getByParentId: vi.fn(() => []),
  }),
}));

vi.mock('@/api/position/position-type-repository', () => ({
  usePositionTypeRepository: () => ({
    getAll: vi.fn(() => []),
  }),
}));

const mockComponents: Component[] = [
  {
    id: 1,
    character: '日',
    shortMeaning: 'sun',
    strokeCount: 4,
    searchKeywords: '',
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
  },
  {
    id: 2,
    character: '月',
    shortMeaning: 'moon',
    strokeCount: 4,
    searchKeywords: '',
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: '',
  },
];

const sun = mockComponents[0]!;
const moon = mockComponents[1]!;

const linkedSun: ComponentOccurrenceWithDetails = {
  id: 10,
  kanjiId: 1,
  componentId: 1,
  positionTypeId: null,
  componentFormId: null,
  isRadical: false,
  analysisNotes: null,
  displayOrder: 0,
  createdAt: '',
  updatedAt: '',
  component: { id: 1, character: '日', shortMeaning: 'sun' },
  position: null,
  form: null,
};

function renderDialog(overrides: Record<string, unknown> = {}) {
  return render(KanjiDetailDialogComponents, {
    props: {
      open: true,
      allComponents: mockComponents,
      linkedOccurrences: [],
      create: () => true,
      destructiveMode: false,
      ...overrides,
    },
  });
}

const linkedHeading = (count: number) => screen.queryByText(`Linked Components (${String(count)})`);

describe('KanjiDetailDialogComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows an editor card for a picked search result', async () => {
    const user = userEvent.setup();
    renderDialog();
    expect(linkedHeading(1)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /月/ }));

    expect(linkedHeading(1)).toBeInTheDocument();
    expect(screen.getByLabelText('Position')).toBeInTheDocument();
  });

  it('keeps one card, and stops offering the component, after it is picked', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole('button', { name: /月/ }));

    expect(linkedHeading(1)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /月/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /日/ })).toBeInTheDocument();
  });

  it('links a component that arrived in the list after the dialog was created', async () => {
    const user = userEvent.setup();
    const { rerender } = renderDialog({ allComponents: [sun] });

    await rerender({ allComponents: [sun, moon] });
    await user.click(screen.getByRole('button', { name: /月/ }));

    expect(linkedHeading(1)).toBeInTheDocument();
  });

  it('keeps a saved link when the unlink confirmation is cancelled', async () => {
    const user = userEvent.setup();
    renderDialog({ linkedOccurrences: [linkedSun], destructiveMode: true });
    expect(linkedHeading(1)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Unlink' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm Unlink' });
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog', { name: 'Confirm Unlink' })).not.toBeInTheDocument();
    expect(linkedHeading(1)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Unlink' })).toBeInTheDocument();
  });

  it('takes a saved link off the list once the unlink is confirmed', async () => {
    const user = userEvent.setup();
    renderDialog({ linkedOccurrences: [linkedSun], destructiveMode: true });

    await user.click(screen.getByRole('button', { name: 'Unlink' }));
    const dialog = screen.getByRole('dialog', { name: 'Confirm Unlink' });
    await user.click(within(dialog).getByRole('button', { name: 'Unlink' }));

    expect(linkedHeading(1)).not.toBeInTheDocument();
  });

  it('links a quick-created component once it appears in the list', async () => {
    const user = userEvent.setup();
    const create = vi.fn(() => true);
    const { rerender } = renderDialog({ allComponents: [sun], create });

    await user.type(screen.getByRole('textbox', { name: /search/i }), '月');
    await user.click(screen.getByRole('button', { name: /Create New Component/ }));
    await user.click(screen.getByRole('button', { name: /Create & View/ }));
    await waitFor(() => {
      expect(create).toHaveBeenCalledTimes(1);
    });

    await rerender({ allComponents: [sun, moon] });
    await user.type(screen.getByRole('textbox', { name: /search/i }), '月');
    await user.click(screen.getByRole('button', { name: /月/ }));

    expect(linkedHeading(1)).toBeInTheDocument();
  });
});
