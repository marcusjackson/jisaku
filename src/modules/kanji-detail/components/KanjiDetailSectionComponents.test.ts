/**
 * Tests for KanjiDetailSectionComponents
 */

import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import KanjiDetailSectionComponents from './KanjiDetailSectionComponents.vue';

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types';
import type { Component } from '@/api/component/component-types';

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

// Stub the dialog so the section's save handling is tested on its own
vi.mock('./KanjiDetailDialogComponents.vue', () => ({
  default: {
    name: 'KanjiDetailDialogComponents',
    template:
      '<div data-testid="dialog-stub" v-if="open"><button type="button" @click="$emit(\'save\', { toLink: [], toUpdate: [], toDelete: [] })">Save stub</button></div>',
    props: ['open', 'allComponents', 'linkedOccurrences', 'destructiveMode', 'create'],
    emits: ['update:open', 'save'],
  },
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
];

const mockOccurrences: ComponentOccurrenceWithDetails[] = [];

describe('KanjiDetailSectionComponents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section title', () => {
    render(KanjiDetailSectionComponents, {
      props: {
        linkedOccurrences: mockOccurrences,
        allComponents: mockComponents,
        destructiveMode: false,
        create: () => true,
        save: () => true,
      },
    });

    expect(screen.getByText('Components')).toBeInTheDocument();
  });

  it('renders edit button', () => {
    render(KanjiDetailSectionComponents, {
      props: {
        linkedOccurrences: mockOccurrences,
        allComponents: mockComponents,
        destructiveMode: false,
        create: () => true,
        save: () => true,
      },
    });

    expect(screen.getByRole('button', { name: 'Edit components' })).toBeInTheDocument();
  });

  it('renders empty state when no occurrences', () => {
    render(KanjiDetailSectionComponents, {
      props: {
        linkedOccurrences: [],
        allComponents: mockComponents,
        destructiveMode: false,
        create: () => true,
        save: () => true,
      },
    });

    expect(screen.getByText(/No components have been linked/i)).toBeInTheDocument();
  });

  it.each([
    [true, false],
    [false, true],
  ])('with save returning %s the dialog stays open: %s', async (saved, staysOpen) => {
    const user = userEvent.setup();
    const save = vi.fn(() => saved);
    render(KanjiDetailSectionComponents, {
      props: {
        linkedOccurrences: mockOccurrences,
        allComponents: mockComponents,
        destructiveMode: false,
        create: () => true,
        save,
      },
    });

    await user.click(screen.getByRole('button', { name: 'Edit components' }));
    await user.click(screen.getByRole('button', { name: 'Save stub' }));

    expect(save).toHaveBeenCalledTimes(1);
    expect(Boolean(screen.queryByTestId('dialog-stub'))).toBe(staysOpen);
  });
});
