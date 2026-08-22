/**
 * Tests for use-settings-classification-type-section (composition root)
 */

import { defineComponent } from 'vue'

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useClassificationTypeSection } from './use-settings-classification-type-section'

import type { ClassificationType } from '@/api/classification'

const mockGetAll = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
const mockReorder = vi.fn()
const mockGetUsageCount = vi.fn()
const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/api/classification', () => ({
  useClassificationTypeRepository: () => ({
    getAll: mockGetAll,
    create: mockCreate,
    update: mockUpdate,
    remove: mockRemove,
    reorder: mockReorder,
    getById: vi.fn(),
    getUsageCount: mockGetUsageCount
  })
}))

vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({ success: mockSuccess, error: mockError })
}))

const sampleType: ClassificationType = {
  id: 1,
  typeName: 'pictograph',
  nameJapanese: '象形',
  nameEnglish: 'Pictograph',
  description: 'Desc',
  descriptionShort: 'Short',
  displayOrder: 1,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00'
}

function mountAndGetSection() {
  let section: ReturnType<typeof useClassificationTypeSection> | null = null
  const TestComponent = defineComponent({
    setup() {
      section = useClassificationTypeSection()
      return {}
    },
    template: '<div />'
  })
  mount(TestComponent)
  return section!
}

describe('useClassificationTypeSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([sampleType])
  })

  it('loads classification types on mount', () => {
    const s = mountAndGetSection()

    expect(mockGetAll).toHaveBeenCalledTimes(1)
    expect(s.classificationTypes.value).toEqual([sampleType])
  })

  it('exposes reactive state refs', () => {
    const s = mountAndGetSection()

    expect(s.showCreateDialog.value).toBe(false)
    expect(s.showEditDialog.value).toBe(false)
    expect(s.showDeleteDialog.value).toBe(false)
    expect(s.editingItem.value).toBeNull()
    expect(s.deletingItem.value).toBeNull()
    expect(s.deleteUsageCount.value).toBe(0)
  })

  it('exposes handler functions', () => {
    const s = mountAndGetSection()

    expect(typeof s.handleCreateClick).toBe('function')
    expect(typeof s.handleCreateSubmit).toBe('function')
    expect(typeof s.handleCreateCancel).toBe('function')
    expect(typeof s.handleEditClick).toBe('function')
    expect(typeof s.handleEditSubmit).toBe('function')
    expect(typeof s.handleEditCancel).toBe('function')
    expect(typeof s.handleDeleteClick).toBe('function')
    expect(typeof s.handleDeleteConfirm).toBe('function')
    expect(typeof s.handleDeleteCancel).toBe('function')
    expect(typeof s.handleMoveUp).toBe('function')
    expect(typeof s.handleMoveDown).toBe('function')
  })

  it('handleMoveUp reorders types and shows success toast', () => {
    mockGetAll.mockReturnValue([sampleType])
    const sampleType2: ClassificationType = {
      ...sampleType,
      id: 2,
      displayOrder: 2
    }
    const s = mountAndGetSection()
    s.classificationTypes.value = [sampleType, sampleType2]

    s.handleMoveDown(0)

    expect(mockReorder).toHaveBeenCalledWith([2, 1])
    expect(mockSuccess).toHaveBeenCalledWith('Classification types reordered')
  })
})
