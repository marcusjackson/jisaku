/**
 * Tests for use-component-detail-occurrence-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useComponentDetailOccurrenceHandlers } from './use-component-detail-occurrence-handlers'

import type { OccurrenceWithKanji } from '@/api/component'
import type { Kanji } from '@/api/kanji'

// Mock dependencies
const mockOccurrenceCreate = vi.fn()
const mockOccurrenceUpdate = vi.fn()
const mockOccurrenceRemove = vi.fn()
const mockOccurrenceReorder = vi.fn()
const mockOccurrenceGetByComponentIdWithKanji = vi.fn()

vi.mock('@/api/component', () => ({
  useComponentOccurrenceRepository: () => ({
    create: mockOccurrenceCreate,
    update: mockOccurrenceUpdate,
    remove: mockOccurrenceRemove,
    reorder: mockOccurrenceReorder,
    getByComponentIdWithKanji: mockOccurrenceGetByComponentIdWithKanji
  })
}))

const mockKanjiCreate = vi.fn()
const mockKanjiGetAll = vi.fn()

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    create: mockKanjiCreate,
    getAll: mockKanjiGetAll
  })
}))

const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError
  })
}))

describe('useComponentDetailOccurrenceHandlers', () => {
  const componentId = ref<number | null>(100)
  const occurrences = ref<OccurrenceWithKanji[]>([])
  const kanjiOptions = ref<Kanji[]>([])

  beforeEach(() => {
    vi.clearAllMocks()
    componentId.value = 100
    occurrences.value = []
    kanjiOptions.value = []
    mockOccurrenceGetByComponentIdWithKanji.mockReturnValue([])
    mockKanjiGetAll.mockReturnValue([])
  })

  describe('handleOccurrenceAdd', () => {
    it('creates occurrence and reloads list', () => {
      const { handleOccurrenceAdd } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceAdd(42)

      expect(mockOccurrenceCreate).toHaveBeenCalledWith({
        kanjiId: 42,
        componentId: 100
      })
      expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Kanji linked')
    })

    it('shows error toast on failure', () => {
      mockOccurrenceCreate.mockImplementation(() => {
        throw new Error('Create failed')
      })

      const { handleOccurrenceAdd } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceAdd(42)

      expect(mockError).toHaveBeenCalledWith('Create failed')
    })

    it('does nothing if component ID is null', () => {
      componentId.value = null

      const { handleOccurrenceAdd } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceAdd(42)

      expect(mockOccurrenceCreate).not.toHaveBeenCalled()
    })
  })

  describe('handleOccurrenceCreate', () => {
    it('creates kanji and occurrence then reloads', () => {
      mockKanjiCreate.mockReturnValue({ id: 999 })

      const { handleOccurrenceCreate } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceCreate({ character: '新', shortMeaning: 'new' })

      expect(mockKanjiCreate).toHaveBeenCalledWith({
        character: '新',
        shortMeaning: 'new'
      })
      expect(mockOccurrenceCreate).toHaveBeenCalledWith({
        kanjiId: 999,
        componentId: 100
      })
      expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(100)
      expect(mockKanjiGetAll).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Kanji created and linked')
    })

    it('handles null shortMeaning', () => {
      mockKanjiCreate.mockReturnValue({ id: 888 })

      const { handleOccurrenceCreate } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceCreate({ character: '日' })

      expect(mockKanjiCreate).toHaveBeenCalledWith({
        character: '日',
        shortMeaning: null
      })
    })
  })

  describe('handleOccurrenceUpdate', () => {
    it('updates occurrence and reloads list', () => {
      const { handleOccurrenceUpdate } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceUpdate(5, {
        positionTypeId: 2,
        componentFormId: null,
        isRadical: true,
        analysisNotes: 'test'
      })

      expect(mockOccurrenceUpdate).toHaveBeenCalledWith(5, {
        positionTypeId: 2,
        componentFormId: null,
        isRadical: true,
        analysisNotes: 'test'
      })
      expect(mockSuccess).toHaveBeenCalledWith('Occurrence updated')
    })
  })

  describe('handleOccurrenceRemove', () => {
    it('removes occurrence and reloads list', () => {
      const { handleOccurrenceRemove } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceRemove(7)

      expect(mockOccurrenceRemove).toHaveBeenCalledWith(7)
      expect(mockSuccess).toHaveBeenCalledWith('Kanji unlinked')
    })
  })

  describe('handleOccurrenceReorder', () => {
    it('reorders occurrences and reloads list', () => {
      const { handleOccurrenceReorder } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceReorder([3, 1, 2])

      expect(mockOccurrenceReorder).toHaveBeenCalledWith([3, 1, 2])
      expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(100)
    })

    it('shows error toast on failure', () => {
      mockOccurrenceReorder.mockImplementation(() => {
        throw new Error('Reorder failed')
      })

      const { handleOccurrenceReorder } = useComponentDetailOccurrenceHandlers({
        componentId,
        occurrences,
        kanjiOptions
      })

      handleOccurrenceReorder([1, 2, 3])

      expect(mockError).toHaveBeenCalledWith('Reorder failed')
    })
  })
})
