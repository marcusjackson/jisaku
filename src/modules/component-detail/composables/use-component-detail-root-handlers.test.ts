/**
 * Tests for use-component-detail-root-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useComponentDetailRootHandlers } from './use-component-detail-root-handlers'

import type {
  BasicInfoSaveData,
  HeadlineSaveData
} from '../component-detail-types'
import type { Component } from '@/api/component'
import type { Kanji } from '@/api/kanji'
import type { Router } from 'vue-router'

// ============================================================================
// Mocks
// ============================================================================

const mockCompUpdate = vi.fn()
const mockCompUpdateField = vi.fn()
const mockCompRemove = vi.fn()
const mockKanjiGetById = vi.fn()

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    update: mockCompUpdate,
    updateField: mockCompUpdateField,
    remove: mockCompRemove
  })
}))

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getById: mockKanjiGetById
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

const mockRouterPush = vi.fn()

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush
  })
}))

// ============================================================================
// Test data
// ============================================================================

const sampleComponent: Component = {
  id: 1,
  character: '木',
  shortMeaning: 'tree',
  strokeCount: 4,
  searchKeywords: null,
  sourceKanjiId: null,
  description: null,
  canBeRadical: true,
  kangxiNumber: null,
  kangxiMeaning: null,
  radicalNameJapanese: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

const sampleKanji: Kanji = {
  id: 42,
  character: '木',
  shortMeaning: 'tree',
  strokeCount: 4,
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
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

// ============================================================================
// Test setup helper
// ============================================================================

function makeSetup() {
  const component = ref<Component | null>(sampleComponent)
  const sourceKanji = ref<Kanji | null>(null)
  const isDeleting = ref(false)
  const router = { push: mockRouterPush } as unknown as Router

  const handlers = useComponentDetailRootHandlers({
    component,
    sourceKanji,
    isDeleting,
    router
  })

  return { component, sourceKanji, isDeleting, ...handlers }
}

// ============================================================================
// Tests
// ============================================================================

describe('useComponentDetailRootHandlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // --------------------------------------------------------------------------
  // handleHeadlineSave
  // --------------------------------------------------------------------------
  describe('handleHeadlineSave', () => {
    it('updates component via repo and patches local state', () => {
      const { component, handleHeadlineSave } = makeSetup()
      const data: HeadlineSaveData = {
        character: '林',
        shortMeaning: 'woods',
        searchKeywords: null
      }

      handleHeadlineSave(data)

      expect(mockCompUpdate).toHaveBeenCalledWith(1, data)
      expect(component.value?.character).toBe('林')
      expect(component.value?.shortMeaning).toBe('woods')
      expect(mockSuccess).toHaveBeenCalledWith('Component updated successfully')
    })

    it('does nothing when component is null', () => {
      const { component, handleHeadlineSave } = makeSetup()
      component.value = null

      handleHeadlineSave({
        character: '木',
        shortMeaning: null,
        searchKeywords: null
      })

      expect(mockCompUpdate).not.toHaveBeenCalled()
    })

    it('shows error toast when update throws', () => {
      mockCompUpdate.mockImplementation(() => {
        throw new Error('Update failed')
      })
      const { handleHeadlineSave } = makeSetup()

      handleHeadlineSave({
        character: '林',
        shortMeaning: null,
        searchKeywords: null
      })

      expect(mockError).toHaveBeenCalledWith('Update failed')
      expect(mockSuccess).not.toHaveBeenCalled()
    })
  })

  // --------------------------------------------------------------------------
  // handleBasicInfoSave
  // --------------------------------------------------------------------------
  describe('handleBasicInfoSave', () => {
    it('updates component and patches local state', () => {
      const { component, handleBasicInfoSave } = makeSetup()
      const data: BasicInfoSaveData = {
        strokeCount: 6,
        sourceKanjiId: null,
        canBeRadical: false,
        kangxiNumber: null,
        kangxiMeaning: null,
        radicalNameJapanese: null
      }

      handleBasicInfoSave(data)

      expect(mockCompUpdate).toHaveBeenCalledWith(1, data)
      expect(component.value?.strokeCount).toBe(6)
      expect(mockSuccess).toHaveBeenCalledWith('Component updated successfully')
    })

    it('resolves sourceKanji when sourceKanjiId changes', () => {
      mockKanjiGetById.mockReturnValue(sampleKanji)
      const { handleBasicInfoSave, sourceKanji } = makeSetup()
      const data: BasicInfoSaveData = {
        strokeCount: 4,
        sourceKanjiId: 42,
        canBeRadical: true,
        kangxiNumber: null,
        kangxiMeaning: null,
        radicalNameJapanese: null
      }

      handleBasicInfoSave(data)

      expect(mockKanjiGetById).toHaveBeenCalledWith(42)
      expect(sourceKanji.value).toEqual(sampleKanji)
    })

    it('clears sourceKanji when sourceKanjiId set to null', () => {
      const { component, handleBasicInfoSave, sourceKanji } = makeSetup()
      component.value = { ...sampleComponent, sourceKanjiId: 42 }
      sourceKanji.value = sampleKanji
      const data: BasicInfoSaveData = {
        strokeCount: 4,
        sourceKanjiId: null,
        canBeRadical: true,
        kangxiNumber: null,
        kangxiMeaning: null,
        radicalNameJapanese: null
      }

      handleBasicInfoSave(data)

      expect(sourceKanji.value).toBeNull()
    })

    it('does nothing when component is null', () => {
      const { component, handleBasicInfoSave } = makeSetup()
      component.value = null

      handleBasicInfoSave({
        strokeCount: null,
        sourceKanjiId: null,
        canBeRadical: false,
        kangxiNumber: null,
        kangxiMeaning: null,
        radicalNameJapanese: null
      })

      expect(mockCompUpdate).not.toHaveBeenCalled()
    })

    it('shows error toast when update throws', () => {
      mockCompUpdate.mockImplementation(() => {
        throw new Error('Save failed')
      })
      const { handleBasicInfoSave } = makeSetup()

      handleBasicInfoSave({
        strokeCount: null,
        sourceKanjiId: null,
        canBeRadical: false,
        kangxiNumber: null,
        kangxiMeaning: null,
        radicalNameJapanese: null
      })

      expect(mockError).toHaveBeenCalledWith('Save failed')
    })
  })

  // --------------------------------------------------------------------------
  // handleDescriptionSave
  // --------------------------------------------------------------------------
  describe('handleDescriptionSave', () => {
    it('calls updateField and patches local state', () => {
      const { component, handleDescriptionSave } = makeSetup()

      handleDescriptionSave('New description text')

      expect(mockCompUpdateField).toHaveBeenCalledWith(
        1,
        'description',
        'New description text'
      )
      expect(component.value?.description).toBe('New description text')
      expect(mockSuccess).toHaveBeenCalledWith('Description saved')
    })

    it('saves null description', () => {
      const { handleDescriptionSave } = makeSetup()

      handleDescriptionSave(null)

      expect(mockCompUpdateField).toHaveBeenCalledWith(1, 'description', null)
      expect(mockSuccess).toHaveBeenCalledWith('Description saved')
    })

    it('does nothing when component is null', () => {
      const { component, handleDescriptionSave } = makeSetup()
      component.value = null

      handleDescriptionSave('text')

      expect(mockCompUpdateField).not.toHaveBeenCalled()
    })

    it('shows error toast when updateField throws', () => {
      mockCompUpdateField.mockImplementation(() => {
        throw new Error('Field update failed')
      })
      const { handleDescriptionSave } = makeSetup()

      handleDescriptionSave('text')

      expect(mockError).toHaveBeenCalledWith('Field update failed')
    })
  })

  // --------------------------------------------------------------------------
  // handleDelete
  // --------------------------------------------------------------------------
  describe('handleDelete', () => {
    it('removes component, shows success toast, and navigates to list', () => {
      const { handleDelete, isDeleting } = makeSetup()

      handleDelete()

      expect(mockCompRemove).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Component deleted successfully')
      expect(mockRouterPush).toHaveBeenCalledWith('/components')
      expect(isDeleting.value).toBe(false)
    })

    it('does nothing when component is null', () => {
      const { component, handleDelete } = makeSetup()
      component.value = null

      handleDelete()

      expect(mockCompRemove).not.toHaveBeenCalled()
    })

    it('shows error toast and clears isDeleting when remove throws', () => {
      mockCompRemove.mockImplementation(() => {
        throw new Error('Delete failed')
      })
      const { handleDelete, isDeleting } = makeSetup()

      handleDelete()

      expect(mockError).toHaveBeenCalledWith('Delete failed')
      expect(mockSuccess).not.toHaveBeenCalled()
      expect(isDeleting.value).toBe(false)
    })
  })
})
