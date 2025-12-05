/**
 * Tests for KanjiRootDetail component
 *
 * These tests verify the KanjiRootDetail component renders correctly
 * with different states (loading, error, data loaded).
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Kanji } from '@/shared/types/database-types'

// Mock values
const mockIsInitializing = ref(false)
const mockIsInitialized = ref(true)
const mockInitError = ref<Error | null>(null)
const mockInitialize = vi.fn().mockResolvedValue(undefined)
const mockGetById = vi.fn()
const mockGetLinkedComponents = vi.fn().mockReturnValue([])
const mockRemove = vi.fn()
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
vi.mock('@/modules/kanji-list/composables/use-kanji-repository', () => ({
  useKanjiRepository: () => ({
    getById: mockGetById,
    getLinkedComponents: mockGetLinkedComponents,
    remove: mockRemove
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
import KanjiRootDetail from './KanjiRootDetail.vue'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '日',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesEtymology: null,
    notesCultural: null,
    notesPersonal: 'Sun, day',
    radicalId: null,
    strokeCount: 4,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiRootDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsInitializing.value = false
    mockIsInitialized.value = true
    mockInitError.value = null
    mockRouteParams.value = { id: '1' }
    mockGetById.mockReturnValue(createMockKanji())
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while initializing', () => {
    mockIsInitializing.value = true
    mockIsInitialized.value = false

    const wrapper = mount(KanjiRootDetail)
    expect(wrapper.text()).toContain('Loading')
  })

  it('renders kanji character when data is loaded', async () => {
    const wrapper = mount(KanjiRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('日')
  })

  it('displays stroke count', async () => {
    const wrapper = mount(KanjiRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('4')
    expect(wrapper.text()).toContain('stroke')
  })

  it('displays JLPT level', async () => {
    const wrapper = mount(KanjiRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('N5')
  })

  it('shows error state when kanji not found', async () => {
    mockGetById.mockReturnValue(null)

    const wrapper = mount(KanjiRootDetail)
    await flushPromises()

    expect(wrapper.text()).toContain('not found')
  })

  it('shows error state for invalid ID', async () => {
    mockRouteParams.value = { id: 'invalid' }

    const wrapper = mount(KanjiRootDetail)
    await flushPromises()

    expect(wrapper.text().toLowerCase()).toContain('invalid')
  })

  it('calls initialize on mount', async () => {
    mount(KanjiRootDetail)
    await flushPromises()

    expect(mockInitialize).toHaveBeenCalled()
  })
})
