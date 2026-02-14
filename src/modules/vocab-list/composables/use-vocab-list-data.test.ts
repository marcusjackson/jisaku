/**
 * Vocab List Data Tests
 */

import { describe, expect, it, vi } from 'vitest'

const mockVocabSearch = vi
  .fn()
  .mockReturnValue([
    { id: 1, word: '日本', kana: 'にほん', shortMeaning: 'Japan' }
  ])
const mockKanjiGetAll = vi.fn().mockReturnValue([
  { id: 1, character: '日' },
  { id: 2, character: '本' }
])

vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({
    search: mockVocabSearch
  })
}))

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getAll: mockKanjiGetAll
  })
}))

// Import after mocks are set up
import { useVocabListData } from './use-vocab-list-data'

describe('useVocabListData', () => {
  describe('loadVocabulary', () => {
    it('calls search with filters', () => {
      mockVocabSearch.mockClear()
      const { loadVocabulary } = useVocabListData()
      loadVocabulary({ isCommon: true })

      expect(mockVocabSearch).toHaveBeenCalledWith({ isCommon: true })
    })
  })

  describe('loadReferenceData', () => {
    it('calls getAll on kanji repository', () => {
      mockKanjiGetAll.mockClear()
      const { loadReferenceData } = useVocabListData()
      loadReferenceData()

      expect(mockKanjiGetAll).toHaveBeenCalled()
    })
  })

  describe('fetchError', () => {
    it('starts as null', () => {
      const { fetchError } = useVocabListData()
      expect(fetchError.value).toBeNull()
    })
  })
})
