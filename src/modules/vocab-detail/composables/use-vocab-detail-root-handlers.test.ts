/**
 * Tests for use-vocab-detail-root-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useVocabDetailRootHandlers } from './use-vocab-detail-root-handlers'

import type { BasicInfoSaveData, HeadlineSaveData } from '../vocab-detail-types'
import type { Vocabulary } from '@/api/vocabulary'
import type { Ref } from 'vue'
import type { Router } from 'vue-router'

// ============================================================================
// Mocks
// ============================================================================

const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({
    update: mockUpdate,
    remove: mockRemove
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

vi.mock('@/router/routes', () => ({
  ROUTES: {
    VOCABULARY_LIST: '/vocabulary'
  }
}))

const mockRouterPush = vi.fn()

// ============================================================================
// Test fixtures
// ============================================================================

const baseVocab: Vocabulary = {
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

const headlineData: HeadlineSaveData = {
  word: '日本語',
  kana: 'にほんご',
  shortMeaning: 'Japanese language',
  searchKeywords: 'japanese'
}

const basicInfoData: BasicInfoSaveData = {
  jlptLevel: 'N3',
  isCommon: false,
  description: 'The Japanese language'
}

// ============================================================================
// Setup
// ============================================================================

function makeSetup(vocabOverride: Vocabulary | null = baseVocab): {
  vocab: Ref<Vocabulary | null>
  isDeleting: Ref<boolean>
  handleBasicInfoSave: (data: BasicInfoSaveData) => void
  handleDelete: () => void
  handleHeadlineSave: (data: HeadlineSaveData) => void
} {
  const vocab = ref<Vocabulary | null>(vocabOverride)
  const isDeleting = ref(false)
  const router = { push: mockRouterPush } as unknown as Router

  const handlers = useVocabDetailRootHandlers({ vocab, isDeleting, router })

  return { vocab, isDeleting, ...handlers }
}

// ============================================================================
// Tests
// ============================================================================

describe('useVocabDetailRootHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleHeadlineSave', () => {
    it('does nothing when vocab is null', () => {
      const { handleHeadlineSave } = makeSetup(null)

      handleHeadlineSave(headlineData)

      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('calls update, updates vocab ref, and shows success toast', () => {
      const { handleHeadlineSave, vocab } = makeSetup()

      handleHeadlineSave(headlineData)

      expect(mockUpdate).toHaveBeenCalledWith(1, headlineData)
      expect(vocab.value).toMatchObject(headlineData)
      expect(mockSuccess).toHaveBeenCalledWith(
        'Vocabulary updated successfully'
      )
    })

    it('shows error toast with message when update throws an Error', () => {
      mockUpdate.mockImplementation(() => {
        throw new Error('DB write failed')
      })
      const { handleHeadlineSave } = makeSetup()

      handleHeadlineSave(headlineData)

      expect(mockError).toHaveBeenCalledWith('DB write failed')
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('shows generic error toast when update throws a non-Error', () => {
      const nonError: unknown = 'string error'
      mockUpdate.mockImplementation(() => {
        throw nonError
      })
      const { handleHeadlineSave } = makeSetup()

      handleHeadlineSave(headlineData)

      expect(mockError).toHaveBeenCalledWith('Failed to update vocabulary')
    })
  })

  describe('handleBasicInfoSave', () => {
    it('does nothing when vocab is null', () => {
      const { handleBasicInfoSave } = makeSetup(null)

      handleBasicInfoSave(basicInfoData)

      expect(mockUpdate).not.toHaveBeenCalled()
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('calls update, updates vocab ref, and shows success toast', () => {
      const { handleBasicInfoSave, vocab } = makeSetup()

      handleBasicInfoSave(basicInfoData)

      expect(mockUpdate).toHaveBeenCalledWith(1, basicInfoData)
      expect(vocab.value).toMatchObject(basicInfoData)
      expect(mockSuccess).toHaveBeenCalledWith(
        'Vocabulary updated successfully'
      )
    })

    it('shows error toast with message when update throws an Error', () => {
      mockUpdate.mockImplementation(() => {
        throw new Error('Constraint violation')
      })
      const { handleBasicInfoSave } = makeSetup()

      handleBasicInfoSave(basicInfoData)

      expect(mockError).toHaveBeenCalledWith('Constraint violation')
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('shows generic error toast when update throws a non-Error', () => {
      const nonError: unknown = 'string error'
      mockUpdate.mockImplementation(() => {
        throw nonError
      })
      const { handleBasicInfoSave } = makeSetup()

      handleBasicInfoSave(basicInfoData)

      expect(mockError).toHaveBeenCalledWith('Failed to update vocabulary')
    })
  })

  describe('handleDelete', () => {
    it('does nothing when vocab is null', () => {
      const { handleDelete } = makeSetup(null)

      handleDelete()

      expect(mockRemove).not.toHaveBeenCalled()
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('removes vocab, shows success toast, and navigates away', () => {
      mockRouterPush.mockResolvedValue(undefined)
      const { handleDelete, isDeleting } = makeSetup()

      handleDelete()

      expect(mockRemove).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith(
        'Vocabulary deleted successfully'
      )
      expect(mockRouterPush).toHaveBeenCalledWith('/vocabulary')
      expect(isDeleting.value).toBe(false)
    })

    it('shows error toast when remove throws', () => {
      mockRemove.mockImplementation(() => {
        throw new Error('Delete failed')
      })
      const { handleDelete, isDeleting } = makeSetup()

      handleDelete()

      expect(mockError).toHaveBeenCalledWith('Delete failed')
      expect(mockRouterPush).not.toHaveBeenCalled()
      expect(isDeleting.value).toBe(false)
    })
  })
})
