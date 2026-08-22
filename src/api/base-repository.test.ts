/**
 * Base Repository Tests
 *
 * Tests for the protected utility methods: withTransaction and getMaxDisplayOrder.
 * Uses a concrete test subclass to exercise the protected API.
 */

import { createTestDatabase } from '@test/helpers/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

let testDb: Database

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

vi.mock('@/db/indexeddb', () => ({
  schedulePersist: vi.fn()
}))

import { BaseRepository } from './base-repository'

// Minimal concrete subclass that exposes the protected helpers for testing
class TestRepository extends BaseRepository<{ id: number; groupId: number }> {
  protected tableName = 'test_items'

  protected mapRow(row: Record<string, unknown>): {
    id: number
    groupId: number
  } {
    return { id: row['id'] as number, groupId: row['group_id'] as number }
  }

  testWithTransaction<T>(fn: () => T): T {
    return this.withTransaction(fn)
  }

  testGetMaxDisplayOrder(
    tableName: string,
    whereClause?: string,
    params?: unknown[]
  ): number {
    return this.getMaxDisplayOrder(tableName, whereClause, params)
  }
}

describe('BaseRepository', () => {
  let repo: TestRepository

  beforeEach(async () => {
    testDb = await createTestDatabase()
    // Create a simple test table without FK constraints for isolated testing
    testDb.run(`
      CREATE TABLE test_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_id INTEGER NOT NULL,
        display_order INTEGER NOT NULL
      )
    `)
    repo = new TestRepository()
  })

  describe('withTransaction', () => {
    it('commits changes when function succeeds', () => {
      repo.testWithTransaction(() => {
        testDb.run(
          'INSERT INTO test_items (group_id, display_order) VALUES (?, ?)',
          [1, 0]
        )
      })

      const result = testDb.exec('SELECT COUNT(*) as cnt FROM test_items')
      const count = result[0]?.values[0]?.[0] as number
      expect(count).toBe(1)
    })

    it('rolls back changes when function throws', () => {
      const run = (): void =>
        repo.testWithTransaction(() => {
          testDb.run(
            'INSERT INTO test_items (group_id, display_order) VALUES (?, ?)',
            [1, 0]
          )
          throw new Error('deliberate error')
        })

      expect(run).toThrow('deliberate error')

      const result = testDb.exec('SELECT COUNT(*) as cnt FROM test_items')
      const count = result[0]?.values[0]?.[0] as number
      expect(count).toBe(0)
    })

    it('returns the value from the inner function', () => {
      const result = repo.testWithTransaction(() => 42)
      expect(result).toBe(42)
    })
  })

  describe('getMaxDisplayOrder', () => {
    it('returns -1 when table is empty', () => {
      expect(repo.testGetMaxDisplayOrder('test_items')).toBe(-1)
    })

    it('returns current max when rows exist', () => {
      testDb.run(
        'INSERT INTO test_items (group_id, display_order) VALUES (?, ?)',
        [1, 0]
      )
      testDb.run(
        'INSERT INTO test_items (group_id, display_order) VALUES (?, ?)',
        [1, 5]
      )

      expect(repo.testGetMaxDisplayOrder('test_items')).toBe(5)
    })

    it('filters by WHERE clause and params', () => {
      testDb.run(
        'INSERT INTO test_items (group_id, display_order) VALUES (?, ?)',
        [1, 3]
      )
      testDb.run(
        'INSERT INTO test_items (group_id, display_order) VALUES (?, ?)',
        [2, 7]
      )

      const max1 = repo.testGetMaxDisplayOrder(
        'test_items',
        'WHERE group_id = ?',
        [1]
      )
      const max2 = repo.testGetMaxDisplayOrder(
        'test_items',
        'WHERE group_id = ?',
        [2]
      )

      expect(max1).toBe(3)
      expect(max2).toBe(7)
    })
  })
})
