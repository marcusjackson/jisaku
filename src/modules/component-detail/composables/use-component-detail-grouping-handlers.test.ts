/**
 * Tests for use-component-detail-grouping-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useComponentDetailGroupingHandlers } from './use-component-detail-grouping-handlers'

import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers
} from '@/api/component'

// Mock dependencies
const mockGroupingCreate = vi.fn()
const mockGroupingUpdate = vi.fn()
const mockGroupingRemove = vi.fn()
const mockGroupingReorder = vi.fn()
const mockGroupingGetByParentId = vi.fn()
const mockGetMembers = vi.fn()
const mockAddMember = vi.fn()
const mockRemoveMember = vi.fn()
const mockReorderMembers = vi.fn()
const mockGetMembersByComponentId = vi.fn()

vi.mock('@/api/component', () => ({
  useComponentGroupingRepository: () => ({
    create: mockGroupingCreate,
    update: mockGroupingUpdate,
    remove: mockGroupingRemove,
    reorder: mockGroupingReorder,
    getByParentId: mockGroupingGetByParentId,
    getMembers: mockGetMembers,
    addMember: mockAddMember,
    removeMember: mockRemoveMember,
    reorderMembers: mockReorderMembers,
    getMembersByComponentId: mockGetMembersByComponentId
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

describe('useComponentDetailGroupingHandlers', () => {
  const componentId = ref<number | null>(100)
  const groupings = ref<ComponentGroupingWithMembers[]>([])
  const managingGroupingId = ref<number | null>(null)
  const allGroupingMembers = ref(new Map<number, ComponentGroupingMember[]>())
  const managingGroupingMembers = ref<ComponentGroupingMember[]>([])

  beforeEach(() => {
    vi.clearAllMocks()
    componentId.value = 100
    groupings.value = []
    managingGroupingId.value = null
    allGroupingMembers.value = new Map()
    managingGroupingMembers.value = []
    mockGroupingGetByParentId.mockReturnValue([])
    mockGetMembersByComponentId.mockReturnValue(new Map())
    mockGetMembers.mockReturnValue([])
  })

  describe('handleGroupingAdd', () => {
    it('creates grouping and reloads list', () => {
      const { handleGroupingAdd } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingAdd({ name: 'Left side', description: null })

      expect(mockGroupingCreate).toHaveBeenCalledWith({
        componentId: 100,
        name: 'Left side',
        description: null
      })
      expect(mockGroupingGetByParentId).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Grouping added')
    })

    it('shows error toast on failure', () => {
      mockGroupingCreate.mockImplementation(() => {
        throw new Error('Create failed')
      })

      const { handleGroupingAdd } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingAdd({ name: 'Test', description: null })

      expect(mockError).toHaveBeenCalledWith('Create failed')
    })

    it('does nothing if component ID is null', () => {
      componentId.value = null

      const { handleGroupingAdd } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingAdd({ name: 'Test', description: null })

      expect(mockGroupingCreate).not.toHaveBeenCalled()
    })
  })

  describe('handleGroupingUpdate', () => {
    it('updates grouping and reloads list', () => {
      const { handleGroupingUpdate } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingUpdate(5, { name: 'Updated', description: 'New desc' })

      expect(mockGroupingUpdate).toHaveBeenCalledWith(5, {
        name: 'Updated',
        description: 'New desc'
      })
      expect(mockSuccess).toHaveBeenCalledWith('Grouping updated')
    })

    it('shows error toast on failure', () => {
      mockGroupingUpdate.mockImplementation(() => {
        throw new Error('Update failed')
      })

      const { handleGroupingUpdate } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingUpdate(5, { name: 'Test', description: null })

      expect(mockError).toHaveBeenCalledWith('Update failed')
    })
  })

  describe('handleGroupingRemove', () => {
    it('removes grouping and reloads list', () => {
      const { handleGroupingRemove } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingRemove(7)

      expect(mockGroupingRemove).toHaveBeenCalledWith(7)
      expect(mockSuccess).toHaveBeenCalledWith('Grouping deleted')
    })

    it('shows error toast on failure', () => {
      mockGroupingRemove.mockImplementation(() => {
        throw new Error('Delete failed')
      })

      const { handleGroupingRemove } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingRemove(7)

      expect(mockError).toHaveBeenCalledWith('Delete failed')
    })
  })

  describe('handleGroupingReorder', () => {
    it('reorders groupings and reloads list', () => {
      const { handleGroupingReorder } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingReorder([3, 1, 2])

      expect(mockGroupingReorder).toHaveBeenCalledWith([3, 1, 2])
      expect(mockGroupingGetByParentId).toHaveBeenCalledWith(100)
    })

    it('shows error toast on failure', () => {
      mockGroupingReorder.mockImplementation(() => {
        throw new Error('Reorder failed')
      })

      const { handleGroupingReorder } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleGroupingReorder([3, 1, 2])

      expect(mockError).toHaveBeenCalledWith('Reorder failed')
    })
  })

  describe('handleManageMembersOpen', () => {
    it('sets managingGroupingId and loads members', () => {
      const mockMembers: ComponentGroupingMember[] = [
        { id: 1, groupingId: 5, occurrenceId: 10, displayOrder: 0 }
      ]
      mockGetMembers.mockReturnValue(mockMembers)

      const { handleManageMembersOpen } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleManageMembersOpen(5)

      expect(managingGroupingId.value).toBe(5)
      expect(mockGetMembers).toHaveBeenCalledWith(5)
      expect(managingGroupingMembers.value).toEqual(mockMembers)
    })
  })

  describe('handleMemberAdd', () => {
    it('adds member and reloads members and groupings', () => {
      const { handleMemberAdd } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleMemberAdd(5, 10)

      expect(mockAddMember).toHaveBeenCalledWith(5, 10)
      expect(mockGetMembers).toHaveBeenCalledWith(5)
      expect(mockGroupingGetByParentId).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Member added')
    })

    it('shows error toast on failure', () => {
      mockAddMember.mockImplementation(() => {
        throw new Error('Add member failed')
      })

      const { handleMemberAdd } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleMemberAdd(5, 10)

      expect(mockError).toHaveBeenCalledWith('Add member failed')
    })
  })

  describe('handleMemberRemove', () => {
    it('removes member and reloads members and groupings', () => {
      const { handleMemberRemove } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleMemberRemove(5, 10)

      expect(mockRemoveMember).toHaveBeenCalledWith(5, 10)
      expect(mockGetMembers).toHaveBeenCalledWith(5)
      expect(mockGroupingGetByParentId).toHaveBeenCalledWith(100)
      expect(mockSuccess).toHaveBeenCalledWith('Member removed')
    })

    it('shows error toast on failure', () => {
      mockRemoveMember.mockImplementation(() => {
        throw new Error('Remove member failed')
      })

      const { handleMemberRemove } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleMemberRemove(5, 10)

      expect(mockError).toHaveBeenCalledWith('Remove member failed')
    })
  })

  describe('handleMemberReorder', () => {
    it('reorders members and reloads members list', () => {
      const { handleMemberReorder } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleMemberReorder(5, [10, 20, 30])

      expect(mockReorderMembers).toHaveBeenCalledWith(5, [10, 20, 30])
      expect(mockGetMembers).toHaveBeenCalledWith(5)
    })

    it('shows error toast on failure', () => {
      mockReorderMembers.mockImplementation(() => {
        throw new Error('Reorder members failed')
      })

      const { handleMemberReorder } = useComponentDetailGroupingHandlers({
        componentId,
        groupings,
        allGroupingMembers,
        managingGroupingId,
        managingGroupingMembers
      })

      handleMemberReorder(5, [10, 20])

      expect(mockError).toHaveBeenCalledWith('Reorder members failed')
    })
  })
})
