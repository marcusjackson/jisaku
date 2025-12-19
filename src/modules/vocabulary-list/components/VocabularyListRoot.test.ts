/**
 * Tests for VocabularyListRoot component
 *
 * Root-level tests focus on orchestration and integration.
 * Detailed behavior testing is done in child component tests and E2E.
 */

import { ref } from 'vue'

import { cleanup, render, screen, waitFor } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import VocabularyListRoot from './VocabularyListRoot.vue'

// Mock database
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    isInitializing: ref(false),
    isInitialized: ref(true),
    initError: ref(null),
    initialize: vi.fn().mockResolvedValue(undefined),
    persist: vi.fn().mockResolvedValue(undefined)
  })
}))

// Mock vocabulary repository
vi.mock('@/shared/composables/use-vocabulary-repository', () => ({
  useVocabularyRepository: () => ({
    create: vi.fn().mockResolvedValue({ id: 1 }),
    search: vi.fn().mockReturnValue([])
  })
}))

// Mock kanji repository
vi.mock('@/shared/composables/use-kanji-repository', () => ({
  useKanjiRepository: () => ({
    getAll: vi.fn().mockReturnValue([])
  })
}))

// Mock vocab-kanji repository
vi.mock('@/shared/composables/use-vocab-kanji-repository', () => ({
  useVocabKanjiRepository: () => ({
    getByVocabId: vi.fn().mockResolvedValue([])
  })
}))

// Mock toast
vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

// Mock filter persistence
vi.mock('@/shared/composables/use-filter-persistence', () => ({
  useFilterPersistence: vi.fn()
}))

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    query: {}
  })
}))

describe('VocabularyListRoot', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('renders page title', async () => {
    render(VocabularyListRoot)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /vocabulary/i })
      ).toBeInTheDocument()
    })
  })

  it('renders filters section', async () => {
    render(VocabularyListRoot)

    await waitFor(() => {
      expect(screen.getByLabelText('Filter vocabulary')).toBeInTheDocument()
    })
  })

  it('shows empty state when no vocabulary', async () => {
    render(VocabularyListRoot)

    await waitFor(() => {
      expect(screen.getByText(/no vocabulary yet/i)).toBeInTheDocument()
    })
  })
})
