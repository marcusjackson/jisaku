/**
 * Tests for KanjiRootFormNew component
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock values
const mockIsInitializing = ref(false)
const mockIsInitialized = ref(true)
const mockInitError = ref<Error | null>(null)
const mockInitialize = vi.fn().mockResolvedValue(undefined)
const mockCreate = vi.fn()
const mockSaveComponentLinks = vi.fn()
const mockRouterPush = vi.fn()

// Mock the database composable
vi.mock('@/legacy/shared/composables/use-database', () => ({
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
vi.mock('@/legacy/shared/composables/use-toast', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn()
  })
}))

// Mock the repository
vi.mock('@/legacy/shared/composables/use-kanji-repository', () => ({
  useKanjiRepository: () => ({
    create: mockCreate,
    saveComponentLinks: mockSaveComponentLinks
  })
}))

// Mock the component repository
vi.mock('@/legacy/shared/composables/use-component-repository', () => ({
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
  useRouter: () => ({
    push: mockRouterPush
  })
}))

// Mock vee-validate
vi.mock('vee-validate', () => ({
  useField: vi.fn((name: string) => ({
    errorMessage: ref(undefined),
    value: ref(
      name === 'strokeCount' ? undefined : name === 'componentIds' ? [] : ''
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
import KanjiRootFormNew from './KanjiRootFormNew.vue'

describe('KanjiRootFormNew', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsInitializing.value = false
    mockIsInitialized.value = true
    mockInitError.value = null
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while initializing', () => {
    mockIsInitializing.value = true
    mockIsInitialized.value = false

    const wrapper = mount(KanjiRootFormNew)
    expect(wrapper.text()).toContain('Loading')
  })

  it('renders new kanji form title', async () => {
    const wrapper = mount(KanjiRootFormNew)
    await flushPromises()

    expect(wrapper.text()).toContain('New Kanji')
  })

  it('renders character input label', async () => {
    const wrapper = mount(KanjiRootFormNew)
    await flushPromises()

    expect(wrapper.text()).toContain('Character')
  })

  it('does not render stroke count in create mode', async () => {
    const wrapper = mount(KanjiRootFormNew)
    await flushPromises()

    // Stroke count should not appear in create mode
    expect(wrapper.text()).not.toContain('Stroke')
  })

  it('renders create button', async () => {
    const wrapper = mount(KanjiRootFormNew)
    await flushPromises()

    const button = wrapper.find('button[type="submit"]')
    expect(button.exists()).toBe(true)
    expect(button.text()).toContain('Create')
  })

  it('renders cancel button', async () => {
    const wrapper = mount(KanjiRootFormNew)
    await flushPromises()

    expect(wrapper.text()).toContain('Cancel')
  })

  it('renders back link', async () => {
    const wrapper = mount(KanjiRootFormNew)
    await flushPromises()

    const link = wrapper.find('a[href="/"]')
    expect(link.exists()).toBe(true)
  })
})
