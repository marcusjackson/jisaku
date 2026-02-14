/**
 * Position Type Repository Tests
 */

import { createTestDatabase } from '@test/helpers/database'
import { beforeEach, describe, expect, it } from 'vitest'

import type { Database } from 'sql.js'

// We need to mock the useDatabase composable
let testDb: Database

// Mock useDatabase
vi.mock('@/legacy/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { usePositionTypeRepository } from './use-position-type-repository'

describe('usePositionTypeRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getAll', () => {
    it('returns all position types ordered by display_order', () => {
      const { getAll } = usePositionTypeRepository()
      const positionTypes = getAll()

      // Should have the prepopulated position types from migration
      expect(positionTypes.length).toBeGreaterThan(0)

      // Check ordering by display_order
      for (let i = 1; i < positionTypes.length; i++) {
        const prev = positionTypes[i - 1]
        const curr = positionTypes[i]
        if (prev && curr) {
          expect(prev.displayOrder).toBeLessThanOrEqual(curr.displayOrder)
        }
      }
    })

    it('includes expected prepopulated position types', () => {
      const { getAll } = usePositionTypeRepository()
      const positionTypes = getAll()

      const positionNames = positionTypes.map((pt) => pt.positionName)

      // Check for expected positions from migration
      expect(positionNames).toContain('hen')
      expect(positionNames).toContain('tsukuri')
      expect(positionNames).toContain('kanmuri')
      expect(positionNames).toContain('ashi')
    })

    it('returns position types with all required fields', () => {
      const { getAll } = usePositionTypeRepository()
      const positionTypes = getAll()

      expect(positionTypes.length).toBeGreaterThan(0)

      const firstPosition = positionTypes[0]
      expect(firstPosition).toBeDefined()
      expect(typeof firstPosition?.id).toBe('number')
      expect(typeof firstPosition?.positionName).toBe('string')
      expect(typeof firstPosition?.displayOrder).toBe('number')
      expect(typeof firstPosition?.createdAt).toBe('string')
      expect(typeof firstPosition?.updatedAt).toBe('string')
    })
  })

  describe('getById', () => {
    it('returns position type by id', () => {
      const { getAll, getById } = usePositionTypeRepository()
      const allPositions = getAll()
      const firstPosition = allPositions[0]

      expect(firstPosition).toBeDefined()

      if (firstPosition) {
        const retrieved = getById(firstPosition.id)
        expect(retrieved).toEqual(firstPosition)
      }
    })

    it('returns null when position type not found', () => {
      const { getById } = usePositionTypeRepository()
      const result = getById(999999)

      expect(result).toBeNull()
    })
  })
})
