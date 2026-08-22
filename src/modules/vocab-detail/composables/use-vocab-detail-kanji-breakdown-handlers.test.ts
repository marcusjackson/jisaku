/**
 * Tests for use-vocab-detail-kanji-breakdown-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useVocabDetailKanjiBreakdownHandlers } from './use-vocab-detail-kanji-breakdown-handlers'

import type { Kanji } from '@/api/kanji'
import type { VocabKanjiWithKanji } from '@/api/vocabulary'

// Mock dependencies
const mockVocabKanjiCreate = vi.fn()
const mockVocabKanjiUpdate = vi.fn()
const mockVocabKanjiRemove = vi.fn()
const mockVocabKanjiReorder = vi.fn()
const mockVocabKanjiGetByVocabIdWithKanji = vi.fn()

vi.mock('@/api/vocabulary', () => ({
  useVocabKanjiRepository: () => ({
    create: mockVocabKanjiCreate,
    update: mockVocabKanjiUpdate,
    remove: mockVocabKanjiRemove,
    reorder: mockVocabKanjiReorder,
    getByVocabIdWithKanji: mockVocabKanjiGetByVocabIdWithKanji
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

describe('useVocabDetailKanjiBreakdownHandlers', () => {
  const vocabId = ref(100)
  const kanjiBreakdown = ref<VocabKanjiWithKanji[]>([])
  const allKanji = ref<Kanji[]>([])

  beforeEach(() => {
    vi.clearAllMocks()
    vocabId.value = 100
    kanjiBreakdown.value = []
    allKanji.value = []
    mockVocabKanjiGetByVocabIdWithKanji.mockReturnValue([])
    mockKanjiGetAll.mockReturnValue([])
  })

  describe('handleAdd', () => {
    it('creates link, reloads breakdown, shows success toast', () => {
      const { handleAdd } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleAdd(42)

      expect(mockVocabKanjiCreate).toHaveBeenCalledWith({
        vocabId: 100,
        kanjiId: 42
      })
      expect(mockVocabKanjiGetByVocabIdWithKanji).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Kanji linked')
    })

    it('shows error toast on failure', () => {
      mockVocabKanjiCreate.mockImplementation(() => {
        throw new Error('Create failed')
      })

      const { handleAdd } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleAdd(42)

      expect(mockError).toHaveBeenCalledWith('Create failed')
    })
  })

  describe('handleCreate', () => {
    it('creates kanji then link, reloads both, shows success toast', () => {
      mockKanjiCreate.mockReturnValue({ id: 999 })

      const { handleCreate } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleCreate({ character: '新', shortMeaning: 'new' })

      expect(mockKanjiCreate).toHaveBeenCalledWith({
        character: '新',
        shortMeaning: 'new'
      })
      expect(mockVocabKanjiCreate).toHaveBeenCalledWith({
        vocabId: 100,
        kanjiId: 999
      })
      expect(mockVocabKanjiGetByVocabIdWithKanji).toHaveBeenCalledWith(100)
      expect(mockKanjiGetAll).toHaveBeenCalled()
      expect(mockSuccess).toHaveBeenCalledWith('Kanji created and linked')
    })

    it('shows error toast on failure', () => {
      mockKanjiCreate.mockImplementation(() => {
        throw new Error('Create kanji failed')
      })

      const { handleCreate } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleCreate({ character: '日' })

      expect(mockError).toHaveBeenCalledWith('Create kanji failed')
    })
  })

  describe('handleUpdateNotes', () => {
    it('updates notes, reloads breakdown, shows success toast', () => {
      const { handleUpdateNotes } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleUpdateNotes(5, 'new notes')

      expect(mockVocabKanjiUpdate).toHaveBeenCalledWith(5, {
        analysisNotes: 'new notes'
      })
      expect(mockVocabKanjiGetByVocabIdWithKanji).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Notes updated')
    })

    it('shows error toast on failure', () => {
      mockVocabKanjiUpdate.mockImplementation(() => {
        throw new Error('Update failed')
      })

      const { handleUpdateNotes } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleUpdateNotes(5, 'notes')

      expect(mockError).toHaveBeenCalledWith('Update failed')
    })
  })

  describe('handleReorder', () => {
    it('calls reorder with IDs and reloads breakdown', () => {
      const { handleReorder } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleReorder([3, 1, 2])

      expect(mockVocabKanjiReorder).toHaveBeenCalledWith([3, 1, 2])
      expect(mockVocabKanjiGetByVocabIdWithKanji).toHaveBeenCalledWith(100)
    })

    it('shows error toast on failure', () => {
      mockVocabKanjiReorder.mockImplementation(() => {
        throw new Error('Reorder failed')
      })

      const { handleReorder } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleReorder([3, 1, 2])

      expect(mockError).toHaveBeenCalledWith('Reorder failed')
    })
  })

  describe('handleRemove', () => {
    it('removes link, reloads breakdown, shows success toast', () => {
      const { handleRemove } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleRemove(7)

      expect(mockVocabKanjiRemove).toHaveBeenCalledWith(7)
      expect(mockVocabKanjiGetByVocabIdWithKanji).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Kanji unlinked')
    })

    it('shows error toast on failure', () => {
      mockVocabKanjiRemove.mockImplementation(() => {
        throw new Error('Remove failed')
      })

      const { handleRemove } = useVocabDetailKanjiBreakdownHandlers({
        vocabId,
        kanjiBreakdown,
        allKanji
      })

      handleRemove(7)

      expect(mockError).toHaveBeenCalledWith('Remove failed')
    })
  })
})
