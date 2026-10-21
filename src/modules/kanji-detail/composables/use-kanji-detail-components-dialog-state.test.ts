/**
 * Tests for use-kanji-detail-components-dialog-state
 */

import { ref } from 'vue';

import { describe, expect, it, vi } from 'vitest';

import { useKanjiDetailComponentsDialogState } from './use-kanji-detail-components-dialog-state';

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types';
import type { EditOccurrence } from '../utils/edit-occurrence-types';
import type { Component } from '@/api/component/component-types';

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

describe('use-kanji-detail-components-dialog-state', () => {
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

  it('filters available components to exclude linked ones', () => {
    const linkedOccurrence: ComponentOccurrenceWithDetails = {
      id: 1,
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

    const props = ref({
      open: false,
      allComponents: mockComponents,
      linkedOccurrences: [linkedOccurrence],
    });

    const editOccurrences = ref<EditOccurrence[]>([{ ...linkedOccurrence, position: null }]);
    const state = useKanjiDetailComponentsDialogState(props.value, editOccurrences);

    expect(state.availableComponents.value).toHaveLength(1);
    expect(state.availableComponents.value[0]?.id).toBe(2);
  });

  it('stops offering a component once it is pending in the edit list', () => {
    const props = ref({ open: false, allComponents: mockComponents, linkedOccurrences: [] });
    const editOccurrences = ref<EditOccurrence[]>([]);
    const state = useKanjiDetailComponentsDialogState(props.value, editOccurrences);
    expect(state.availableComponents.value).toHaveLength(2);

    editOccurrences.value = [
      {
        id: null,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null,
      },
    ];

    expect(state.availableComponents.value.map((c) => c.id)).toEqual([2]);
  });
});
