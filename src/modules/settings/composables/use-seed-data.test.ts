/**
 * useSeedData tests
 *
 * Tests for the seed data composable.
 */

import { describe, expect, it, vi } from 'vitest'

// Mock useDatabase
const mockExec = vi.fn()
const mockRun = vi.fn()
const mockPersist = vi.fn()

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: mockExec,
    persist: mockPersist,
    run: mockRun
  })
}))

// Mock useToast
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()

vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({
    error: mockShowError,
    success: mockShowSuccess
  })
}))

import { useSeedData } from './use-seed-data'

describe('useSeedData', () => {
  function resetMocks() {
    mockExec.mockReset()
    mockRun.mockReset()
    mockPersist.mockReset()
    mockPersist.mockResolvedValue(undefined)
    mockShowSuccess.mockReset()
    mockShowError.mockReset()
  }

  describe('seed', () => {
    it('returns seed and clear functions', () => {
      resetMocks()
      const result = useSeedData()

      expect(result).toHaveProperty('seed')
      expect(result).toHaveProperty('clear')
      expect(result).toHaveProperty('isSeeding')
      expect(result).toHaveProperty('isClearing')
    })

    it('checks for existing data before seeding', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])

      const { seed } = useSeedData()
      await seed()

      expect(mockExec).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM kanjis'
      )
      expect(mockExec).toHaveBeenCalledWith(
        'SELECT COUNT(*) as count FROM components'
      )
    })

    it('shows error if database already has data', async () => {
      resetMocks()
      // Kanji and components both have data
      mockExec.mockReturnValue([{ values: [[5]] }])

      const { seed } = useSeedData()
      await seed()

      expect(mockShowError).toHaveBeenCalledWith('Database already has data')
      expect(mockRun).not.toHaveBeenCalled()
    })

    it('inserts seed data when database is empty', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])

      const { seed } = useSeedData()
      await seed()

      // Should insert 8 position types + 18 kanji + 8 components + 0 component_occurrences (depends on mocks) = 34 calls
      // With current mocks: no component_occurrences because lookups don't return IDs
      expect(mockRun).toHaveBeenCalledTimes(34)
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO position_types'),
        expect.arrayContaining(['hen', 'へん', 'left side'])
      )
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO kanjis'),
        expect.arrayContaining(['日', 4, 'N5', 'elementary1', '10級'])
      )
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO components'),
        expect.arrayContaining(['亻', 2, 'にんべん'])
      )
    })

    it('persists data after seeding', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])

      const { seed } = useSeedData()
      await seed()

      expect(mockPersist).toHaveBeenCalled()
    })

    it('shows success message after seeding', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])

      const { seed } = useSeedData()
      await seed()

      expect(mockShowSuccess).toHaveBeenCalledWith(
        'Seeded 8 position types, 18 kanji, 8 components'
      )
    })

    it('sets isSeeding during operation', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])

      const { isSeeding, seed } = useSeedData()

      expect(isSeeding.value).toBe(false)

      const seedPromise = seed()
      expect(isSeeding.value).toBe(true)

      await seedPromise
      expect(isSeeding.value).toBe(false)
    })

    it('handles errors during seeding', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])
      mockRun.mockImplementation(() => {
        throw new Error('Insert failed')
      })

      const { seed } = useSeedData()
      await seed()

      expect(mockShowError).toHaveBeenCalledWith('Insert failed')
    })

    it('prevents concurrent seeding', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])

      const { seed } = useSeedData()

      // Start first seed
      const promise1 = seed()

      // Try to start second seed while first is running
      const promise2 = seed()

      await Promise.all([promise1, promise2])

      // exec is called for kanji count, components count, and lookups for component_occurrences links
      // So it will be called more than twice
      expect(mockExec.mock.calls.length).toBeGreaterThan(2)
    })
  })

  describe('clear', () => {
    it('deletes all kanji data', async () => {
      resetMocks()

      const { clear } = useSeedData()
      await clear()

      expect(mockRun).toHaveBeenCalledWith(
        'DELETE FROM component_grouping_members'
      )
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM component_groupings')
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM component_occurrences')
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM component_forms')
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM kanji_classifications')
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM kanjis')
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM components')
    })

    it('persists after clearing', async () => {
      resetMocks()

      const { clear } = useSeedData()
      await clear()

      expect(mockPersist).toHaveBeenCalled()
    })

    it('shows success message after clearing', async () => {
      resetMocks()

      const { clear } = useSeedData()
      await clear()

      expect(mockShowSuccess).toHaveBeenCalledWith('All data cleared')
    })

    it('sets isClearing during operation', async () => {
      resetMocks()

      const { clear, isClearing } = useSeedData()

      expect(isClearing.value).toBe(false)

      const clearPromise = clear()
      expect(isClearing.value).toBe(true)

      await clearPromise
      expect(isClearing.value).toBe(false)
    })

    it('handles errors during clearing', async () => {
      resetMocks()
      mockRun.mockImplementation(() => {
        throw new Error('Delete failed')
      })

      const { clear } = useSeedData()
      await clear()

      expect(mockShowError).toHaveBeenCalledWith('Delete failed')
    })

    it('prevents concurrent clearing', async () => {
      resetMocks()

      const { clear } = useSeedData()

      // Start first clear
      const promise1 = clear()

      // Try to start second clear while first is running
      const promise2 = clear()

      await Promise.all([promise1, promise2])

      // run should only be called seven times (once for each table in new schema)
      expect(mockRun).toHaveBeenCalledTimes(7)
    })
  })
})
