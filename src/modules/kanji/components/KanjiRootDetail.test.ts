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

// Mock the kanji repository
vi.mock('@/shared/composables/use-kanji-repository', () => ({
  useKanjiRepository: () => ({
    getById: mockGetById,
    getLinkedComponents: mockGetLinkedComponents,
    remove: mockRemove,
    updateHeaderFields: vi.fn(),
    updateStrokeCount: vi.fn(),
    updateJlptLevel: vi.fn(),
    updateJoyoLevel: vi.fn(),
    updateKenteiLevel: vi.fn(),
    updateRadicalId: vi.fn(),
    updateNotesEtymology: vi.fn(),
    updateNotesSemantic: vi.fn(),
    updateNotesEducation: vi.fn(),
    updateNotesPersonal: vi.fn(),
    updateStrokeImages: vi.fn()
  })
}))

// Mock values for component repository
const mockGetComponentById = vi.fn()
const mockCreateComponent = vi.fn()
const mockGetAllComponents = vi.fn().mockReturnValue([])

// Mock component repository
vi.mock('@/shared/composables/use-component-repository', () => ({
  useComponentRepository: () => ({
    create: mockCreateComponent,
    getAll: mockGetAllComponents,
    getById: mockGetComponentById
  })
}))

// Mock values for component occurrence repository
const mockGetByKanjiIdWithPosition = vi.fn()
const mockCreateOccurrence = vi.fn()
const mockRemoveOccurrence = vi.fn()
const mockUpdateIsRadical = vi.fn()

// Mock component occurrence repository
vi.mock('@/shared/composables/use-component-occurrence-repository', () => ({
  useComponentOccurrenceRepository: () => ({
    create: mockCreateOccurrence,
    getByKanjiIdWithPosition: mockGetByKanjiIdWithPosition,
    remove: mockRemoveOccurrence,
    updateIsRadical: mockUpdateIsRadical
  })
}))

// Mock reading repository
vi.mock('@/shared/composables/use-reading-repository', () => ({
  useReadingRepository: () => ({
    getOnReadingsByKanjiId: vi.fn().mockReturnValue([]),
    getOnReadingById: vi.fn(),
    createOnReading: vi.fn(),
    updateOnReading: vi.fn(),
    removeOnReading: vi.fn(),
    reorderOnReadings: vi.fn(),
    getKunReadingsByKanjiId: vi.fn().mockReturnValue([]),
    getKunReadingById: vi.fn(),
    createKunReading: vi.fn(),
    updateKunReading: vi.fn(),
    removeKunReading: vi.fn(),
    reorderKunReadings: vi.fn()
  })
}))

// Mock meaning repository
vi.mock('@/shared/composables/use-meaning-repository', () => ({
  useMeaningRepository: () => ({
    getMeaningsByKanjiId: vi.fn().mockReturnValue([]),
    getMeaningById: vi.fn(),
    createMeaning: vi.fn(),
    updateMeaning: vi.fn(),
    removeMeaning: vi.fn(),
    reorderMeanings: vi.fn(),
    getReadingGroupsByKanjiId: vi.fn().mockReturnValue([]),
    getReadingGroupById: vi.fn(),
    createReadingGroup: vi.fn(),
    updateReadingGroup: vi.fn(),
    removeReadingGroup: vi.fn(),
    reorderReadingGroups: vi.fn(),
    removeAllReadingGroups: vi.fn(),
    getGroupMembersByGroupId: vi.fn().mockReturnValue([]),
    getGroupMembersByKanjiId: vi.fn().mockReturnValue([]),
    addMeaningToGroup: vi.fn(),
    removeMeaningFromGroup: vi.fn(),
    reorderMeaningsInGroup: vi.fn(),
    isGroupingEnabled: vi.fn().mockReturnValue(false),
    getUnassignedMeanings: vi.fn().mockReturnValue([]),
    deleteEmptyGroups: vi.fn()
  })
}))

// Mock classification repository
vi.mock('@/shared/composables/use-classification-repository', () => ({
  useClassificationRepository: () => ({
    getAllClassificationTypes: vi.fn().mockReturnValue([]),
    getClassificationTypeById: vi.fn().mockReturnValue(null),
    getClassificationsByKanjiId: vi.fn().mockReturnValue([]),
    getClassificationById: vi.fn().mockReturnValue(null),
    getPrimaryClassification: vi.fn().mockReturnValue(null),
    getPrimaryClassificationsForKanji: vi.fn().mockReturnValue(new Map()),
    createClassification: vi.fn(),
    updateClassification: vi.fn(),
    removeClassification: vi.fn(),
    reorderClassifications: vi.fn()
  })
}))

// Mock radical repository
vi.mock('@/shared/composables/use-radical-repository', () => ({
  useRadicalRepository: () => ({
    getById: vi.fn().mockReturnValue(null),
    getRadicalOptions: vi.fn().mockReturnValue([])
  })
}))

// Mock vocab-kanji repository
vi.mock('@/shared/composables/use-vocab-kanji-repository', () => ({
  useVocabKanjiRepository: () => ({
    create: vi.fn(),
    getByKanjiIdWithVocab: vi.fn().mockReturnValue([]),
    getByVocabId: vi.fn().mockReturnValue([]),
    remove: vi.fn(),
    removeByVocabAndKanji: vi.fn(),
    updateAnalysisNotes: vi.fn(),
    reorder: vi.fn()
  })
}))

// Mock vocabulary repository
vi.mock('@/shared/composables/use-vocabulary-repository', () => ({
  useVocabularyRepository: () => ({
    create: vi.fn(),
    getAll: vi.fn().mockReturnValue([]),
    getById: vi.fn().mockReturnValue(null),
    getByWord: vi.fn().mockReturnValue(null),
    search: vi.fn().mockReturnValue([]),
    updateHeaderFields: vi.fn(),
    updateBasicInfoField: vi.fn(),
    remove: vi.fn()
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

describe('KanjiRootDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsInitializing.value = false
    mockIsInitialized.value = true
    mockInitError.value = null
    mockRouteParams.value = { id: '1' }
    mockGetById.mockReturnValue(createMockKanji())
    mockGetByKanjiIdWithPosition.mockReturnValue([])
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
