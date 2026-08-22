/**
 * Component Queries Tests
 *
 * Unit tests for read-only component query operations,
 * specifically the count methods that use rowToObject().
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
import { ComponentQueries } from './component-queries'

describe('ComponentQueries', function () {
  let componentId1: number
  let componentId2: number

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testDb.run(
      'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
      ['水', 4]
    )
    componentId1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number

    testDb.run(
      'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
      ['山', 3]
    )
    componentId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getFormsCount', () => {
    it('returns an empty map when no forms exist', () => {
      const queries = new ComponentQueries()
      expect(queries.getFormsCount().size).toBe(0)
    })

    it('returns correct count for a single component with forms', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId1, '氵', 0]
      )
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId1, '氺', 1]
      )

      const queries = new ComponentQueries()
      const map = queries.getFormsCount()

      expect(map.get(componentId1)).toBe(2)
      expect(map.has(componentId2)).toBe(false)
    })

    it('returns correct counts for multiple components', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId1, '氵', 0]
      )
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId2, '峰', 0]
      )
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId2, '崖', 1]
      )

      const queries = new ComponentQueries()
      const map = queries.getFormsCount()

      expect(map.get(componentId1)).toBe(1)
      expect(map.get(componentId2)).toBe(2)
    })
  })

  describe('getGroupingsCount', () => {
    it('returns an empty map when no groupings exist', () => {
      const queries = new ComponentQueries()
      expect(queries.getGroupingsCount().size).toBe(0)
    })

    it('returns correct count for a single component with groupings', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId1, 'Group A', 0]
      )
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId1, 'Group B', 1]
      )
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId1, 'Group C', 2]
      )

      const queries = new ComponentQueries()
      const map = queries.getGroupingsCount()

      expect(map.get(componentId1)).toBe(3)
      expect(map.has(componentId2)).toBe(false)
    })

    it('returns correct counts for multiple components', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId1, 'Group A', 0]
      )
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId2, 'Group X', 0]
      )
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId2, 'Group Y', 1]
      )

      const queries = new ComponentQueries()
      const map = queries.getGroupingsCount()

      expect(map.get(componentId1)).toBe(1)
      expect(map.get(componentId2)).toBe(2)
    })
  })
})
