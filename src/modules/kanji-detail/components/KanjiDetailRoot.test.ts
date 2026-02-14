/**
 * KanjiDetailRoot Tests
 *
 * Tests for the root component of the kanji detail page.
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import KanjiDetailRoot from './KanjiDetailRoot.vue'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' }
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

const mockKanji = {
  id: 1,
  character: '日',
  shortMeaning: 'sun, day',
  searchKeywords: 'hi, nichi',
  radicalId: 1,
  strokeCount: 4,
  jlptLevel: 'N5',
  joyoLevel: 'elementary1',
  kanjiKenteiLevel: '10',
  strokeDiagramImage: null,
  strokeGifImage: null,
  notesEtymology: null,
  notesSemantic: null,
  notesEducationMnemonics: null,
  notesPersonal: null,
  identifier: null,
  radicalStrokeCount: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockRadical = {
  id: 1,
  character: '日',
  kangxiNumber: 72,
  kangxiMeaning: 'sun',
  strokeCount: 4,
  shortMeaning: 'sun',
  searchKeywords: null,
  sourceKanjiId: null,
  description: null,
  canBeRadical: true,
  radicalNameJapanese: 'ひ',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockGetById = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
const mockComponentGetById = vi.fn()

vi.mock('@/api/kanji', () => ({
  useGroupMemberRepository: () => ({
    getByKanjiId: () => []
  }),
  useKanjiMeaningRepository: () => ({
    getByParentId: () => []
  }),
  useKanjiRepository: () => ({
    getById: mockGetById,
    update: mockUpdate,
    remove: mockRemove
  }),
  useKunReadingRepository: () => ({
    getByParentId: () => []
  }),
  useOnReadingRepository: () => ({
    getByParentId: () => []
  }),
  useReadingGroupRepository: () => ({
    getByParentId: () => []
  })
}))

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    getById: mockComponentGetById,
    getAll: () => []
  }),
  useComponentOccurrenceRepository: () => ({
    getByParentId: () => []
  }),
  useComponentFormRepository: () => ({
    getAll: () => []
  })
}))

vi.mock('@/api/position', () => ({
  usePositionTypeRepository: () => ({
    getAll: () => []
  })
}))

vi.mock('@/api/classification', () => ({
  useKanjiClassificationRepository: () => ({
    getByKanjiId: () => [],
    getByKanjiIdWithType: () => []
  }),
  useClassificationTypeRepository: () => ({
    getAll: () => []
  })
}))

vi.mock('@/api/vocabulary', () => ({
  useVocabKanjiRepository: () => ({
    getByKanjiId: () => [],
    getByKanjiIdWithVocabulary: () => []
  }),
  useVocabularyRepository: () => ({
    getAll: () => []
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

describe('KanjiDetailRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetById.mockReturnValue(mockKanji)
    mockComponentGetById.mockReturnValue(mockRadical)
  })

  it('renders loading state initially then kanji data', async () => {
    const wrapper = mount(KanjiDetailRoot, {
      global: {
        stubs: {
          BaseSpinner: true,
          KanjiDetailSectionActions: true,
          KanjiDetailSectionBasicInfo: true,
          KanjiDetailSectionHeadline: true,
          KanjiDetailSectionMeanings: true,
          KanjiDetailSectionReadings: true,
          KanjiDetailSectionVocabulary: true,
          KanjiDetailSectionComponents: true,
          KanjiDetailDialogComponents: true
        }
      }
    })

    await flushPromises()

    expect(mockGetById).toHaveBeenCalledWith(1)
    expect(
      wrapper.findComponent({ name: 'KanjiDetailSectionHeadline' }).exists()
    ).toBe(true)
    expect(
      wrapper.findComponent({ name: 'KanjiDetailSectionActions' }).exists()
    ).toBe(true)
  })

  it('renders error state when kanji not found', async () => {
    mockGetById.mockReturnValue(null)

    const wrapper = mount(KanjiDetailRoot, {
      global: {
        stubs: {
          BaseSpinner: true,
          KanjiDetailSectionActions: true,
          KanjiDetailSectionBasicInfo: true,
          KanjiDetailSectionHeadline: true,
          KanjiDetailSectionMeanings: true,
          KanjiDetailSectionReadings: true,
          KanjiDetailSectionVocabulary: true,
          KanjiDetailSectionComponents: true,
          KanjiDetailDialogComponents: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('not found')
  })

  it('fetches radical when kanji has radicalId', async () => {
    mount(KanjiDetailRoot, {
      global: {
        stubs: {
          BaseSpinner: true,
          KanjiDetailSectionActions: true,
          KanjiDetailSectionBasicInfo: true,
          KanjiDetailSectionHeadline: true,
          KanjiDetailSectionMeanings: true,
          KanjiDetailSectionReadings: true,
          KanjiDetailSectionVocabulary: true,
          KanjiDetailSectionComponents: true,
          KanjiDetailDialogComponents: true
        }
      }
    })

    await flushPromises()

    expect(mockComponentGetById).toHaveBeenCalledWith(1)
  })

  it('does not fetch radical when kanji has no radicalId', async () => {
    mockGetById.mockReturnValue({ ...mockKanji, radicalId: null })

    mount(KanjiDetailRoot, {
      global: {
        stubs: {
          BaseSpinner: true,
          KanjiDetailSectionActions: true,
          KanjiDetailSectionBasicInfo: true,
          KanjiDetailSectionHeadline: true,
          KanjiDetailSectionMeanings: true,
          KanjiDetailSectionReadings: true,
          KanjiDetailSectionVocabulary: true,
          KanjiDetailSectionComponents: true,
          KanjiDetailDialogComponents: true
        }
      }
    })

    await flushPromises()

    expect(mockComponentGetById).not.toHaveBeenCalled()
  })

  it('renders vocabulary section when kanji is loaded', async () => {
    const wrapper = mount(KanjiDetailRoot, {
      global: {
        stubs: {
          BaseSpinner: true,
          KanjiDetailSectionActions: true,
          KanjiDetailSectionBasicInfo: true,
          KanjiDetailSectionHeadline: true,
          KanjiDetailSectionMeanings: true,
          KanjiDetailSectionReadings: true,
          KanjiDetailSectionVocabulary: true,
          KanjiDetailSectionComponents: true,
          KanjiDetailDialogComponents: true
        }
      }
    })

    await flushPromises()

    expect(
      wrapper.findComponent({ name: 'KanjiDetailSectionVocabulary' }).exists()
    ).toBe(true)
  })
})
