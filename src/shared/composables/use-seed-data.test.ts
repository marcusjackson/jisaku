/**
 * useSeedData tests
 */

import { describe, expect, it, vi } from 'vitest'

// Mock useDatabase
const mockExec = vi.fn()
const mockRun = vi.fn()
const mockPersist = vi.fn()

vi.mock('./use-database', () => ({
  useDatabase: () => ({
    exec: mockExec,
    persist: mockPersist,
    run: mockRun
  })
}))

// Mock useToast
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()

vi.mock('./use-toast', () => ({
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

      // Implementation now uses SELECT COUNT(*) FROM instead of SELECT COUNT(*) as count FROM
      expect(mockExec).toHaveBeenCalledWith('SELECT COUNT(*) FROM kanjis')
      expect(mockExec).toHaveBeenCalledWith('SELECT COUNT(*) FROM components')
    })

    it('shows error if database already has data', async () => {
      resetMocks()
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

      // Should call run for position types + kanji + components + vocabulary
      expect(mockRun).toHaveBeenCalled()
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO position_types'),
        expect.arrayContaining(['hen', 'へん', 'left side'])
      )
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO kanjis'),
        expect.arrayContaining(['日', 4, 'N5', 'elementary1', '10'])
      )
    })

    it('persists data after seeding', async () => {
      resetMocks()
      mockExec.mockReturnValue([{ values: [[0]] }])

      const { seed } = useSeedData()
      await seed()

      expect(mockPersist).toHaveBeenCalled()
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
  })

  describe('clear', () => {
    it('deletes all data from tables', async () => {
      resetMocks()

      const { clear } = useSeedData()
      await clear()

      expect(mockRun).toHaveBeenCalledWith('DELETE FROM vocab_kanji')
      expect(mockRun).toHaveBeenCalledWith('DELETE FROM vocabulary')
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
  })

  describe('seedDataCounts', () => {
    it('exposes seed data counts for testing', () => {
      resetMocks()
      const { seedDataCounts } = useSeedData()

      expect(seedDataCounts.kanji).toBeGreaterThan(0)
      expect(seedDataCounts.components).toBeGreaterThan(0)
      expect(seedDataCounts.positionTypes).toBeGreaterThan(0)
      expect(seedDataCounts.vocabulary).toBeGreaterThan(0)
    })
  })
})
