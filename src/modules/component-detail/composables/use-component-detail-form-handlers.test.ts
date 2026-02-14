/**
 * Tests for use-component-detail-form-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useComponentDetailFormHandlers } from './use-component-detail-form-handlers'

import type { ComponentForm } from '@/api/component'

// Mock dependencies
const mockFormCreate = vi.fn()
const mockFormUpdate = vi.fn()
const mockFormRemove = vi.fn()
const mockFormReorder = vi.fn()
const mockFormGetByParentId = vi.fn()

vi.mock('@/api/component', () => ({
  useComponentFormRepository: () => ({
    create: mockFormCreate,
    update: mockFormUpdate,
    remove: mockFormRemove,
    reorder: mockFormReorder,
    getByParentId: mockFormGetByParentId
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

describe('useComponentDetailFormHandlers', () => {
  const componentId = ref<number | null>(100)
  const forms = ref<ComponentForm[]>([])

  beforeEach(() => {
    vi.clearAllMocks()
    componentId.value = 100
    forms.value = []
    mockFormGetByParentId.mockReturnValue([])
  })

  describe('handleFormAdd', () => {
    it('creates form and reloads list', () => {
      const { handleFormAdd } = useComponentDetailFormHandlers({
        componentId,
        forms
      })

      handleFormAdd({
        formCharacter: '氵',
        formName: 'water radical',
        strokeCount: 3,
        usageNotes: null
      })

      expect(mockFormCreate).toHaveBeenCalledWith({
        componentId: 100,
        formCharacter: '氵',
        formName: 'water radical',
        strokeCount: 3,
        usageNotes: null
      })
      expect(mockFormGetByParentId).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Form added')
    })

    it('shows error toast on failure', () => {
      mockFormCreate.mockImplementation(() => {
        throw new Error('Create failed')
      })

      const { handleFormAdd } = useComponentDetailFormHandlers({
        componentId,
        forms
      })

      handleFormAdd({
        formCharacter: '氵',
        formName: null,
        strokeCount: null,
        usageNotes: null
      })

      expect(mockError).toHaveBeenCalledWith('Create failed')
    })

    it('does nothing if component ID is null', () => {
      componentId.value = null

      const { handleFormAdd } = useComponentDetailFormHandlers({
        componentId,
        forms
      })

      handleFormAdd({
        formCharacter: '氵',
        formName: null,
        strokeCount: null,
        usageNotes: null
      })

      expect(mockFormCreate).not.toHaveBeenCalled()
    })
  })

  describe('handleFormUpdate', () => {
    it('updates form and reloads list', () => {
      const { handleFormUpdate } = useComponentDetailFormHandlers({
        componentId,
        forms
      })

      handleFormUpdate(5, {
        formCharacter: '氵',
        formName: 'updated name',
        strokeCount: 4,
        usageNotes: 'notes'
      })

      expect(mockFormUpdate).toHaveBeenCalledWith(5, {
        formName: 'updated name',
        strokeCount: 4,
        usageNotes: 'notes'
      })
      expect(mockSuccess).toHaveBeenCalledWith('Form updated')
    })
  })

  describe('handleFormRemove', () => {
    it('removes form and reloads list', () => {
      const { handleFormRemove } = useComponentDetailFormHandlers({
        componentId,
        forms
      })

      handleFormRemove(7)

      expect(mockFormRemove).toHaveBeenCalledWith(7)
      expect(mockSuccess).toHaveBeenCalledWith('Form deleted')
    })
  })

  describe('handleFormReorder', () => {
    it('reorders forms and reloads list', () => {
      const { handleFormReorder } = useComponentDetailFormHandlers({
        componentId,
        forms
      })

      handleFormReorder([3, 1, 2])

      expect(mockFormReorder).toHaveBeenCalledWith([3, 1, 2])
      expect(mockFormGetByParentId).toHaveBeenCalledWith(100)
    })
  })
})
