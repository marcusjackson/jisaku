/**
 * Tests for use-vocab-detail-data composable.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Vocabulary } from '@/api/vocabulary'

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
  updatedAt: '2025-01-01T00:00:00.000Z'
}

const mockGetById = vi.fn<() => Vocabulary | null>(() => mockVocab)
const mockGetByVocabIdWithKanji = vi.fn(() => [])
const mockKanjiGetAll = vi.fn(() => [{ id: 1, character: '日' }])

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } })
}))

vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({ getById: mockGetById }),
  useVocabKanjiRepository: () => ({
    getByVocabIdWithKanji: mockGetByVocabIdWithKanji
  })
}))

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({ getAll: mockKanjiGetAll })
}))

// Import after mocks are set up
import { useVocabDetailData } from './use-vocab-detail-data'

describe('useVocabDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetById.mockReturnValue(mockVocab)
    mockGetByVocabIdWithKanji.mockReturnValue([])
    mockKanjiGetAll.mockReturnValue([{ id: 1, character: '日' }])
  })

  it('returns all expected state refs', () => {
    const data = useVocabDetailData()

    expect(data.vocab).toBeDefined()
    expect(data.kanjiBreakdown).toBeDefined()
    expect(data.allKanji).toBeDefined()
    expect(data.isLoading).toBeDefined()
    expect(data.loadError).toBeDefined()
    expect(data.vocabId).toBeDefined()
  })

  it('loads vocab data on initialization', () => {
    const data = useVocabDetailData()

    expect(mockGetById).toHaveBeenCalledWith(1)
    expect(data.vocab.value).toEqual(mockVocab)
  })

  it('sets isLoading to false after successful load', () => {
    const data = useVocabDetailData()

    expect(data.isLoading.value).toBe(false)
  })

  it('loads kanji breakdown and all kanji', () => {
    const data = useVocabDetailData()

    expect(mockGetByVocabIdWithKanji).toHaveBeenCalledWith(1)
    expect(mockKanjiGetAll).toHaveBeenCalled()
    expect(data.kanjiBreakdown.value).toEqual([])
    expect(data.allKanji.value).toEqual([{ id: 1, character: '日' }])
  })

  it('sets loadError when vocab is not found', () => {
    mockGetById.mockReturnValue(null)

    const data = useVocabDetailData()

    expect(data.loadError.value).toBe('Vocabulary with ID 1 not found')
    expect(data.vocab.value).toBeNull()
  })

  it('sets loadError on repository exception', () => {
    mockGetById.mockImplementation(() => {
      throw new Error('DB error')
    })

    const data = useVocabDetailData()

    expect(data.loadError.value).toBe('DB error')
    expect(data.isLoading.value).toBe(false)
  })

  it('derives vocabId from route params', () => {
    const data = useVocabDetailData()

    expect(data.vocabId.value).toBe(1)
  })
})
