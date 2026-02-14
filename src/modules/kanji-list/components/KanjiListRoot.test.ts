/**
 * KanjiListRoot Tests
 *
 * Tests for the root kanji list component.
 * Note: This is a complex component with many dependencies.
 * Full integration testing should be done via E2E tests.
 */

import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListRoot from './KanjiListRoot.vue'

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
vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    search: vi.fn().mockReturnValue([])
  })
}))

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    getAll: vi.fn().mockReturnValue([]),
    getRadicals: vi.fn().mockReturnValue([])
  })
}))

vi.mock('@/api/classification', () => ({
  useClassificationTypeRepository: () => ({
    getAll: vi.fn().mockReturnValue([])
  }),
  useKanjiClassificationRepository: () => ({
    getByKanjiIdWithType: vi.fn().mockReturnValue([])
  })
}))

vi.mock('@/shared/composables', () => ({
  useSeedData: () => ({
    isSeeding: { value: false },
    seed: vi.fn()
  }),
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn()
  })
}))

describe('KanjiListRoot', () => {
  it('renders without crashing', () => {
    const { container } = render(KanjiListRoot)

    // Component should mount and render
    expect(container).toBeTruthy()
  })

  it('mounts with child components', () => {
    const { container } = render(KanjiListRoot)

    // Should have some content (loading, filters, or list)
    expect(container.innerHTML.length).toBeGreaterThan(0)
  })
})
