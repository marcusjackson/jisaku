/**
 * Tests for ComponentListRoot component
 *
 * Tests the root component's responsibility for:
 * - Database initialization
 * - Loading states
 * - Error handling
 * - Passing data to section components
 */

import { ref } from 'vue'

import { createTestDatabase, seedComponent } from '@test/helpers/database'
import { screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// Test database instance
let testDb: Database

// Create reactive refs for mocking
const mockIsInitialized = ref(false)
const mockIsInitializing = ref(true)
const mockInitError = ref<Error | null>(null)
const mockInitialize = vi.fn()

vi.mock('@/legacy/shared/composables/use-database', () => ({
  useDatabase: () => ({
    initialize: mockInitialize,
    isInitialized: mockIsInitialized,
    isInitializing: mockIsInitializing,
    initError: mockInitError,
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { renderWithProviders } from '@test/helpers/render'

import ComponentListRoot from './ComponentListRoot.vue'

describe('ComponentListRoot', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
    vi.clearAllMocks()

    // Reset mock state
    mockIsInitialized.value = false
    mockIsInitializing.value = true
    mockInitError.value = null
    mockInitialize.mockResolvedValue(undefined)
  })

  describe('loading state', () => {
    it('shows loading spinner while database initializing', () => {
      mockIsInitializing.value = true
      mockIsInitialized.value = false

      renderWithProviders(ComponentListRoot)

      expect(
        screen.getByRole('status', { name: /loading/i })
      ).toBeInTheDocument()
      expect(screen.getAllByText(/loading database/i).length).toBeGreaterThan(0)
    })
  })

  describe('error state', () => {
    it('shows error message when initialization fails', () => {
      mockIsInitializing.value = false
      mockIsInitialized.value = false
      mockInitError.value = new Error('Database initialization failed')

      renderWithProviders(ComponentListRoot)

      expect(screen.getByText(/failed to load/i)).toBeInTheDocument()
      expect(
        screen.getByText(/database initialization failed/i)
      ).toBeInTheDocument()
    })
  })

  describe('success state', () => {
    it('shows empty state when no components exist', async () => {
      mockIsInitializing.value = false
      mockIsInitialized.value = true

      renderWithProviders(ComponentListRoot)

      await waitFor(() => {
        expect(screen.getByText(/no components yet/i)).toBeInTheDocument()
      })
    })

    it('displays component list when components exist', async () => {
      seedComponent(testDb, { character: '亻', strokeCount: 2 })
      seedComponent(testDb, { character: '氵', strokeCount: 3 })

      mockIsInitializing.value = false
      mockIsInitialized.value = true

      renderWithProviders(ComponentListRoot)

      await waitFor(() => {
        expect(screen.getByText('亻')).toBeInTheDocument()
        expect(screen.getByText('氵')).toBeInTheDocument()
      })
    })

    it('calls initialize on mount', async () => {
      mockIsInitializing.value = false
      mockIsInitialized.value = true

      renderWithProviders(ComponentListRoot)

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalledTimes(1)
      })
    })
  })
})
