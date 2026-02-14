/**
 * Component List Root Tests
 *
 * Tests for the root component list component.
 * Note: This is a complex component with many dependencies.
 * Full integration testing should be done via E2E tests.
 */

import { render } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentListRoot from './ComponentListRoot.vue'

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
vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
    search: vi.fn().mockReturnValue([]),
    getAll: vi.fn().mockReturnValue([]),
    getFormsCount: vi.fn().mockReturnValue(new Map()),
    getGroupingsCount: vi.fn().mockReturnValue(new Map())
  })
}))

describe('ComponentListRoot', () => {
  it('renders without crashing', () => {
    const { container } = render(ComponentListRoot)

    // Component should mount and render
    expect(container).toBeTruthy()
  })

  it('mounts with child components', () => {
    const { container } = render(ComponentListRoot)

    // Should have some content (loading, filters, or list)
    expect(container.innerHTML.length).toBeGreaterThan(0)
  })
})
