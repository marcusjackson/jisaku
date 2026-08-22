/**
 * Tests for use-component-detail-data composable.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Component } from '@/api/component'
import type { Kanji } from '@/api/kanji'

const mockComponent: Component = {
  id: 1,
  character: '木',
  strokeCount: null,
  shortMeaning: 'tree',
  searchKeywords: null,
  sourceKanjiId: null,
  description: null,
  canBeRadical: false,
  kangxiNumber: null,
  kangxiMeaning: null,
  radicalNameJapanese: null,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}

const mockComponentGetById = vi.fn<() => Component | null>(() => mockComponent)
const mockFormGetByParentId = vi.fn(() => [])
const mockGroupingGetByParentId = vi.fn(() => [])
const mockGroupingGetMembersByComponentId = vi.fn(() => new Map())
const mockOccurrenceGetByComponentIdWithKanji = vi.fn(() => [])
const mockKanjiGetAll = vi.fn(() => [{ id: 1, character: '日' }])
const mockKanjiGetById = vi.fn<() => Kanji | null>(() => null)
const mockPositionTypeGetAll = vi.fn(() => [])

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { id: '1' } })
}))

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({ getById: mockComponentGetById }),
  useComponentFormRepository: () => ({
    getByParentId: mockFormGetByParentId
  }),
  useComponentGroupingRepository: () => ({
    getByParentId: mockGroupingGetByParentId,
    getMembersByComponentId: mockGroupingGetMembersByComponentId
  }),
  useComponentOccurrenceRepository: () => ({
    getByComponentIdWithKanji: mockOccurrenceGetByComponentIdWithKanji
  })
}))

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getAll: mockKanjiGetAll,
    getById: mockKanjiGetById
  })
}))

vi.mock('@/api/position', () => ({
  usePositionTypeRepository: () => ({ getAll: mockPositionTypeGetAll })
}))

// Import after mocks are set up
import { useComponentDetailData } from './use-component-detail-data'

describe('useComponentDetailData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockComponentGetById.mockReturnValue(mockComponent)
    mockFormGetByParentId.mockReturnValue([])
    mockGroupingGetByParentId.mockReturnValue([])
    mockGroupingGetMembersByComponentId.mockReturnValue(new Map())
    mockOccurrenceGetByComponentIdWithKanji.mockReturnValue([])
    mockKanjiGetAll.mockReturnValue([{ id: 1, character: '日' }])
    mockKanjiGetById.mockReturnValue(null)
    mockPositionTypeGetAll.mockReturnValue([])
  })

  it('returns all expected state refs', () => {
    const data = useComponentDetailData()

    expect(data.component).toBeDefined()
    expect(data.forms).toBeDefined()
    expect(data.groupings).toBeDefined()
    expect(data.allGroupingMembers).toBeDefined()
    expect(data.occurrences).toBeDefined()
    expect(data.positionTypes).toBeDefined()
    expect(data.kanjiOptions).toBeDefined()
    expect(data.sourceKanji).toBeDefined()
    expect(data.isLoading).toBeDefined()
    expect(data.loadError).toBeDefined()
    expect(data.componentId).toBeDefined()
  })

  it('loads component data on initialization', () => {
    const data = useComponentDetailData()

    expect(mockComponentGetById).toHaveBeenCalledWith(1)
    expect(data.component.value).toEqual(mockComponent)
  })

  it('sets isLoading to false after successful load', () => {
    const data = useComponentDetailData()

    expect(data.isLoading.value).toBe(false)
  })

  it('loads all related data collections', () => {
    const data = useComponentDetailData()

    expect(mockFormGetByParentId).toHaveBeenCalledWith(1)
    expect(mockGroupingGetByParentId).toHaveBeenCalledWith(1)
    expect(mockGroupingGetMembersByComponentId).toHaveBeenCalledWith(1)
    expect(mockOccurrenceGetByComponentIdWithKanji).toHaveBeenCalledWith(1)
    expect(mockKanjiGetAll).toHaveBeenCalled()
    expect(mockPositionTypeGetAll).toHaveBeenCalled()
    expect(data.forms.value).toEqual([])
    expect(data.kanjiOptions.value).toEqual([{ id: 1, character: '日' }])
  })

  it('sets loadError when component is not found', () => {
    mockComponentGetById.mockReturnValue(null)

    const data = useComponentDetailData()

    expect(data.loadError.value).toBe('Component with ID 1 not found')
    expect(data.component.value).toBeNull()
  })

  it('sets loadError on repository exception', () => {
    mockComponentGetById.mockImplementation(() => {
      throw new Error('DB error')
    })

    const data = useComponentDetailData()

    expect(data.loadError.value).toBe('DB error')
    expect(data.isLoading.value).toBe(false)
  })

  it('resolves sourceKanji when sourceKanjiId is set', () => {
    const mockKanji = { id: 5, character: '木' }
    mockComponentGetById.mockReturnValue({ ...mockComponent, sourceKanjiId: 5 })
    mockKanjiGetById.mockReturnValue(mockKanji as unknown as Kanji)

    const data = useComponentDetailData()

    expect(mockKanjiGetById).toHaveBeenCalledWith(5)
    expect(data.sourceKanji.value).toEqual(mockKanji)
  })

  it('derives componentId from route params', () => {
    const data = useComponentDetailData()

    expect(data.componentId.value).toBe(1)
  })
})
