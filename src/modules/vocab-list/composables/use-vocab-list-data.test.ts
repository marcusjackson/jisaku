/**
 * Vocab List Data Tests
 */

import { describe, expect, it, vi } from 'vitest';

const mockVocabSearch = vi
  .fn()
  .mockReturnValue([{ id: 1, word: '日本', kana: 'にほん', shortMeaning: 'Japan' }]);
const mockKanjiGetAll = vi.fn().mockReturnValue([
  { id: 1, character: '日' },
  { id: 2, character: '本' },
]);

vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({
    search: mockVocabSearch,
  }),
}));

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getAll: mockKanjiGetAll,
  }),
}));

const toastError = vi.hoisted(() => vi.fn());

vi.mock('@/shared/composables', () => ({
  useToast: () => ({ error: toastError, success: vi.fn() }),
}));

// Import after mocks are set up
import { useVocabListData } from './use-vocab-list-data';

describe('useVocabListData', () => {
  describe('loadVocabulary', () => {
    it('calls search with filters', () => {
      mockVocabSearch.mockClear();
      const { loadVocabulary } = useVocabListData();
      loadVocabulary({ isCommon: true });

      expect(mockVocabSearch).toHaveBeenCalledWith({ isCommon: true });
    });
  });

  describe('loadReferenceData', () => {
    it('calls getAll on kanji repository', () => {
      mockKanjiGetAll.mockClear();
      const { loadReferenceData } = useVocabListData();
      loadReferenceData();

      expect(mockKanjiGetAll).toHaveBeenCalled();
    });
  });

  describe('fetchError', () => {
    it('starts as null', () => {
      const { fetchError } = useVocabListData();
      expect(fetchError.value).toBeNull();
    });
  });

  describe('load failures', () => {
    it('toasts the error and sets fetchError when a load throws', () => {
      toastError.mockClear();
      mockVocabSearch.mockImplementationOnce(() => {
        throw new Error('driver error');
      });
      const { fetchError, loadVocabulary } = useVocabListData();

      loadVocabulary({});

      expect(fetchError.value?.message).toBe('driver error');
      expect(toastError).toHaveBeenCalledWith('driver error');
    });

    it('keeps the previous list and clears fetchError on the next load', () => {
      const { fetchError, loadVocabulary, vocabList } = useVocabListData();
      loadVocabulary({});
      const previous = vocabList.value;
      mockVocabSearch.mockImplementationOnce(() => {
        throw new Error('driver error');
      });

      loadVocabulary({});
      expect(vocabList.value).toBe(previous);

      loadVocabulary({});
      expect(fetchError.value).toBeNull();
    });
  });
});
