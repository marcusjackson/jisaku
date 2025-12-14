/**
 * useRadicalRepository tests
 *
 * Tests for the radical repository composable.
 * Radicals are now stored in the components table with canBeRadical=true.
 */

import { createTestDatabase, seedComponent } from '@test/helpers/database'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// Mock the database composable
let testDb: Database
const mockExec = vi.fn((sql: string, params?: unknown[]) => {
  return testDb.exec(sql, params)
})
const mockRun = vi.fn((sql: string, params?: unknown[]) => {
  return testDb.run(sql, params)
})

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: mockExec,
    run: mockRun
  })
}))

import { useRadicalRepository } from './use-radical-repository'

describe('useRadicalRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
    vi.clearAllMocks()
  })

  afterEach(() => {
    testDb.close()
  })

  describe('getAll', () => {
    it('returns empty array when no radical components exist', () => {
      const { getAll } = useRadicalRepository()
      const result = getAll()
      expect(result).toEqual([])
    })

    it('returns only components with canBeRadical=true', () => {
      // Seed a regular component (not a radical)
      seedComponent(testDb, {
        character: '氵',
        strokeCount: 3,
        canBeRadical: false
      })

      // Seed a radical component
      seedComponent(testDb, {
        character: '水',
        strokeCount: 4,
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water'
      })

      const { getAll } = useRadicalRepository()
      const result = getAll()

      expect(result).toHaveLength(1)
      expect(result[0]?.character).toBe('水')
      expect(result[0]?.canBeRadical).toBe(true)
      expect(result[0]?.kangxiNumber).toBe(85)
    })

    it('returns radicals ordered by kangxi number', () => {
      seedComponent(testDb, {
        character: '火',
        strokeCount: 4,
        canBeRadical: true,
        kangxiNumber: 86,
        kangxiMeaning: 'fire'
      })

      seedComponent(testDb, {
        character: '水',
        strokeCount: 4,
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water'
      })

      const { getAll } = useRadicalRepository()
      const result = getAll()

      expect(result).toHaveLength(2)
      expect(result[0]?.kangxiNumber).toBe(85)
      expect(result[1]?.kangxiNumber).toBe(86)
    })
  })

  describe('getById', () => {
    it('returns null when radical does not exist', () => {
      const { getById } = useRadicalRepository()
      const result = getById(999)
      expect(result).toBeNull()
    })

    it('returns null for non-radical components', () => {
      const component = seedComponent(testDb, {
        character: '氵',
        strokeCount: 3,
        canBeRadical: false
      })

      const { getById } = useRadicalRepository()
      const result = getById(component.id)

      expect(result).toBeNull()
    })

    it('returns radical component by id', () => {
      const radical = seedComponent(testDb, {
        character: '水',
        strokeCount: 4,
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water'
      })

      const { getById } = useRadicalRepository()
      const result = getById(radical.id)

      expect(result).not.toBeNull()
      expect(result?.character).toBe('水')
      expect(result?.kangxiMeaning).toBe('water')
    })
  })

  describe('getByNumber', () => {
    it('returns null when kangxi number does not exist', () => {
      const { getByNumber } = useRadicalRepository()
      const result = getByNumber(999)
      expect(result).toBeNull()
    })

    it('returns radical by kangxi number', () => {
      seedComponent(testDb, {
        character: '水',
        strokeCount: 4,
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water'
      })

      const { getByNumber } = useRadicalRepository()
      const result = getByNumber(85)

      expect(result).not.toBeNull()
      expect(result?.character).toBe('水')
    })
  })

  describe('getByCharacter', () => {
    it('returns null when character does not exist', () => {
      const { getByCharacter } = useRadicalRepository()
      const result = getByCharacter('龍')
      expect(result).toBeNull()
    })

    it('returns null for non-radical with matching character', () => {
      seedComponent(testDb, {
        character: '氵',
        strokeCount: 3,
        canBeRadical: false
      })

      const { getByCharacter } = useRadicalRepository()
      const result = getByCharacter('氵')

      expect(result).toBeNull()
    })

    it('returns radical by character', () => {
      seedComponent(testDb, {
        character: '水',
        strokeCount: 4,
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water'
      })

      const { getByCharacter } = useRadicalRepository()
      const result = getByCharacter('水')

      expect(result).not.toBeNull()
      expect(result?.kangxiNumber).toBe(85)
    })
  })
})
