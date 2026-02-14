/**
 * Tests for use-kanji-detail-vocabulary-handlers composable.
 *
 * @module modules/kanji-detail
 */

import { ref } from 'vue'

import { createTestVocabKanjiWithVocabulary } from '@test/helpers/vocabulary-test-helpers'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailVocabularyHandlers } from './use-kanji-detail-vocabulary-handlers'

import type { QuickCreateVocabularyData } from '../kanji-detail-types'
import type { Kanji } from '@/api/kanji/kanji-types'
import type {
  CreateVocabKanjiInput,
  CreateVocabularyInput,
  VocabKanji,
  VocabKanjiWithVocabulary,
  Vocabulary
} from '@/api/vocabulary'

// Mock Kanji factory
function createTestKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '日',
    shortMeaning: null,
    searchKeywords: null,
    radicalId: null,
    strokeCount: 4,
    jlptLevel: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
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
    ...overrides
  }
}

// Mock toast
vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    toasts: { value: [] },
    addToast: vi.fn(),
    removeToast: vi.fn()
  })
}))

// Mock repositories
const mockVocabKanjiRepository = {
  getByKanjiIdWithVocabulary: vi.fn(() => [] as VocabKanjiWithVocabulary[]),
  create: vi.fn((input: CreateVocabKanjiInput) => ({
    id: 1,
    vocabId: input.vocabId,
    kanjiId: input.kanjiId,
    analysisNotes: null,
    displayOrder: 0,
    createdAt: '',
    updatedAt: ''
  })),
  remove: vi.fn()
}

const mockVocabularyRepository = {
  create: vi.fn(
    (input: CreateVocabularyInput): Vocabulary => ({
      id: 999,
      word: input.word,
      kana: input.kana,
      shortMeaning: input.shortMeaning ?? null,
      searchKeywords: null,
      jlptLevel: null,
      isCommon: false,
      description: null,
      createdAt: '',
      updatedAt: ''
    })
  )
}

vi.mock('@/api/vocabulary', () => ({
  useVocabKanjiRepository: () => mockVocabKanjiRepository,
  useVocabularyRepository: () => mockVocabularyRepository
}))

function createMockState() {
  return {
    kanji: ref<Kanji | null>(createTestKanji()),
    vocabulary: ref<VocabKanjiWithVocabulary[]>([])
  }
}

describe('useKanjiDetailVocabularyHandlers', () => {
  let state: ReturnType<typeof createMockState>

  beforeEach(() => {
    state = createMockState()
    vi.clearAllMocks()
  })

  describe('handleLink', () => {
    it('links vocabulary to kanji', () => {
      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleLink(5)

      expect(mockVocabKanjiRepository.create).toHaveBeenCalledWith({
        vocabId: 5,
        kanjiId: 1
      })
    })

    it('does not link if vocabulary already linked', () => {
      state.vocabulary.value = [
        createTestVocabKanjiWithVocabulary({
          vocabulary: { id: 5 } as Vocabulary,
          vocabKanji: { id: 1, vocabId: 5, kanjiId: 1 } as VocabKanji
        })
      ]

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleLink(5)

      expect(mockVocabKanjiRepository.create).not.toHaveBeenCalled()
    })

    it('does not link if no kanji selected', () => {
      state.kanji.value = null

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleLink(5)

      expect(mockVocabKanjiRepository.create).not.toHaveBeenCalled()
    })

    it('refreshes vocabulary list after linking', () => {
      mockVocabKanjiRepository.getByKanjiIdWithVocabulary.mockReturnValue([
        createTestVocabKanjiWithVocabulary()
      ])

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleLink(5)

      expect(
        mockVocabKanjiRepository.getByKanjiIdWithVocabulary
      ).toHaveBeenCalledWith(1)
      expect(state.vocabulary.value).toHaveLength(1)
    })
  })

  describe('handleUnlink', () => {
    it('unlinks vocabulary from kanji', () => {
      state.vocabulary.value = [
        createTestVocabKanjiWithVocabulary({
          vocabulary: { id: 5 } as Vocabulary,
          vocabKanji: { id: 10, vocabId: 5, kanjiId: 1 } as VocabKanji
        })
      ]

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleUnlink(5)

      expect(mockVocabKanjiRepository.remove).toHaveBeenCalledWith(10)
    })

    it('does not unlink if vocabulary not linked', () => {
      state.vocabulary.value = []

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleUnlink(5)

      expect(mockVocabKanjiRepository.remove).not.toHaveBeenCalled()
    })

    it('does not unlink if no kanji selected', () => {
      state.kanji.value = null

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleUnlink(5)

      expect(mockVocabKanjiRepository.remove).not.toHaveBeenCalled()
    })

    it('refreshes vocabulary list after unlinking', () => {
      state.vocabulary.value = [
        createTestVocabKanjiWithVocabulary({
          vocabulary: { id: 5 } as Vocabulary,
          vocabKanji: { id: 10 } as VocabKanji
        })
      ]
      mockVocabKanjiRepository.getByKanjiIdWithVocabulary.mockReturnValue([])

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleUnlink(5)

      expect(
        mockVocabKanjiRepository.getByKanjiIdWithVocabulary
      ).toHaveBeenCalledWith(1)
      expect(state.vocabulary.value).toHaveLength(0)
    })
  })

  describe('handleCreate', () => {
    it('creates and links new vocabulary', () => {
      const data: QuickCreateVocabularyData = {
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      }

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleCreate(data)

      expect(mockVocabularyRepository.create).toHaveBeenCalledWith({
        word: '明日',
        kana: 'あした',
        shortMeaning: 'tomorrow'
      })

      expect(mockVocabKanjiRepository.create).toHaveBeenCalledWith({
        vocabId: 999,
        kanjiId: 1
      })
    })

    it('creates with null shortMeaning if not provided', () => {
      const data: QuickCreateVocabularyData = {
        word: '水',
        kana: 'みず'
      }

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleCreate(data)

      expect(mockVocabularyRepository.create).toHaveBeenCalledWith({
        word: '水',
        kana: 'みず',
        shortMeaning: null
      })
    })

    it('does not create if no kanji selected', () => {
      state.kanji.value = null

      const data: QuickCreateVocabularyData = {
        word: '水',
        kana: 'みず'
      }

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleCreate(data)

      expect(mockVocabularyRepository.create).not.toHaveBeenCalled()
    })

    it('refreshes vocabulary list after creating', () => {
      mockVocabKanjiRepository.getByKanjiIdWithVocabulary.mockReturnValue([
        createTestVocabKanjiWithVocabulary()
      ])

      const data: QuickCreateVocabularyData = {
        word: '明日',
        kana: 'あした'
      }

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.handleCreate(data)

      expect(
        mockVocabKanjiRepository.getByKanjiIdWithVocabulary
      ).toHaveBeenCalledWith(1)
      expect(state.vocabulary.value).toHaveLength(1)
    })
  })

  describe('refreshVocabulary', () => {
    it('loads vocabulary for current kanji', () => {
      mockVocabKanjiRepository.getByKanjiIdWithVocabulary.mockReturnValue([
        createTestVocabKanjiWithVocabulary()
      ])

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.refreshVocabulary()

      expect(
        mockVocabKanjiRepository.getByKanjiIdWithVocabulary
      ).toHaveBeenCalledWith(1)
      expect(state.vocabulary.value).toHaveLength(1)
    })

    it('does nothing if no kanji selected', () => {
      state.kanji.value = null

      const handlers = useKanjiDetailVocabularyHandlers(state)
      handlers.refreshVocabulary()

      expect(
        mockVocabKanjiRepository.getByKanjiIdWithVocabulary
      ).not.toHaveBeenCalled()
    })
  })
})
