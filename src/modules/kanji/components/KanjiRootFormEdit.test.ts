/**
 * Tests for KanjiRootFormEdit component
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
const mockGetLinkedComponentIds = vi.fn().mockReturnValue([])
const mockSaveComponentLinks = vi.fn()
const mockUpdate = vi.fn()
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
    getLinkedComponentIds: mockGetLinkedComponentIds,
    saveComponentLinks: mockSaveComponentLinks,
    update: mockUpdate
  })
}))

// Mock the component repository
vi.mock('@/modules/components/composables/use-component-repository', () => ({
  useComponentRepository: () => ({
    getAll: vi.fn().mockReturnValue([])
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

// Mock vee-validate
vi.mock('vee-validate', () => ({
  useField: vi.fn((name: string) => ({
    errorMessage: ref(undefined),
    value: ref(
      name === 'strokeCount'
        ? 4
        : name === 'character'
          ? '日'
          : name === 'componentIds'
            ? []
            : ''
    )
  })),
  useForm: vi.fn(() => ({
    errors: ref({}),
    handleSubmit: vi.fn((fn: () => void) => fn),
    isSubmitting: ref(false),
    resetForm: vi.fn(),
    setFieldValue: vi.fn(),
    values: ref({})
  }))
}))

// Import after mocks
import KanjiRootFormEdit from './KanjiRootFormEdit.vue'

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    character: '日',
    createdAt: new Date().toISOString(),
    id: 1,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: 'Sun, day',
    identifier: null,
    radicalStrokeCount: null,
    radicalId: null,
    strokeCount: 4,
    shortMeaning: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiRootFormEdit', () => {
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

    const wrapper = mount(KanjiRootFormEdit)
    expect(wrapper.text()).toContain('Loading')
  })

  it('renders edit kanji form title', async () => {
    const wrapper = mount(KanjiRootFormEdit)
    await flushPromises()

    expect(wrapper.text()).toContain('Edit Kanji')
  })

  it('renders character input label', async () => {
    const wrapper = mount(KanjiRootFormEdit)
    await flushPromises()

    expect(wrapper.text()).toContain('Character')
  })

  it('renders save button', async () => {
    const wrapper = mount(KanjiRootFormEdit)
    await flushPromises()

    const button = wrapper.find('button[type="submit"]')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Save')
  })

  it('renders cancel button', async () => {
    const wrapper = mount(KanjiRootFormEdit)
    await flushPromises()

    expect(wrapper.text()).toContain('Cancel')
  })

  it('renders back link to detail page', async () => {
    const wrapper = mount(KanjiRootFormEdit)
    await flushPromises()

    const link = wrapper.find('a[href="/kanji/1"]')
    expect(link.exists()).toBe(true)
  })

  it('shows error state when kanji not found', async () => {
    mockGetById.mockReturnValue(null)

    const wrapper = mount(KanjiRootFormEdit)
    await flushPromises()

    expect(wrapper.text()).toContain('not found')
  })
})
