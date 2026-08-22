/**
 * Tests for classification-type-handlers
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { emptyClassificationTypeForm } from '../settings-types'

import {
  makeCreateHandlers,
  makeDeleteHandlers,
  makeEditHandlers
} from './classification-type-handlers'
import { makeReorderHandlers } from './classification-type-reorder-handlers'

import type { ClassificationTypeSectionState } from '../settings-types'
import type { ClassificationType } from '@/api/classification'

// ============================================================================
// Mock helpers
// ============================================================================

const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
const mockReorder = vi.fn()
const mockGetAll = vi.fn()
const mockGetUsageCount = vi.fn()

const mockSuccess = vi.fn()
const mockError = vi.fn()

// Sample classification types for tests
const sampleType: ClassificationType = {
  id: 1,
  typeName: 'pictograph',
  nameJapanese: '象形',
  nameEnglish: 'Pictograph',
  description: 'Pictorial representation',
  descriptionShort: 'Pictorial',
  displayOrder: 1,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00'
}

const sampleType2: ClassificationType = {
  id: 2,
  typeName: 'ideograph',
  nameJapanese: '指事',
  nameEnglish: 'Ideograph',
  description: 'Abstract symbol',
  descriptionShort: 'Abstract',
  displayOrder: 2,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00'
}

// ============================================================================
// State factory
// ============================================================================

function makeState(): ClassificationTypeSectionState {
  return {
    repo: {
      create: mockCreate,
      update: mockUpdate,
      remove: mockRemove,
      reorder: mockReorder,
      getAll: mockGetAll,
      getById: vi.fn(),
      getUsageCount: mockGetUsageCount
    } as unknown as ClassificationTypeSectionState['repo'],
    toast: {
      success: mockSuccess,
      error: mockError
    } as unknown as ClassificationTypeSectionState['toast'],
    classificationTypes: ref([]),
    showCreateDialog: ref(false),
    showEditDialog: ref(false),
    showDeleteDialog: ref(false),
    editingItem: ref(null),
    deletingItem: ref(null),
    deleteUsageCount: ref(0),
    createForm: ref(emptyClassificationTypeForm()),
    editForm: ref(emptyClassificationTypeForm())
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('makeCreateHandlers', () => {
  let s: ClassificationTypeSectionState

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([sampleType])
    s = makeState()
  })

  describe('handleCreateClick', () => {
    it('opens create dialog and resets form', () => {
      const { handleCreateClick } = makeCreateHandlers(s)

      s.createForm.value.typeName = 'existing'
      handleCreateClick()

      expect(s.showCreateDialog.value).toBe(true)
      expect(s.createForm.value.typeName).toBe('')
    })
  })

  describe('handleCreateSubmit', () => {
    it('creates item, shows success toast, closes dialog, and reloads list', () => {
      const { handleCreateSubmit } = makeCreateHandlers(s)
      s.createForm.value.typeName = 'new_type'
      s.createForm.value.nameEnglish = 'New Type'
      s.showCreateDialog.value = true

      handleCreateSubmit()

      expect(mockCreate).toHaveBeenCalledWith({
        typeName: 'new_type',
        nameJapanese: null,
        nameEnglish: 'New Type',
        descriptionShort: null,
        description: null
      })
      expect(mockSuccess).toHaveBeenCalledWith('Classification type created')
      expect(s.showCreateDialog.value).toBe(false)
      expect(s.classificationTypes.value).toEqual([sampleType])
    })

    it('shows error toast when type name is empty', () => {
      const { handleCreateSubmit } = makeCreateHandlers(s)
      s.createForm.value.typeName = '   '

      handleCreateSubmit()

      expect(mockCreate).not.toHaveBeenCalled()
      expect(mockError).toHaveBeenCalledWith('Type name is required')
    })

    it('shows error toast when create throws', () => {
      mockCreate.mockImplementation(() => {
        throw new Error('DB error')
      })
      const { handleCreateSubmit } = makeCreateHandlers(s)
      s.createForm.value.typeName = 'test'

      handleCreateSubmit()

      expect(mockError).toHaveBeenCalledWith('DB error')
      expect(mockSuccess).not.toHaveBeenCalled()
    })

    it('resets form on success', () => {
      const { handleCreateSubmit } = makeCreateHandlers(s)
      s.createForm.value.typeName = 'test'
      s.createForm.value.nameEnglish = 'Test'

      handleCreateSubmit()

      expect(s.createForm.value.typeName).toBe('')
      expect(s.createForm.value.nameEnglish).toBeUndefined()
    })
  })

  describe('handleCreateCancel', () => {
    it('closes dialog and resets form', () => {
      const { handleCreateCancel } = makeCreateHandlers(s)
      s.showCreateDialog.value = true
      s.createForm.value.typeName = 'partial'

      handleCreateCancel()

      expect(s.showCreateDialog.value).toBe(false)
      expect(s.createForm.value.typeName).toBe('')
    })
  })
})

describe('makeEditHandlers', () => {
  let s: ClassificationTypeSectionState

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([sampleType])
    s = makeState()
  })

  describe('handleEditClick', () => {
    it('sets editing item, populates form, and opens dialog', () => {
      const { handleEditClick } = makeEditHandlers(s)

      handleEditClick(sampleType)

      expect(s.editingItem.value).toEqual(sampleType)
      expect(s.editForm.value.typeName).toBe('pictograph')
      expect(s.editForm.value.nameEnglish).toBe('Pictograph')
      expect(s.showEditDialog.value).toBe(true)
    })

    it('converts null optional fields to undefined in form', () => {
      const { handleEditClick } = makeEditHandlers(s)
      const typeWithNulls: ClassificationType = {
        ...sampleType,
        nameJapanese: null,
        nameEnglish: null,
        description: null,
        descriptionShort: null
      }

      handleEditClick(typeWithNulls)

      expect(s.editForm.value.nameJapanese).toBeUndefined()
      expect(s.editForm.value.nameEnglish).toBeUndefined()
    })
  })

  describe('handleEditSubmit', () => {
    it('updates item, shows success toast, closes dialog, and reloads list', () => {
      const { handleEditSubmit } = makeEditHandlers(s)
      s.editingItem.value = sampleType
      s.editForm.value.typeName = 'updated_type'
      s.editForm.value.nameEnglish = 'Updated'
      s.showEditDialog.value = true

      handleEditSubmit()

      expect(mockUpdate).toHaveBeenCalledWith(1, {
        typeName: 'updated_type',
        nameJapanese: null,
        nameEnglish: 'Updated',
        descriptionShort: null,
        description: null
      })
      expect(mockSuccess).toHaveBeenCalledWith('Classification type updated')
      expect(s.showEditDialog.value).toBe(false)
      expect(s.editingItem.value).toBeNull()
    })

    it('does nothing when no editing item', () => {
      const { handleEditSubmit } = makeEditHandlers(s)
      s.editingItem.value = null

      handleEditSubmit()

      expect(mockUpdate).not.toHaveBeenCalled()
    })

    it('shows error toast when update throws', () => {
      mockUpdate.mockImplementation(() => {
        throw new Error('Update failed')
      })
      const { handleEditSubmit } = makeEditHandlers(s)
      s.editingItem.value = sampleType

      handleEditSubmit()

      expect(mockError).toHaveBeenCalledWith('Update failed')
    })
  })

  describe('handleEditCancel', () => {
    it('closes dialog and clears editing item', () => {
      const { handleEditCancel } = makeEditHandlers(s)
      s.showEditDialog.value = true
      s.editingItem.value = sampleType

      handleEditCancel()

      expect(s.showEditDialog.value).toBe(false)
      expect(s.editingItem.value).toBeNull()
    })
  })
})

describe('makeDeleteHandlers', () => {
  let s: ClassificationTypeSectionState

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([sampleType])
    mockGetUsageCount.mockReturnValue(0)
    s = makeState()
  })

  describe('handleDeleteClick', () => {
    it('sets deleting item, loads usage count, and opens dialog', () => {
      mockGetUsageCount.mockReturnValue(3)
      const { handleDeleteClick } = makeDeleteHandlers(s)

      handleDeleteClick(sampleType)

      expect(s.deletingItem.value).toEqual(sampleType)
      expect(mockGetUsageCount).toHaveBeenCalledWith(1)
      expect(s.deleteUsageCount.value).toBe(3)
      expect(s.showDeleteDialog.value).toBe(true)
    })
  })

  describe('handleDeleteConfirm', () => {
    it('removes item, shows success toast, closes dialog, and reloads list', () => {
      const { handleDeleteConfirm } = makeDeleteHandlers(s)
      s.deletingItem.value = sampleType
      s.showDeleteDialog.value = true
      s.deleteUsageCount.value = 2

      handleDeleteConfirm()

      expect(mockRemove).toHaveBeenCalledWith(1)
      expect(mockSuccess).toHaveBeenCalledWith('Classification type deleted')
      expect(s.showDeleteDialog.value).toBe(false)
      expect(s.deletingItem.value).toBeNull()
      expect(s.deleteUsageCount.value).toBe(0)
    })

    it('does nothing when no deleting item', () => {
      const { handleDeleteConfirm } = makeDeleteHandlers(s)
      s.deletingItem.value = null

      handleDeleteConfirm()

      expect(mockRemove).not.toHaveBeenCalled()
    })

    it('shows error toast when remove throws', () => {
      mockRemove.mockImplementation(() => {
        throw new Error('Delete failed')
      })
      const { handleDeleteConfirm } = makeDeleteHandlers(s)
      s.deletingItem.value = sampleType

      handleDeleteConfirm()

      expect(mockError).toHaveBeenCalledWith('Delete failed')
    })
  })

  describe('handleDeleteCancel', () => {
    it('closes dialog and clears state', () => {
      const { handleDeleteCancel } = makeDeleteHandlers(s)
      s.showDeleteDialog.value = true
      s.deletingItem.value = sampleType
      s.deleteUsageCount.value = 5

      handleDeleteCancel()

      expect(s.showDeleteDialog.value).toBe(false)
      expect(s.deletingItem.value).toBeNull()
      expect(s.deleteUsageCount.value).toBe(0)
    })
  })
})

describe('makeReorderHandlers', () => {
  let s: ClassificationTypeSectionState

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([sampleType, sampleType2])
    s = makeState()
    s.classificationTypes.value = [sampleType, sampleType2]
  })

  describe('handleMoveUp', () => {
    it('does nothing when already at first position', () => {
      const { handleMoveUp } = makeReorderHandlers(s)

      handleMoveUp(0)

      expect(mockReorder).not.toHaveBeenCalled()
    })

    it('swaps item with previous and reorders', () => {
      const { handleMoveUp } = makeReorderHandlers(s)

      handleMoveUp(1)

      expect(mockReorder).toHaveBeenCalledWith([2, 1])
      expect(mockSuccess).toHaveBeenCalledWith('Classification types reordered')
    })

    it('shows error toast when reorder throws', () => {
      mockReorder.mockImplementation(() => {
        throw new Error('Reorder failed')
      })
      const { handleMoveUp } = makeReorderHandlers(s)

      handleMoveUp(1)

      expect(mockError).toHaveBeenCalledWith('Reorder failed')
    })
  })

  describe('handleMoveDown', () => {
    it('does nothing when already at last position', () => {
      const { handleMoveDown } = makeReorderHandlers(s)

      handleMoveDown(1)

      expect(mockReorder).not.toHaveBeenCalled()
    })

    it('swaps item with next and reorders', () => {
      const { handleMoveDown } = makeReorderHandlers(s)

      handleMoveDown(0)

      expect(mockReorder).toHaveBeenCalledWith([2, 1])
      expect(mockSuccess).toHaveBeenCalledWith('Classification types reordered')
    })

    it('shows error toast when reorder throws', () => {
      mockReorder.mockImplementation(() => {
        throw new Error('Reorder failed')
      })
      const { handleMoveDown } = makeReorderHandlers(s)

      handleMoveDown(0)

      expect(mockError).toHaveBeenCalledWith('Reorder failed')
    })
  })
})
