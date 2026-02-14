/**
 * VocabDetailRoot Tests
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import VocabDetailRoot from './VocabDetailRoot.vue'

// Mock dependencies
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' }
  }),
  useRouter: () => ({
    push: vi.fn()
  })
}))

const mockVocab = {
  id: 1,
  word: '日本語',
  kana: 'にほんご',
  shortMeaning: 'Japanese language',
  searchKeywords: 'language nihongo',
  jlptLevel: 'N5' as const,
  isCommon: true,
  description: 'The Japanese language',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

const mockGetById = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()

vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({
    getById: mockGetById,
    update: mockUpdate,
    remove: mockRemove
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

describe('VocabDetailRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetById.mockReturnValue(mockVocab)
  })

  it('renders loading initially then vocab data', async () => {
    const wrapper = mount(VocabDetailRoot, {
      global: {
        stubs: {
          VocabDetailSectionHeadline: true,
          VocabDetailSectionActions: true
        }
      }
    })

    await flushPromises()

    expect(mockGetById).toHaveBeenCalledWith(1)
    expect(wrapper.find('vocab-detail-section-headline-stub').exists()).toBe(
      true
    )
  })

  it('displays error when vocabulary not found', async () => {
    mockGetById.mockReturnValue(null)

    const wrapper = mount(VocabDetailRoot, {
      global: {
        stubs: {
          VocabDetailSectionHeadline: true,
          VocabDetailSectionActions: true
        }
      }
    })

    await flushPromises()

    expect(wrapper.text()).toContain('Vocabulary with ID 1 not found')
  })
})
