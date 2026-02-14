/**
 * Vocab List Root Tests
 *
 * Tests for the root vocabulary list component.
 * Full integration testing is done via E2E tests.
 */

import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VocabListRoot from './VocabListRoot.vue'

// Mock database
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    isInitializing: { value: false },
    isInitialized: { value: false },
    initError: { value: null },
    initialize: vi.fn().mockResolvedValue(undefined)
  })
}))

// Mock router
vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: {}
  }),
  useRouter: () => ({
    replace: vi.fn()
  })
}))

// Mock repositories
vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({
    search: vi.fn().mockReturnValue([]),
    getAll: vi.fn().mockReturnValue([])
  })
}))

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    getAll: vi.fn().mockReturnValue([])
  })
}))

describe('VocabListRoot', () => {
  it('renders without crashing', () => {
    const { container } = render(VocabListRoot)
    expect(container).toBeTruthy()
  })

  it('mounts with content', () => {
    const { container } = render(VocabListRoot)
    expect(container.innerHTML.length).toBeGreaterThan(0)
  })
})
