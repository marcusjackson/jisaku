/**
 * Tests for position-type-reorder-handlers
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { emptyPositionTypeForm } from '../settings-types'

import { makeReorderHandlers } from './position-type-reorder-handlers'

import type { PositionTypeSectionState } from '../settings-types'
import type { PositionType } from '@/api/position'

const mockReorder = vi.fn()
const mockGetAll = vi.fn()
const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('./position-type-handlers', () => ({
  loadPositionTypes: vi.fn((s: unknown) => {
    const state = s as PositionTypeSectionState
    state.positionTypes.value = mockGetAll() as PositionType[]
  })
}))

const typeA: PositionType = {
  id: 1,
  positionName: 'left',
  nameJapanese: null,
  nameEnglish: null,
  description: null,
  displayOrder: 1,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00'
}

const typeB: PositionType = {
  id: 2,
  positionName: 'right',
  nameJapanese: null,
  nameEnglish: null,
  description: null,
  displayOrder: 2,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00'
}

const typeC: PositionType = {
  id: 3,
  positionName: 'top',
  nameJapanese: null,
  nameEnglish: null,
  description: null,
  displayOrder: 3,
  createdAt: '2024-01-01T00:00:00',
  updatedAt: '2024-01-01T00:00:00'
}

function makeState(types: PositionType[]): PositionTypeSectionState {
  return {
    repo: {
      reorder: mockReorder,
      getAll: mockGetAll,
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      getById: vi.fn(),
      getUsageCount: vi.fn()
    } as unknown as PositionTypeSectionState['repo'],
    toast: {
      success: mockSuccess,
      error: mockError
    } as unknown as PositionTypeSectionState['toast'],
    positionTypes: ref(types),
    showCreateDialog: ref(false),
    showEditDialog: ref(false),
    showDeleteDialog: ref(false),
    editingItem: ref(null),
    deletingItem: ref(null),
    deleteUsageCount: ref(0),
    createForm: ref(emptyPositionTypeForm()),
    editForm: ref(emptyPositionTypeForm())
  }
}

describe('makeReorderHandlers - handleMoveUp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([typeA, typeB, typeC])
  })

  it('does nothing when index is 0 (already at top)', () => {
    const s = makeState([typeA, typeB])
    const { handleMoveUp } = makeReorderHandlers(s)

    handleMoveUp(0)

    expect(mockReorder).not.toHaveBeenCalled()
    expect(mockSuccess).not.toHaveBeenCalled()
  })

  it('moves item up by swapping with previous item', () => {
    const s = makeState([typeA, typeB, typeC])
    const { handleMoveUp } = makeReorderHandlers(s)

    handleMoveUp(1)

    expect(mockReorder).toHaveBeenCalledWith([2, 1, 3])
    expect(mockSuccess).toHaveBeenCalledWith('Position types reordered')
  })

  it('shows error toast when reorder throws', () => {
    mockReorder.mockImplementation(() => {
      throw new Error('DB error')
    })
    const s = makeState([typeA, typeB])
    const { handleMoveUp } = makeReorderHandlers(s)

    handleMoveUp(1)

    expect(mockError).toHaveBeenCalledWith('DB error')
    expect(mockSuccess).not.toHaveBeenCalled()
  })
})

describe('makeReorderHandlers - handleMoveDown', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([typeA, typeB, typeC])
  })

  it('does nothing when index is the last item', () => {
    const s = makeState([typeA, typeB])
    const { handleMoveDown } = makeReorderHandlers(s)

    handleMoveDown(1)

    expect(mockReorder).not.toHaveBeenCalled()
    expect(mockSuccess).not.toHaveBeenCalled()
  })

  it('moves item down by swapping with next item', () => {
    const s = makeState([typeA, typeB, typeC])
    const { handleMoveDown } = makeReorderHandlers(s)

    handleMoveDown(0)

    expect(mockReorder).toHaveBeenCalledWith([2, 1, 3])
    expect(mockSuccess).toHaveBeenCalledWith('Position types reordered')
  })

  it('shows error toast when reorder throws', () => {
    mockReorder.mockImplementation(() => {
      throw new Error('Reorder failed')
    })
    const s = makeState([typeA, typeB])
    const { handleMoveDown } = makeReorderHandlers(s)

    handleMoveDown(0)

    expect(mockError).toHaveBeenCalledWith('Reorder failed')
    expect(mockSuccess).not.toHaveBeenCalled()
  })
})
