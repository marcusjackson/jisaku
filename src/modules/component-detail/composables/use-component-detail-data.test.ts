/**
 * Tests for use-component-detail-data composable.
 */

import { nextTick, reactive } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Component } from '@/api/component';
import type { Kanji } from '@/api/kanji';

const mockComponent: Component = {
  id: 1,
  character: '木',
  strokeCount: null,
  shortMeaning: 'tree',
  searchKeywords: null,
  sourceKanjiId: null,
  description: null,
  canBeRadical: false,
  kangxiNumber: null,
  kangxiMeaning: null,
  radicalNameJapanese: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockComponentGetById = vi.fn<() => Component | null>(() => mockComponent);
const mockFormGetByParentId = vi.fn(() => []);
const mockGroupingGetByParentId = vi.fn(() => []);
const mockGroupingGetMembersByComponentId = vi.fn(() => new Map());
const mockOccurrenceGetByComponentIdWithKanji = vi.fn(() => []);
const mockKanjiGetAll = vi.fn(() => [{ id: 1, character: '日' }]);
const mockKanjiGetById = vi.fn<() => Kanji | null>(() => null);
const mockPositionTypeGetAll = vi.fn(() => []);

const route = reactive({ params: { id: '1' } });

vi.mock('vue-router', () => ({
  useRoute: () => route,
}));

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({ getById: mockComponentGetById }),
  useComponentFormRepository: () => ({
    getByParentId: mockFormGetByParentId,
  }),
  useComponentGroupingRepository: () => ({
    getByParentId: mockGroupingGetByParentId,
    getMembersByComponentId: mockGroupingGetMembersByComponentId,
  }),
  useComponentOccurrenceRepository: () => ({
    getByComponentIdWithKanji: mockOccurrenceGetByComponentIdWithKanji,
  }),
}));

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getAll: mockKanjiGetAll,
    getById: mockKanjiGetById,
  }),
}));

vi.mock('@/api/position', () => ({
  usePositionTypeRepository: () => ({ getAll: mockPositionTypeGetAll }),
}));

// Import after mocks are set up
import { useComponentDetailData } from './use-component-detail-data';

describe('useComponentDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    route.params.id = '1';
    mockComponentGetById.mockReturnValue(mockComponent);
    mockFormGetByParentId.mockReturnValue([]);
    mockGroupingGetByParentId.mockReturnValue([]);
    mockGroupingGetMembersByComponentId.mockReturnValue(new Map());
    mockOccurrenceGetByComponentIdWithKanji.mockReturnValue([]);
    mockKanjiGetAll.mockReturnValue([{ id: 1, character: '日' }]);
    mockKanjiGetById.mockReturnValue(null);
    mockPositionTypeGetAll.mockReturnValue([]);
  });

  it('loads component data on initialization', () => {
    const data = useComponentDetailData();

    expect(mockComponentGetById).toHaveBeenCalledWith(1);
    expect(data.component.value).toEqual(mockComponent);
  });

  it('sets isLoading to false after successful load', () => {
    const data = useComponentDetailData();

    expect(data.isLoading.value).toBe(false);
  });

  it('loads all related data collections', () => {
    const data = useComponentDetailData();

    expect(mockFormGetByParentId).toHaveBeenCalledWith(1);
    expect(mockGroupingGetByParentId).toHaveBeenCalledWith(1);
    expect(mockGroupingGetMembersByComponentId).toHaveBeenCalledWith(1);
    expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(1);
    expect(mockKanjiGetAll).toHaveBeenCalled();
    expect(mockPositionTypeGetAll).toHaveBeenCalled();
    expect(data.forms.value).toEqual([]);
    expect(data.kanjiOptions.value).toEqual([{ id: 1, character: '日' }]);
  });

  it('sets loadError when component is not found', () => {
    mockComponentGetById.mockReturnValue(null);

    const data = useComponentDetailData();

    expect(data.loadError.value).toBe('Component with ID 1 not found');
    expect(data.component.value).toBeNull();
  });

  it('sets loadError on repository exception', () => {
    mockComponentGetById.mockImplementation(() => {
      throw new Error('DB error');
    });

    const data = useComponentDetailData();

    expect(data.loadError.value).toBe('DB error');
    expect(data.isLoading.value).toBe(false);
  });

  it('resolves sourceKanji when sourceKanjiId is set', () => {
    const mockKanji = { id: 5, character: '木' };
    mockComponentGetById.mockReturnValue({ ...mockComponent, sourceKanjiId: 5 });
    mockKanjiGetById.mockReturnValue(mockKanji as unknown as Kanji);

    const data = useComponentDetailData();

    expect(mockKanjiGetById).toHaveBeenCalledWith(5);
    expect(data.sourceKanji.value).toEqual(mockKanji);
  });

  it('keeps the failure message when a later query throws', () => {
    mockPositionTypeGetAll.mockImplementation(() => {
      throw new Error('Position types failed');
    });

    const data = useComponentDetailData();

    expect(data.loadError.value).toBe('Position types failed');
    expect(data.isLoading.value).toBe(false);
  });

  it('reloads everything when the route id changes', async () => {
    const data = useComponentDetailData();
    mockComponentGetById.mockReturnValue({ ...mockComponent, id: 2, character: '林' });

    route.params.id = '2';
    await nextTick();

    expect(mockComponentGetById).toHaveBeenLastCalledWith(2);
    expect(mockFormGetByParentId).toHaveBeenLastCalledWith(2);
    expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenLastCalledWith(2);
    expect(data.componentId.value).toBe(2);
    expect(data.component.value?.character).toBe('林');
  });

  it('clears the load error after navigating to a component that loads', async () => {
    mockComponentGetById.mockReturnValueOnce(null);
    const data = useComponentDetailData();
    expect(data.loadError.value).toBe('Component with ID 1 not found');

    route.params.id = '2';
    await nextTick();

    expect(data.loadError.value).toBeNull();
    expect(data.component.value).toEqual(mockComponent);
  });

  it('derives componentId from route params', () => {
    const data = useComponentDetailData();

    expect(data.componentId.value).toBe(1);
  });
});
