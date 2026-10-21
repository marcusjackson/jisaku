/**
 * Tests for use-vocab-detail-data composable.
 */

import { effectScope, nextTick, reactive } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { Vocabulary } from '@/api/vocabulary';

const mockVocab: Vocabulary = {
  id: 1,
  word: '日本',
  kana: 'にほん',
  shortMeaning: 'Japan',
  searchKeywords: null,
  jlptLevel: 'N4',
  isCommon: true,
  description: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

const mockGetById = vi.fn<() => Vocabulary | null>(() => mockVocab);
const mockGetByVocabIdWithKanji = vi.fn(() => []);
const mockKanjiGetAll = vi.fn(() => [{ id: 1, character: '日' }]);

const mockRoute = reactive<{ params: { id?: string } }>({ params: { id: '1' } });

vi.mock('vue-router', () => ({
  useRoute: () => mockRoute,
}));

vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({ getById: mockGetById }),
  useVocabKanjiRepository: () => ({
    getByVocabIdWithKanji: mockGetByVocabIdWithKanji,
  }),
}));

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({ getAll: mockKanjiGetAll }),
}));

// Import after mocks are set up
import { useVocabDetailData as useVocabDetailDataUnscoped } from './use-vocab-detail-data';

// Each call runs in a scope that afterEach stops, so route watchers from one test
// do not fire in the next.
const scopes: ReturnType<typeof effectScope>[] = [];
function useVocabDetailData(): ReturnType<typeof useVocabDetailDataUnscoped> {
  const scope = effectScope();
  scopes.push(scope);
  return scope.run(() => useVocabDetailDataUnscoped())!;
}

describe('useVocabDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRoute.params = { id: '1' };
    mockGetById.mockReturnValue(mockVocab);
    mockGetByVocabIdWithKanji.mockReturnValue([]);
    mockKanjiGetAll.mockReturnValue([{ id: 1, character: '日' }]);
  });

  afterEach(() => {
    scopes.splice(0).forEach((scope) => {
      scope.stop();
    });
  });

  it('returns all expected state refs', () => {
    const data = useVocabDetailData();

    expect(data.vocab).toBeDefined();
    expect(data.kanjiBreakdown).toBeDefined();
    expect(data.allKanji).toBeDefined();
    expect(data.isLoading).toBeDefined();
    expect(data.loadError).toBeDefined();
    expect(data.vocabId).toBeDefined();
  });

  it('loads vocab data on initialization', () => {
    const data = useVocabDetailData();

    expect(mockGetById).toHaveBeenCalledWith(1);
    expect(data.vocab.value).toEqual(mockVocab);
  });

  it('sets isLoading to false after successful load', () => {
    const data = useVocabDetailData();

    expect(data.isLoading.value).toBe(false);
  });

  it('loads kanji breakdown and all kanji', () => {
    const data = useVocabDetailData();

    expect(mockGetByVocabIdWithKanji).toHaveBeenCalledWith(1);
    expect(mockKanjiGetAll).toHaveBeenCalled();
    expect(data.kanjiBreakdown.value).toEqual([]);
    expect(data.allKanji.value).toEqual([{ id: 1, character: '日' }]);
  });

  it('sets loadError when vocab is not found', () => {
    mockGetById.mockReturnValue(null);

    const data = useVocabDetailData();

    expect(data.loadError.value).toBe('Vocabulary with ID 1 not found');
    expect(data.vocab.value).toBeNull();
  });

  it('sets loadError on repository exception', () => {
    mockGetById.mockImplementation(() => {
      throw new Error('DB error');
    });

    const data = useVocabDetailData();

    expect(data.loadError.value).toBe('DB error');
    expect(data.isLoading.value).toBe(false);
  });

  it('derives vocabId from route params', () => {
    const data = useVocabDetailData();

    expect(data.vocabId.value).toBe(1);
  });

  it('reloads when the route id changes', async () => {
    const data = useVocabDetailData();
    mockGetById.mockReturnValue({ ...mockVocab, id: 2 });

    mockRoute.params = { id: '2' };
    await nextTick();

    expect(mockGetById).toHaveBeenLastCalledWith(2);
    expect(data.vocab.value?.id).toBe(2);
  });

  it('keeps the loaded entry when the route drops its id', async () => {
    const data = useVocabDetailData();
    mockGetById.mockClear();

    mockRoute.params = {};
    await nextTick();

    expect(mockGetById).not.toHaveBeenCalled();
    expect(data.vocab.value).toEqual(mockVocab);
    expect(data.loadError.value).toBeNull();
  });

  it('reports a non-numeric id as not found', () => {
    mockRoute.params = { id: 'abc' };
    mockGetById.mockReturnValue(null);

    const data = useVocabDetailData();

    expect(data.loadError.value).toBe('Vocabulary with ID NaN not found');
    expect(data.isLoading.value).toBe(false);
  });

  it('does not load the breakdown or kanji list when the entry is missing', () => {
    mockGetById.mockReturnValue(null);

    useVocabDetailData();

    expect(mockGetByVocabIdWithKanji).not.toHaveBeenCalled();
    expect(mockKanjiGetAll).not.toHaveBeenCalled();
  });
});
