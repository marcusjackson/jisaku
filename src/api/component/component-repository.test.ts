/**
 * Component Repository Tests
 *
 * Unit tests for the component repository.
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
import { useComponentRepository } from './component-repository'

describe('useComponentRepository', function () {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getById', () => {
    it('returns null when component does not exist', () => {
      const repo = useComponentRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns component when it exists', () => {
      testDb.run(
        'INSERT INTO components (character, stroke_count, short_meaning) VALUES (?, ?, ?)',
        ['氵', 3, 'water radical']
      )

      const repo = useComponentRepository()
      const component = repo.getById(1)

      expect(component).not.toBeNull()
      expect(component?.character).toBe('氵')
      expect(component?.strokeCount).toBe(3)
      expect(component?.shortMeaning).toBe('water radical')
    })
  })

  describe('getByCharacter', () => {
    it('returns null when character not found', () => {
      const repo = useComponentRepository()
      expect(repo.getByCharacter('火')).toBeNull()
    })

    it('returns component when character exists', () => {
      testDb.run('INSERT INTO components (character) VALUES (?)', ['木'])

      const repo = useComponentRepository()
      const component = repo.getByCharacter('木')

      expect(component?.character).toBe('木')
    })
  })

  describe('getAll', () => {
    it('returns empty array when no components exist', () => {
      const repo = useComponentRepository()
      expect(repo.getAll()).toEqual([])
    })

    it('returns all components ordered by id desc', () => {
      testDb.run('INSERT INTO components (character) VALUES (?)', ['氵'])
      testDb.run('INSERT INTO components (character) VALUES (?)', ['火'])
      testDb.run('INSERT INTO components (character) VALUES (?)', ['木'])

      const repo = useComponentRepository()
      const all = repo.getAll()

      expect(all).toHaveLength(3)
      expect(all[0]?.character).toBe('木')
      expect(all[1]?.character).toBe('火')
      expect(all[2]?.character).toBe('氵')
    })
  })

  describe('getRadicals', () => {
    it('returns only components that can be radicals', () => {
      testDb.run(
        'INSERT INTO components (character, can_be_radical) VALUES (?, ?)',
        ['氵', 1]
      )
      testDb.run(
        'INSERT INTO components (character, can_be_radical) VALUES (?, ?)',
        ['木', 1]
      )
      testDb.run(
        'INSERT INTO components (character, can_be_radical) VALUES (?, ?)',
        ['口', 0]
      )

      const repo = useComponentRepository()
      const radicals = repo.getRadicals()

      expect(radicals).toHaveLength(2)
      expect(radicals[0]?.canBeRadical).toBe(true)
      expect(radicals[1]?.canBeRadical).toBe(true)
    })
  })

  describe('getByKangxiNumber', () => {
    it('returns null when no component with that kangxi number', () => {
      const repo = useComponentRepository()
      expect(repo.getByKangxiNumber(85)).toBeNull()
    })

    it('returns component with matching kangxi number', () => {
      testDb.run(
        'INSERT INTO components (character, kangxi_number, kangxi_meaning) VALUES (?, ?, ?)',
        ['水', 85, 'water']
      )

      const repo = useComponentRepository()
      const component = repo.getByKangxiNumber(85)

      expect(component?.kangxiNumber).toBe(85)
      expect(component?.kangxiMeaning).toBe('water')
    })
  })

  describe('create', () => {
    it('creates a component with required fields', () => {
      const repo = useComponentRepository()
      const component = repo.create({ character: '氵' })

      expect(component.id).toBe(1)
      expect(component.character).toBe('氵')
      expect(component.strokeCount).toBeNull()
      expect(component.canBeRadical).toBe(false)
    })

    it('creates a component with optional fields', () => {
      const repo = useComponentRepository()
      const component = repo.create({
        character: '水',
        strokeCount: 4,
        shortMeaning: 'water',
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water'
      })

      expect(component.character).toBe('水')
      expect(component.strokeCount).toBe(4)
      expect(component.canBeRadical).toBe(true)
      expect(component.kangxiNumber).toBe(85)
    })
  })

  describe('update', () => {
    it('throws EntityNotFoundError when component does not exist', () => {
      const repo = useComponentRepository()
      const throwFn = () => repo.update(999, { strokeCount: 5 })

      expect(throwFn).toThrow('Component with id 999 not found')
    })

    it('updates component fields', () => {
      testDb.run(
        'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
        ['氵', 3]
      )

      const repo = useComponentRepository()
      const updated = repo.update(1, {
        strokeCount: 4,
        shortMeaning: 'water variant'
      })

      expect(updated.strokeCount).toBe(4)
      expect(updated.shortMeaning).toBe('water variant')
    })

    it('returns unchanged component when no fields provided', () => {
      testDb.run(
        'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
        ['氵', 3]
      )

      const repo = useComponentRepository()
      const updated = repo.update(1, {})

      expect(updated.strokeCount).toBe(3)
    })
  })

  describe('updateField', () => {
    it('updates a single field', () => {
      testDb.run(
        'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
        ['氵', 3]
      )

      const repo = useComponentRepository()
      const updated = repo.updateField(1, 'shortMeaning', 'water radical')

      expect(updated.shortMeaning).toBe('water radical')
      expect(updated.strokeCount).toBe(3)
    })
  })

  describe('remove', () => {
    it('removes a component', () => {
      testDb.run('INSERT INTO components (character) VALUES (?)', ['氵'])

      const repo = useComponentRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('search', () => {
    beforeEach(() => {
      testDb.run(
        'INSERT INTO components (character, short_meaning, can_be_radical, kangxi_number) VALUES (?, ?, ?, ?)',
        ['水', 'water', 1, 85]
      )
      testDb.run(
        'INSERT INTO components (character, short_meaning, can_be_radical) VALUES (?, ?, ?)',
        ['氵', 'water variant', 0]
      )
      testDb.run(
        'INSERT INTO components (character, short_meaning, can_be_radical) VALUES (?, ?, ?)',
        ['火', 'fire', 1]
      )
    })

    it('returns all components when no filters applied', () => {
      const repo = useComponentRepository()
      const results = repo.search({})

      expect(results).toHaveLength(3)
    })

    it('filters by canBeRadical', () => {
      const repo = useComponentRepository()
      const results = repo.search({ canBeRadical: true })

      expect(results).toHaveLength(2)
      expect(results.every((c) => c.canBeRadical)).toBe(true)
    })

    it('filters by kangxiNumber', () => {
      const repo = useComponentRepository()
      const results = repo.search({ kangxiNumber: 85 })

      expect(results).toHaveLength(1)
      expect(results[0]?.kangxiNumber).toBe(85)
    })

    it('filters by search in character', () => {
      const repo = useComponentRepository()
      const results = repo.search({ search: '水' })

      expect(results).toHaveLength(1)
      expect(results[0]?.character).toBe('水')
    })

    it('filters by search in meaning', () => {
      const repo = useComponentRepository()
      const results = repo.search({ search: 'water' })

      expect(results).toHaveLength(2)
    })

    it('filters by kangxiSearch with number', () => {
      const repo = useComponentRepository()
      const results = repo.search({ kangxiSearch: '85' })

      expect(results).toHaveLength(1)
      expect(results[0]?.kangxiNumber).toBe(85)
    })

    it('filters by kangxiSearch with meaning text', () => {
      testDb.run(
        'INSERT INTO components (character, kangxi_number, kangxi_meaning) VALUES (?, ?, ?)',
        ['人', 9, 'person']
      )

      const repo = useComponentRepository()
      const results = repo.search({ kangxiSearch: 'person' })

      expect(results).toHaveLength(1)
      expect(results[0]?.kangxiMeaning).toBe('person')
    })

    it('kangxiSearch does not search short_meaning', () => {
      const repo = useComponentRepository()
      const results = repo.search({ kangxiSearch: 'water' })

      // Should NOT match the short_meaning field
      expect(results).toHaveLength(0)
    })
  })
})
