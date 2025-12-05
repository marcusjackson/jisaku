/**
 * useRadicalRepository tests
 *
 * Tests for the radical repository composable.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createTestDatabase,
  seedRadical
} from '../../../../test/helpers/database'

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
    it('returns empty array when no radicals exist', () => {
      const { getAll } = useRadicalRepository()
      const result = getAll()
      expect(result).toEqual([])
    })

    it('returns all radicals ordered by number', () => {
      seedRadical(testDb, { character: '口', strokeCount: 3, number: 30 })
      seedRadical(testDb, { character: '人', strokeCount: 2, number: 9 })

      const { getAll } = useRadicalRepository()
      const result = getAll()

      expect(result).toHaveLength(2)
      expect(result[0]?.character).toBe('人') // number 9 first
      expect(result[1]?.character).toBe('口') // number 30 second
    })

    it('maps database columns to camelCase properties', () => {
      seedRadical(testDb, {
        character: '人',
        strokeCount: 2,
        number: 9,
        meaning: 'person',
        japaneseName: 'ひと'
      })

      const { getAll } = useRadicalRepository()
      const result = getAll()

      expect(result[0]).toMatchObject({
        character: '人',
        strokeCount: 2,
        number: 9,
        meaning: 'person',
        japaneseName: 'ひと'
      })
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('createdAt')
      expect(result[0]).toHaveProperty('updatedAt')
    })
  })

  describe('getById', () => {
    it('returns null when radical does not exist', () => {
      const { getById } = useRadicalRepository()
      const result = getById(999)
      expect(result).toBeNull()
    })

    it('returns radical by id', () => {
      const seeded = seedRadical(testDb, {
        character: '人',
        strokeCount: 2,
        number: 9
      })

      const { getById } = useRadicalRepository()
      const result = getById(seeded.id)

      expect(result).not.toBeNull()
      expect(result?.character).toBe('人')
    })
  })

  describe('getByNumber', () => {
    it('returns null when number does not exist', () => {
      const { getByNumber } = useRadicalRepository()
      const result = getByNumber(999)
      expect(result).toBeNull()
    })

    it('returns radical by Kangxi number', () => {
      seedRadical(testDb, { character: '人', strokeCount: 2, number: 9 })

      const { getByNumber } = useRadicalRepository()
      const result = getByNumber(9)

      expect(result).not.toBeNull()
      expect(result?.character).toBe('人')
    })
  })

  describe('getByCharacter', () => {
    it('returns null when character does not exist', () => {
      const { getByCharacter } = useRadicalRepository()
      const result = getByCharacter('龍')
      expect(result).toBeNull()
    })

    it('returns radical by character', () => {
      seedRadical(testDb, { character: '人', strokeCount: 2, number: 9 })

      const { getByCharacter } = useRadicalRepository()
      const result = getByCharacter('人')

      expect(result).not.toBeNull()
      expect(result?.number).toBe(9)
    })
  })

  describe('create', () => {
    it('creates a new radical', () => {
      const { create, getAll } = useRadicalRepository()

      const created = create({
        character: '人',
        strokeCount: 2,
        number: 9,
        meaning: 'person'
      })

      expect(created.character).toBe('人')
      expect(created.strokeCount).toBe(2)
      expect(created.number).toBe(9)
      expect(created.meaning).toBe('person')
      expect(created.id).toBeDefined()

      const all = getAll()
      expect(all).toHaveLength(1)
    })

    it('creates radical with all optional fields', () => {
      const { create } = useRadicalRepository()

      const created = create({
        character: '口',
        strokeCount: 3,
        number: 30,
        meaning: 'mouth',
        japaneseName: 'くち'
      })

      expect(created.meaning).toBe('mouth')
      expect(created.japaneseName).toBe('くち')
    })
  })

  describe('update', () => {
    it('updates radical fields', () => {
      const seeded = seedRadical(testDb, {
        character: '人',
        strokeCount: 2,
        number: 9
      })

      const { update } = useRadicalRepository()
      const updated = update(seeded.id, { meaning: 'person' })

      expect(updated.meaning).toBe('person')
      expect(updated.character).toBe('人') // unchanged
    })

    it('returns existing radical when no updates provided', () => {
      const seeded = seedRadical(testDb, {
        character: '人',
        strokeCount: 2,
        number: 9
      })

      const { update } = useRadicalRepository()
      const result = update(seeded.id, {})

      expect(result.id).toBe(seeded.id)
    })

    it('throws when radical not found', () => {
      const { update } = useRadicalRepository()

      expect(() => update(999, { meaning: 'test' })).toThrow(
        'Radical with id 999 not found'
      )
    })
  })

  describe('remove', () => {
    it('removes a radical', () => {
      const seeded = seedRadical(testDb, {
        character: '人',
        strokeCount: 2,
        number: 9
      })

      const { getAll, remove } = useRadicalRepository()
      expect(getAll()).toHaveLength(1)

      remove(seeded.id)

      expect(getAll()).toHaveLength(0)
    })
  })
})
