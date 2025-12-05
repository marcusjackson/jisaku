/**
 * Tests for ComponentRootDetail component
 *
 * These tests verify the ComponentRootDetail component renders correctly
 * with different states (loading, error, data loaded).
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Component, Kanji } from '@/shared/types/database-types'

// Mock values
const mockIsInitializing = ref(false)
const mockIsInitialized = ref(true)
const mockInitError = ref<Error | null>(null)
const mockInitialize = vi.fn().mockResolvedValue(undefined)
const mockGetById = vi.fn()
const mockRemove = vi.fn()
const mockGetLinkedKanjiCount = vi.fn()
const mockGetLinkedKanjiIds = vi.fn()
const mockGetKanjiById = vi.fn()
const mockGetKanjiByIds = vi.fn()
const mockRouteParams = ref({ id: '1' })
const mockRouterPush = vi.fn()

// Mock the database composable
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: vi.fn(),
    initError: mockInitError,
    initialize: mockInitialize,
    isInitialized: mockIsInitialized,
    isInitializing: mockIsInitializing,
    persist: vi.fn(),
    run: vi.fn()
  })
}))

// Mock the toast composable
vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn()
  })
}))

// Mock the repository
vi.mock('../composables/use-component-repository', () => ({
  useComponentRepository: () => ({
    getById: mockGetById,
    getLinkedKanjiCount: mockGetLinkedKanjiCount,
    getLinkedKanjiIds: mockGetLinkedKanjiIds,
    remove: mockRemove
  })
}))

// Mock the kanji repository
vi.mock('@/modules/kanji-list/composables/use-kanji-repository', () => ({
  useKanjiRepository: () => ({
    getById: mockGetKanjiById,
    getByIds: mockGetKanjiByIds
  })
}))

// Mock router
vi.mock('vue-router', () => ({
  RouterLink: {
    props: ['to'],
    template: '<a :href="to"><slot /></a>'
  },
  useRoute: () => ({
    params: mockRouteParams.value
  }),
  useRouter: () => ({
    push: mockRouterPush
  })
}))

// Import after mocks are set up
import ComponentRootDetail from './ComponentRootDetail.vue'

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    character: '亻',
    createdAt: new Date().toISOString(),
    description: 'Person radical',
    descriptionShort: 'person',
    id: 1,
    japaneseName: 'にんべん',
    sourceKanjiId: null,
    strokeCount: 2,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '人',
    createdAt: new Date().toISOString(),
    id: 10,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesEtymology: null,
    notesCultural: null,
    notesPersonal: 'Person kanji',
    radicalId: null,
    strokeCount: 2,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('ComponentRootDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsInitializing.value = false
    mockIsInitialized.value = true
    mockInitError.value = null
    mockRouteParams.value = { id: '1' }
    mockGetById.mockReturnValue(createMockComponent())
    mockGetLinkedKanjiCount.mockReturnValue(0)
    mockGetLinkedKanjiIds.mockReturnValue([])
    mockGetKanjiById.mockReturnValue(null)
    mockGetKanjiByIds.mockReturnValue([])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while initializing', () => {
    mockIsInitializing.value = true
    mockIsInitialized.value = false

    const wrapper = mount(ComponentRootDetail)
    expect(wrapper.text()).toContain('Loading')
  })

  it('renders component character when data is loaded', async () => {
    const wrapper = mount(ComponentRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('亻')
  })

  it('displays stroke count', async () => {
    const wrapper = mount(ComponentRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('2')
    expect(wrapper.text()).toContain('stroke')
  })

  it('displays japanese name', async () => {
    const wrapper = mount(ComponentRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('にんべん')
  })

  it('shows error state when component not found', async () => {
    mockGetById.mockReturnValue(null)

    const wrapper = mount(ComponentRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('not found')
  })

  it('shows error state for invalid ID', async () => {
    mockRouteParams.value = { id: 'invalid' }

    const wrapper = mount(ComponentRootDetail)
    await flushPromises()

    expect(wrapper.text().toLowerCase()).toContain('invalid')
  })

  it('calls initialize on mount', async () => {
    mount(ComponentRootDetail)
    await flushPromises()

    expect(mockInitialize).toHaveBeenCalled()
  })

  it('loads linked kanji information', async () => {
    mockGetLinkedKanjiCount.mockReturnValue(5)
    mockGetLinkedKanjiIds.mockReturnValue([1, 2, 3, 4, 5])
    mockGetKanjiByIds.mockReturnValue([createMockKanji()])

    mount(ComponentRootDetail)
    await flushPromises()

    expect(mockGetLinkedKanjiCount).toHaveBeenCalledWith(1)
    expect(mockGetLinkedKanjiIds).toHaveBeenCalledWith(1)
    expect(mockGetKanjiByIds).toHaveBeenCalledWith([1, 2, 3, 4, 5])
  })

  it('fetches source kanji when component has sourceKanjiId', async () => {
    const sourceKanji = createMockKanji({ id: 10, character: '人' })
    mockGetById.mockReturnValue(createMockComponent({ sourceKanjiId: 10 }))
    mockGetKanjiById.mockReturnValue(sourceKanji)

    mount(ComponentRootDetail)
    await flushPromises()

    expect(mockGetKanjiById).toHaveBeenCalledWith(10)
  })

  it('does not fetch source kanji when sourceKanjiId is null', async () => {
    mockGetById.mockReturnValue(createMockComponent({ sourceKanjiId: null }))

    mount(ComponentRootDetail)
    await flushPromises()

    expect(mockGetKanjiById).not.toHaveBeenCalled()
  })

  it('displays source kanji character when available', async () => {
    const sourceKanji = createMockKanji({ id: 10, character: '人' })
    mockGetById.mockReturnValue(createMockComponent({ sourceKanjiId: 10 }))
    mockGetKanjiById.mockReturnValue(sourceKanji)

    const wrapper = mount(ComponentRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('Source Kanji')
    expect(wrapper.text()).toContain('人')
  })
})
