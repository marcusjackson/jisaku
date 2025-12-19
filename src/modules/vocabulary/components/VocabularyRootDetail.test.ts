/**
 * Tests for VocabularyRootDetail component
 */

import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import VocabularyRootDetail from './VocabularyRootDetail.vue'

import type { Vocabulary } from '@/shared/types/database-types'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' }
  }),
  useRouter: () => ({
    push: mockPush
  }),
  RouterLink: {
    template: '<a><slot /></a>'
  }
}))

// Mock vocabulary data
const mockVocabulary: Vocabulary = {
  id: 1,
  word: '日本',
  kana: 'にほん',
  shortMeaning: 'Japan',
  searchKeywords: 'nippon',
  jlptLevel: 'N5',
  isCommon: true,
  description: 'The country of Japan',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

// Mock database - set isInitialized to true immediately
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    isInitialized: { value: true },
    isInitializing: { value: false },
    initError: { value: null },
    initialize: vi.fn().mockResolvedValue(undefined),
    persist: vi.fn().mockResolvedValue(undefined),
    exec: vi.fn(),
    run: vi.fn()
  })
}))

vi.mock('@/shared/composables/use-vocabulary-repository', () => ({
  useVocabularyRepository: () => ({
    getById: vi.fn().mockReturnValue(mockVocabulary),
    updateHeaderFields: vi.fn().mockReturnValue(mockVocabulary),
    updateBasicInfoField: vi.fn().mockReturnValue(mockVocabulary),
    remove: vi.fn()
  })
}))

vi.mock('@/shared/composables/use-vocab-kanji-repository', () => ({
  useVocabKanjiRepository: () => ({
    getByVocabIdWithKanji: vi.fn().mockReturnValue([]),
    create: vi.fn(),
    remove: vi.fn(),
    updateAnalysisNotes: vi.fn(),
    reorder: vi.fn()
  })
}))

vi.mock('@/shared/composables/use-kanji-repository', () => ({
  useKanjiRepository: () => ({
    getAll: vi.fn().mockReturnValue([])
  })
}))

vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

describe('VocabularyRootDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading spinner initially', () => {
    render(VocabularyRootDetail)
    // The component will be in loading state until onMounted completes
    // This is testing the initial render
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})
