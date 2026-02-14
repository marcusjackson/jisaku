/**
 * Kanji List Data Tests
 *
 * Tests for the kanji list data composable.
 */

import { describe, expect, it, vi } from 'vitest'

import { useKanjiListData } from './use-kanji-list-data'

import type { Component } from '@/api/component'
import type { Kanji } from '@/api/kanji'

// Mock data
const mockKanji: Kanji[] = [
  {
    id: 1,
    character: '山',
    shortMeaning: null,
    searchKeywords: null,
    strokeCount: 3,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kanjiKenteiLevel: '10',
    radicalId: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '川',
    shortMeaning: null,
    searchKeywords: null,
    strokeCount: 3,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kanjiKenteiLevel: '10',
    radicalId: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const mockComponents: Component[] = [
  {
    id: 1,
    character: '一',
    shortMeaning: null,
    searchKeywords: null,
    strokeCount: 1,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 1,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '丨',
    shortMeaning: null,
    searchKeywords: null,
    strokeCount: 1,
    sourceKanjiId: null,
    description: null,
    canBeRadical: true,
    kangxiNumber: 2,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

const mockRadicals: Component[] = mockComponents.filter((c) => c.canBeRadical)

const mockClassificationTypes = [
  {
    id: 1,
    typeName: '形声',
    nameJapanese: null,
    nameEnglish: null,
    description: null,
    descriptionShort: null,
    displayOrder: 1
  },
  {
    id: 2,
    typeName: '会意',
    nameJapanese: null,
    nameEnglish: null,
    description: null,
    descriptionShort: null,
    displayOrder: 2
  }
]

// Mock repositories
vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    search: vi.fn().mockReturnValue(mockKanji)
  })
}))

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    getAll: vi.fn().mockReturnValue(mockComponents),
    getRadicals: vi.fn().mockReturnValue(mockRadicals)
  })
}))

vi.mock('@/api/classification', () => ({
  useClassificationTypeRepository: () => ({
    getAll: vi.fn().mockReturnValue(mockClassificationTypes)
  }),
  useKanjiClassificationRepository: () => ({
    getByKanjiIdWithType: vi.fn().mockReturnValue([])
  })
}))

describe('useKanjiListData', () => {
  describe('initial state', () => {
    it('initializes with empty kanji list', () => {
      const { kanjiList } = useKanjiListData()
      expect(kanjiList.value).toEqual([])
    })

    it('initializes with empty components', () => {
      const { components } = useKanjiListData()
      expect(components.value).toEqual([])
    })

    it('initializes with empty radicals', () => {
      const { radicals } = useKanjiListData()
      expect(radicals.value).toEqual([])
    })

    it('initializes with empty classification types', () => {
      const { classificationTypes } = useKanjiListData()
      expect(classificationTypes.value).toEqual([])
    })

    it('initializes with no fetch error', () => {
      const { fetchError } = useKanjiListData()
      expect(fetchError.value).toBeNull()
    })
  })

  describe('loadKanji', () => {
    it('loads kanji list from repository', () => {
      const { kanjiList, loadKanji } = useKanjiListData()

      loadKanji({})

      expect(kanjiList.value).toEqual(mockKanji)
    })

    it('loads primary classifications for each kanji', () => {
      const { loadKanji, primaryClassifications } = useKanjiListData()

      loadKanji({})

      expect(primaryClassifications.value.size).toBe(2)
      expect(primaryClassifications.value.has(1)).toBe(true)
      expect(primaryClassifications.value.has(2)).toBe(true)
    })
  })

  describe('loadReferenceData', () => {
    it('loads components from repository', () => {
      const { components, loadReferenceData } = useKanjiListData()

      loadReferenceData()

      expect(components.value).toEqual(mockComponents)
    })

    it('loads radicals from repository', () => {
      const { loadReferenceData, radicals } = useKanjiListData()

      loadReferenceData()

      expect(radicals.value).toEqual(mockRadicals)
    })

    it('loads classification types from repository', () => {
      const { classificationTypes, loadReferenceData } = useKanjiListData()

      loadReferenceData()

      expect(classificationTypes.value).toEqual(mockClassificationTypes)
    })
  })
})
