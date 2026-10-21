/**
 * Tests for use-kanji-detail-components-occurrences
 */

import { ref } from 'vue';

import { describe, expect, it, vi } from 'vitest';

import { refreshOccurrenceDetails } from './use-kanji-detail-components-occurrences';

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types';
import type { OccurrenceRefreshContext } from './use-kanji-detail-components-occurrences';
import type { Kanji } from '@/api/kanji/kanji-types';

function createContext(kanji: Kanji | null): OccurrenceRefreshContext {
  return {
    state: {
      kanji: ref(kanji),
      componentOccurrences: ref<ComponentOccurrenceWithDetails[]>([]),
    },
    componentRepo: {
      getById: vi.fn(() => ({ id: 7, character: '日', shortMeaning: 'sun' })),
    },
    occurrenceRepo: {
      getByParentId: vi.fn(() => [
        { id: 1, componentId: 7, positionTypeId: null, componentFormId: null },
      ]),
    },
    positionRepo: { getById: vi.fn() },
    formRepo: { getById: vi.fn() },
  } as never;
}

describe('refreshOccurrenceDetails', () => {
  it('does nothing without a kanji', () => {
    const ctx = createContext(null);

    refreshOccurrenceDetails(ctx);

    expect(ctx.state.componentOccurrences.value).toEqual([]);
  });

  it('fills each occurrence with its component and no position or form', () => {
    const ctx = createContext({ id: 3 } as Kanji);

    refreshOccurrenceDetails(ctx);

    expect(ctx.state.componentOccurrences.value).toHaveLength(1);
    expect(ctx.state.componentOccurrences.value[0]).toMatchObject({
      component: { id: 7, character: '日', shortMeaning: 'sun' },
      form: null,
      position: null,
    });
  });
});
