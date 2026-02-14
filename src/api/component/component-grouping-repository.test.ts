/**
 * Component Grouping Repository Tests
 *
 * Unit tests for component pattern grouping repository.
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
import { useComponentGroupingRepository } from './component-grouping-repository'

describe('useComponentGroupingRepository', function () {
  let componentId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()

    // Create a component
    testDb.run(
      'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
      ['水', 4]
    )
    componentId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByParentId', () => {
    it('returns empty array when no groupings exist', () => {
      const repo = useComponentGroupingRepository()
      expect(repo.getByParentId(componentId)).toEqual([])
    })

    it('returns groupings ordered by display_order', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'Left side', 0]
      )
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'Right side', 1]
      )

      const repo = useComponentGroupingRepository()
      const groupings = repo.getByParentId(componentId)

      expect(groupings).toHaveLength(2)
      expect(groupings[0]?.name).toBe('Left side')
      expect(groupings[1]?.name).toBe('Right side')
    })
  })

  describe('getById', () => {
    it('returns null when grouping does not exist', () => {
      const repo = useComponentGroupingRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns grouping when it exists', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, description) VALUES (?, ?, ?)',
        [componentId, 'Left side', 'Appears on the left']
      )

      const repo = useComponentGroupingRepository()
      const grouping = repo.getById(1)

      expect(grouping?.name).toBe('Left side')
      expect(grouping?.description).toBe('Appears on the left')
      expect(grouping?.componentId).toBe(componentId)
    })
  })

  describe('create', () => {
    it('creates a grouping with required fields', () => {
      const repo = useComponentGroupingRepository()
      const grouping = repo.create({
        componentId,
        name: 'Left side'
      })

      expect(grouping.id).toBe(1)
      expect(grouping.name).toBe('Left side')
      expect(grouping.componentId).toBe(componentId)
      expect(grouping.description).toBeNull()
    })

    it('creates a grouping with optional fields', () => {
      const repo = useComponentGroupingRepository()
      const grouping = repo.create({
        componentId,
        name: 'Left side',
        description: 'Appears on the left side of kanji'
      })

      expect(grouping.description).toBe('Appears on the left side of kanji')
    })

    it('auto-increments display_order', () => {
      const repo = useComponentGroupingRepository()

      repo.create({ componentId, name: 'First' })
      const second = repo.create({ componentId, name: 'Second' })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when grouping does not exist', () => {
      const repo = useComponentGroupingRepository()
      const throwFn = () => repo.update(999, { name: 'New name' })

      expect(throwFn).toThrow('ComponentGrouping with id 999 not found')
    })

    it('updates grouping name', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Left side']
      )

      const repo = useComponentGroupingRepository()
      const updated = repo.update(1, { name: 'Right side' })

      expect(updated.name).toBe('Right side')
    })

    it('updates description', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Left side']
      )

      const repo = useComponentGroupingRepository()
      const updated = repo.update(1, { description: 'New description' })

      expect(updated.description).toBe('New description')
    })
  })

  describe('remove', () => {
    it('removes a grouping', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Left side']
      )

      const repo = useComponentGroupingRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('removeByComponentId', () => {
    it('removes all groupings for a component', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Left side']
      )
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Right side']
      )

      const repo = useComponentGroupingRepository()
      repo.removeByComponentId(componentId)

      expect(repo.getByParentId(componentId)).toEqual([])
    })
  })

  describe('reorder', () => {
    it('reorders groupings by new id sequence', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'First', 0]
      )
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'Second', 1]
      )

      const repo = useComponentGroupingRepository()
      repo.reorder([2, 1])

      const groupings = repo.getByParentId(componentId)
      expect(groupings[0]?.name).toBe('Second')
      expect(groupings[1]?.name).toBe('First')
    })
  })
})
