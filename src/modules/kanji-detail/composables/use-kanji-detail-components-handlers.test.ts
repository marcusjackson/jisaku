/**
 * Tests for use-kanji-detail-components-handlers composable
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailComponentsHandlers } from './use-kanji-detail-components-handlers'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { Kanji } from '@/api/kanji/kanji-types'
import type { QuickCreateComponentData } from '@/shared/validation/quick-create-component-schema'

// Mock Kanji factory
function createTestKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: 'ζ—₯',
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
    error: vi.fn()
  })
}))

// Mock repositories
const mockComponentOccurrenceRepository = {
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn()
}

const mockComponentRepository = {
  create: vi.fn(),
  getAll: vi.fn()
}

vi.mock('../composables/use-component-occurrence-repository', () => ({
  useComponentOccurrenceRepository: () => mockComponentOccurrenceRepository
}))

vi.mock('@/api/component', () => ({
  useComponentRepository: () => mockComponentRepository,
  useComponentOccurrenceRepository: () => mockComponentOccurrenceRepository,
  useComponentFormRepository: () => ({ getAll: vi.fn() }),
  usePositionTypeRepository: () => ({ getAll: vi.fn() })
}))

vi.mock('@/api/position', () => ({
  usePositionTypeRepository: () => ({ getAll: vi.fn() })
}))

describe('use-kanji-detail-components-handlers', () => {
  const kanji = ref<Kanji | null>(createTestKanji())
  const linkedOccurrences = ref<ComponentOccurrenceWithDetails[]>([])

  let handlers: ReturnType<typeof useKanjiDetailComponentsHandlers>

  beforeEach(() => {
    kanji.value = createTestKanji()
    linkedOccurrences.value = []
    vi.clearAllMocks()
    handlers = useKanjiDetailComponentsHandlers({
      kanji,
      componentOccurrences: linkedOccurrences
    })
  })

  describe('handleSave', () => {
    it('should link new components', () => {
      handlers.handleSave({
        toLink: [
          {
            componentId: 2,
            positionTypeId: null,
            componentFormId: null,
            isRadical: false
          }
        ],
        toUpdate: [],
        toDelete: []
      })

      expect(mockComponentOccurrenceRepository.create).toHaveBeenCalledWith({
        kanjiId: 1,
        componentId: 2,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        analysisNotes: null
      })
    })

    it('should update existing occurrences', () => {
      handlers.handleSave({
        toLink: [],
        toUpdate: [
          {
            id: 1,
            positionTypeId: 1,
            componentFormId: null,
            isRadical: true
          }
        ],
        toDelete: []
      })

      expect(mockComponentOccurrenceRepository.update).toHaveBeenCalledWith(1, {
        positionTypeId: 1,
        componentFormId: null,
        isRadical: true
      })
    })

    it('should delete occurrences', () => {
      handlers.handleSave({
        toLink: [],
        toUpdate: [],
        toDelete: [1]
      })

      expect(mockComponentOccurrenceRepository.remove).toHaveBeenCalledWith(1)
    })

    it('should handle multiple operations in batch', () => {
      handlers.handleSave({
        toLink: [
          {
            componentId: 3,
            positionTypeId: null,
            componentFormId: null,
            isRadical: false
          }
        ],
        toUpdate: [
          {
            id: 1,
            positionTypeId: 1,
            componentFormId: null,
            isRadical: true
          }
        ],
        toDelete: [2]
      })

      expect(mockComponentOccurrenceRepository.create).toHaveBeenCalledTimes(1)
      expect(mockComponentOccurrenceRepository.update).toHaveBeenCalledTimes(1)
      expect(mockComponentOccurrenceRepository.remove).toHaveBeenCalledTimes(1)
    })
  })

  describe('handleCreate', () => {
    it('should create new component from quick create', () => {
      const quickCreateData: QuickCreateComponentData = {
        character: 'ι›',
        shortMeaning: 'rain'
      }

      handlers.handleCreate(quickCreateData)

      expect(mockComponentRepository.create).toHaveBeenCalledWith(
        quickCreateData
      )
    })
  })
})
