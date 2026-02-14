/**
 * Position Type Repository Tests
 *
 * Unit tests for position type (reference data) repository.
 */

import { createTestDatabase } from '@test/helpers/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// Test database instance
let testDb: Database

// Mock useDatabase
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Mock schedulePersist
vi.mock('@/db/indexeddb', () => ({
  schedulePersist: vi.fn()
}))

// Import after mocking
import { usePositionTypeRepository } from './position-type-repository'

describe('usePositionTypeRepository', function () {
  beforeEach(async () => {
    testDb = await createTestDatabase()
    // Test database is prepopulated with position types
  })

  describe('getAll', () => {
    it('returns prepopulated position types', () => {
      const repo = usePositionTypeRepository()
      const types = repo.getAll()

      expect(types.length).toBeGreaterThan(0)
      expect(types[0]?.positionName).toBe('hen')
    })

    it('returns types ordered by display_order', () => {
      const repo = usePositionTypeRepository()
      const types = repo.getAll()

      expect(types[0]?.displayOrder).toBe(1)
      expect(types[1]?.displayOrder).toBe(2)
    })
  })

  describe('getById', () => {
    it('returns null when type does not exist', () => {
      const repo = usePositionTypeRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns type when it exists', () => {
      const repo = usePositionTypeRepository()
      const type = repo.getById(1)

      expect(type?.positionName).toBe('hen')
      expect(type?.nameJapanese).toBe('偏')
    })
  })

  describe('getByPositionName', () => {
    it('returns null when position name not found', () => {
      const repo = usePositionTypeRepository()
      expect(repo.getByPositionName('nonexistent')).toBeNull()
    })

    it('returns type when name exists', () => {
      const repo = usePositionTypeRepository()
      const type = repo.getByPositionName('tsukuri')

      expect(type?.nameJapanese).toBe('旁')
    })
  })

  describe('create', () => {
    it('creates a new position type', () => {
      const repo = usePositionTypeRepository()
      const type = repo.create({
        positionName: 'custom_position',
        nameJapanese: 'カスタム',
        nameEnglish: 'Custom Position'
      })

      expect(type.positionName).toBe('custom_position')
      expect(type.nameJapanese).toBe('カスタム')
    })
  })

  describe('update', () => {
    it('throws when type does not exist', () => {
      const repo = usePositionTypeRepository()
      const throwFn = () => repo.update(999, { positionName: 'test' })

      expect(throwFn).toThrow('PositionType with id 999 not found')
    })

    it('updates type fields', () => {
      const repo = usePositionTypeRepository()
      const updated = repo.update(1, {
        description: 'Updated description'
      })

      expect(updated.description).toBe('Updated description')
      expect(updated.positionName).toBe('hen') // Unchanged
    })
  })

  describe('remove', () => {
    it('removes a position type', () => {
      const repo = usePositionTypeRepository()
      const created = repo.create({ positionName: 'to_delete' })

      repo.remove(created.id)

      expect(repo.getById(created.id)).toBeNull()
    })
  })

  describe('reorder', () => {
    it('reorders types by new id sequence', () => {
      const repo = usePositionTypeRepository()
      repo.reorder([2, 1])

      const types = repo.getAll()
      const type1 = types.find((t) => t.id === 1)
      const type2 = types.find((t) => t.id === 2)

      expect(type2?.displayOrder).toBe(0)
      expect(type1?.displayOrder).toBe(1)
    })
  })
})
