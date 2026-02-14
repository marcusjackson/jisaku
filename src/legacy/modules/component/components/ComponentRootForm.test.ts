/**
 * Tests for ComponentRootForm component
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Component, Kanji } from '@/legacy/shared/types/database-types'

// Mock values
const mockIsInitializing = ref(false)
const mockIsInitialized = ref(true)
const mockInitError = ref<Error | null>(null)
const mockInitialize = vi.fn().mockResolvedValue(undefined)
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockGetById = vi.fn()
const mockGetAllKanji = vi.fn()
const mockRouteParams = ref({ id: '1' })
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

// Mock the component repository
vi.mock('@/legacy/shared/composables/use-component-repository', () => ({
  useComponentRepository: () => ({
    create: mockCreate,
    getById: mockGetById,
    update: mockUpdate
  })
}))

// Mock the kanji repository
vi.mock('@/legacy/shared/composables/use-kanji-repository', () => ({
  useKanjiRepository: () => ({
    getAll: mockGetAllKanji
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
    value: ref(name === 'strokeCount' ? undefined : '')
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
import ComponentRootForm from './ComponentRootForm.vue'

function createMockComponent(overrides: Partial<Component> = {}): Component {
  return {
    character: '亻',
    createdAt: new Date().toISOString(),
    description: 'Person radical',
    id: 1,
    searchKeywords: 'にんべん',
    sourceKanjiId: null,
    strokeCount: 2,
    shortMeaning: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

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
    searchKeywords: null,
    radicalId: null,
    strokeCount: 4,
    shortMeaning: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('ComponentRootForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsInitializing.value = false
    mockIsInitialized.value = true
    mockInitError.value = null
    mockRouteParams.value = { id: '1' }
    mockGetById.mockReturnValue(createMockComponent())
    mockGetAllKanji.mockReturnValue([createMockKanji()])
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('create mode', () => {
    it('shows loading state while initializing', () => {
      mockIsInitializing.value = true
      mockIsInitialized.value = false

      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      expect(wrapper.text()).toContain('Loading')
    })

    it('renders new component form title', async () => {
      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('New Component')
    })

    it('renders character input label', async () => {
      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Character')
    })

    it('does NOT render stroke count in create mode', async () => {
      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      // In create mode, stroke count is not shown
      expect(wrapper.text()).not.toContain('Stroke Count')
    })

    it('renders create button', async () => {
      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Create Component')
    })

    it('renders cancel button', async () => {
      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Cancel')
    })

    it('calls initialize on mount', async () => {
      mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      expect(mockInitialize).toHaveBeenCalled()
    })

    it('loads kanji options for combobox', async () => {
      mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      expect(mockGetAllKanji).toHaveBeenCalled()
    })
  })

  describe('edit mode', () => {
    it('renders edit component form title', async () => {
      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'edit' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Edit Component')
    })

    it('renders save button', async () => {
      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'edit' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Save Changes')
    })

    it('fetches component by ID', async () => {
      mount(ComponentRootForm, {
        props: { mode: 'edit' }
      })
      await flushPromises()

      expect(mockGetById).toHaveBeenCalledWith(1)
    })

    it('shows error when component not found', async () => {
      mockGetById.mockReturnValue(null)

      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'edit' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('not found')
    })

    it('shows error for invalid ID', async () => {
      mockRouteParams.value = { id: 'invalid' }

      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'edit' }
      })
      await flushPromises()

      expect(wrapper.text().toLowerCase()).toContain('invalid')
    })
  })

  describe('error state', () => {
    it('shows error message when initialization fails', async () => {
      mockIsInitializing.value = false
      mockIsInitialized.value = false
      mockInitError.value = new Error('Database failed')

      const wrapper = mount(ComponentRootForm, {
        props: { mode: 'create' }
      })
      await flushPromises()

      expect(wrapper.text()).toContain('Failed to load')
      expect(wrapper.text()).toContain('Database failed')
    })
  })
})
