/**
 * ComponentDetailRoot Tests
 *
 * Tests for the root component of the component detail page.
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ComponentDetailRoot from './ComponentDetailRoot.vue'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' }
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

const mockComponent = {
  id: 1,
  character: '氵',
  shortMeaning: 'water',
  searchKeywords: 'mizu, sanzui',
  strokeCount: 3,
  sourceKanjiId: null,
  description: null,
  canBeRadical: true,
  kangxiNumber: 85,
  kangxiMeaning: 'water',
  radicalNameJapanese: 'さんずい',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockGetById = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
const mockUpdateField = vi.fn()

// Forms repository mocks
const mockFormGetByParentId = vi.fn()
const mockFormCreate = vi.fn()
const mockFormUpdate = vi.fn()
const mockFormRemove = vi.fn()
const mockFormReorder = vi.fn()

// Occurrence repository mocks
const mockOccurrenceGetByComponentIdWithKanji = vi.fn()
const mockOccurrenceCreate = vi.fn()
const mockOccurrenceUpdate = vi.fn()
const mockOccurrenceRemove = vi.fn()
const mockOccurrenceReorder = vi.fn()

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    getById: mockGetById,
    update: mockUpdate,
    remove: mockRemove,
    updateField: mockUpdateField
  }),
  useComponentFormRepository: () => ({
    getByParentId: mockFormGetByParentId,
    create: mockFormCreate,
    update: mockFormUpdate,
    remove: mockFormRemove,
    reorder: mockFormReorder
  }),
  useComponentOccurrenceRepository: () => ({
    getByComponentIdWithKanji: mockOccurrenceGetByComponentIdWithKanji,
    create: mockOccurrenceCreate,
    update: mockOccurrenceUpdate,
    remove: mockOccurrenceRemove,
    reorder: mockOccurrenceReorder
  })
}))

const mockKanjiGetById = vi.fn()
const mockKanjiGetAll = vi.fn()
const mockKanjiCreate = vi.fn()

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getById: mockKanjiGetById,
    getAll: mockKanjiGetAll,
    create: mockKanjiCreate
  })
}))

const mockPositionTypeGetAll = vi.fn()

vi.mock('@/api/position', () => ({
  usePositionTypeRepository: () => ({
    getAll: mockPositionTypeGetAll
  })
}))

const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError,
    toasts: ref([])
  })
}))

describe('ComponentDetailRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetById.mockReturnValue(mockComponent)
    mockKanjiGetAll.mockReturnValue([])
    mockKanjiGetById.mockReturnValue(null)
    mockFormGetByParentId.mockReturnValue([])
    mockOccurrenceGetByComponentIdWithKanji.mockReturnValue([])
    mockPositionTypeGetAll.mockReturnValue([])
  })

  it('renders loading state initially then component data', async () => {
    const wrapper = mount(ComponentDetailRoot, {
      global: {
        stubs: {
          ComponentDetailSectionHeadline: true,
          ComponentDetailSectionBasicInfo: true,
          ComponentDetailSectionDescription: true,
          ComponentDetailSectionForms: true,
          ComponentDetailSectionOccurrences: true,
          ComponentDetailSectionActions: true,
          BaseSpinner: true
        }
      }
    })

    await flushPromises()

    expect(mockGetById).toHaveBeenCalledWith(1)
    expect(
      wrapper.findComponent({ name: 'ComponentDetailSectionHeadline' }).exists()
    ).toBe(true)
    expect(
      wrapper.findComponent({ name: 'ComponentDetailSectionActions' }).exists()
    ).toBe(true)
  })

  it('renders error state when component not found', async () => {
    mockGetById.mockReturnValue(null)

    const wrapper = mount(ComponentDetailRoot, {
      global: {
        stubs: {
          ComponentDetailSectionHeadline: true,
          ComponentDetailSectionBasicInfo: true,
          ComponentDetailSectionDescription: true,
          ComponentDetailSectionForms: true,
          ComponentDetailSectionOccurrences: true,
          ComponentDetailSectionActions: true,
          BaseSpinner: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('not found')
  })

  it('fetches component by ID from route params', async () => {
    mount(ComponentDetailRoot, {
      global: {
        stubs: {
          ComponentDetailSectionHeadline: true,
          ComponentDetailSectionBasicInfo: true,
          ComponentDetailSectionDescription: true,
          ComponentDetailSectionForms: true,
          ComponentDetailSectionOccurrences: true,
          ComponentDetailSectionActions: true,
          BaseSpinner: true
        }
      }
    })

    await flushPromises()

    expect(mockGetById).toHaveBeenCalledWith(1)
  })
})
