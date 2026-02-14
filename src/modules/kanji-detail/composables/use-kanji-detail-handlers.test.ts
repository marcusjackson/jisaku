/**
 * Tests for use-kanji-detail-handlers composable.
 *
 * @module modules/kanji-detail
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailHandlers } from './use-kanji-detail-handlers'

import type { HeadlineSaveData } from '../kanji-detail-types'
import type { Kanji } from '@/api/kanji/kanji-types'
import type { Ref } from 'vue'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn()
  }))
}))

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: vi.fn()
}))

vi.mock('@/shared/composables', () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    error: vi.fn()
  }))
}))

function mockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '水',
    strokeCount: 4,
    shortMeaning: null,
    searchKeywords: null,
    radicalId: null,
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

describe('useKanjiDetailHandlers', () => {
  let kanjiRef: Ref<Kanji | null>
  let isDeletingRef: Ref<boolean>
  let mockRouter: { push: ReturnType<typeof vi.fn> }
  let mockToast: {
    success: ReturnType<typeof vi.fn>
    error: ReturnType<typeof vi.fn>
  }
  let mockKanjiRepo: {
    update: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
  }

  beforeEach(async () => {
    kanjiRef = ref<Kanji | null>(mockKanji())
    isDeletingRef = ref<boolean>(false)

    mockRouter = { push: vi.fn() }
    mockToast = { success: vi.fn(), error: vi.fn() }
    mockKanjiRepo = { update: vi.fn(), remove: vi.fn() }

    const { useRouter } = await import('vue-router')
    const { useToast } = await import('@/shared/composables')
    const { useKanjiRepository } = await import('@/api/kanji')

    vi.mocked(useRouter).mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>
    )
    vi.mocked(useToast).mockReturnValue(
      mockToast as unknown as ReturnType<typeof useToast>
    )
    vi.mocked(useKanjiRepository).mockReturnValue(
      mockKanjiRepo as unknown as ReturnType<typeof useKanjiRepository>
    )
  })

  describe('handleHeadlineSave', () => {
    it('updates kanji and shows success message', () => {
      const { handleHeadlineSave } = useKanjiDetailHandlers(
        kanjiRef,
        isDeletingRef
      )

      const saveData: HeadlineSaveData = {
        character: '火',
        shortMeaning: null,
        searchKeywords: null
      }

      handleHeadlineSave(saveData)

      expect(mockKanjiRepo.update).toHaveBeenCalledWith(1, {
        character: '火',
        shortMeaning: null,
        searchKeywords: null
      })
      expect(kanjiRef.value).toEqual(
        mockKanji({
          character: '火',
          shortMeaning: null,
          searchKeywords: null
        })
      )
      expect(mockToast.success).toHaveBeenCalledWith(
        'Kanji updated successfully'
      )
    })

    it('does nothing if kanji is null', () => {
      kanjiRef.value = null
      const { handleHeadlineSave } = useKanjiDetailHandlers(
        kanjiRef,
        isDeletingRef
      )

      handleHeadlineSave({
        character: '火',
        shortMeaning: null,
        searchKeywords: null
      })

      expect(mockKanjiRepo.update).not.toHaveBeenCalled()
      expect(mockToast.success).not.toHaveBeenCalled()
    })

    it('shows error message on update failure', () => {
      mockKanjiRepo.update.mockImplementation(() => {
        throw new Error('Database error')
      })

      const { handleHeadlineSave } = useKanjiDetailHandlers(
        kanjiRef,
        isDeletingRef
      )

      handleHeadlineSave({
        character: '火',
        shortMeaning: null,
        searchKeywords: null
      })

      expect(mockToast.error).toHaveBeenCalledWith('Database error')
    })

    it('shows generic error message for unknown errors', () => {
      mockKanjiRepo.update.mockImplementation(() => {
        throw new Error('Unknown error')
      })

      const { handleHeadlineSave } = useKanjiDetailHandlers(
        kanjiRef,
        isDeletingRef
      )

      handleHeadlineSave({
        character: '火',
        shortMeaning: null,
        searchKeywords: null
      })

      expect(mockToast.error).toHaveBeenCalledWith('Unknown error')
    })
  })

  describe('handleDelete', () => {
    it('deletes kanji and navigates to list', () => {
      const { handleDelete } = useKanjiDetailHandlers(kanjiRef, isDeletingRef)

      handleDelete()

      expect(isDeletingRef.value).toBe(false)
      expect(mockKanjiRepo.remove).toHaveBeenCalledWith(1)
      expect(mockToast.success).toHaveBeenCalledWith(
        'Kanji deleted successfully'
      )
      expect(mockRouter.push).toHaveBeenCalledWith('/kanji')
    })

    it('does nothing if kanji is null', () => {
      kanjiRef.value = null
      const { handleDelete } = useKanjiDetailHandlers(kanjiRef, isDeletingRef)

      handleDelete()

      expect(mockKanjiRepo.remove).not.toHaveBeenCalled()
      expect(mockToast.success).not.toHaveBeenCalled()
    })

    it('sets isDeleting to true during deletion', () => {
      let capturedIsDeleting = false
      mockKanjiRepo.remove.mockImplementation(() => {
        capturedIsDeleting = isDeletingRef.value
      })

      const { handleDelete } = useKanjiDetailHandlers(kanjiRef, isDeletingRef)

      handleDelete()

      expect(capturedIsDeleting).toBe(true)
      expect(isDeletingRef.value).toBe(false)
    })

    it('shows error message on delete failure', () => {
      mockKanjiRepo.remove.mockImplementation(() => {
        throw new Error('Cannot delete')
      })

      const { handleDelete } = useKanjiDetailHandlers(kanjiRef, isDeletingRef)

      handleDelete()

      expect(mockToast.error).toHaveBeenCalledWith('Cannot delete')
      expect(isDeletingRef.value).toBe(false)
      expect(mockRouter.push).not.toHaveBeenCalled()
    })

    it('shows generic error message for unknown errors', () => {
      mockKanjiRepo.remove.mockImplementation(() => {
        throw new Error('Unknown error')
      })

      const { handleDelete } = useKanjiDetailHandlers(kanjiRef, isDeletingRef)

      handleDelete()

      expect(mockToast.error).toHaveBeenCalledWith('Unknown error')
      expect(isDeletingRef.value).toBe(false)
    })

    it('resets isDeleting even on error', () => {
      mockKanjiRepo.remove.mockImplementation(() => {
        throw new Error('Delete failed')
      })

      const { handleDelete } = useKanjiDetailHandlers(kanjiRef, isDeletingRef)

      handleDelete()

      expect(isDeletingRef.value).toBe(false)
    })
  })
})
