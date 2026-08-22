/**
 * Classification Type Repository Tests
 *
 * Unit tests for classification type (reference data) repository.
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
import { useClassificationTypeRepository } from './classification-type-repository'

describe('useClassificationTypeRepository', function () {
  beforeEach(async () => {
    testDb = await createTestDatabase()
    // Test database is prepopulated with classification types
  })

  describe('getAll', () => {
    it('returns prepopulated classification types', () => {
      const repo = useClassificationTypeRepository()
      const types = repo.getAll()

      expect(types.length).toBeGreaterThan(0)
      expect(types[0]?.typeName).toBe('pictograph')
    })

    it('returns types ordered by display_order', () => {
      const repo = useClassificationTypeRepository()
      const types = repo.getAll()

      // Verify ordering matches prepopulated data
      expect(types[0]?.displayOrder).toBe(1)
      expect(types[1]?.displayOrder).toBe(2)
    })
  })

  describe('getById', () => {
    it('returns null when type does not exist', () => {
      const repo = useClassificationTypeRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns type when it exists', () => {
      const repo = useClassificationTypeRepository()
      const type = repo.getById(1)

      expect(type?.typeName).toBe('pictograph')
      expect(type?.nameJapanese).toBe('象形文字')
    })
  })

  describe('getByTypeName', () => {
    it('returns null when type name not found', () => {
      const repo = useClassificationTypeRepository()
      expect(repo.getByTypeName('nonexistent')).toBeNull()
    })

    it('returns type when name exists', () => {
      const repo = useClassificationTypeRepository()
      const type = repo.getByTypeName('phono_semantic')

      expect(type?.nameJapanese).toBe('形声文字')
    })
  })

  describe('create', () => {
    it('creates a new classification type', () => {
      const repo = useClassificationTypeRepository()
      const type = repo.create({
        typeName: 'custom_type',
        nameJapanese: 'カスタム',
        nameEnglish: 'Custom Type'
      })

      expect(type.typeName).toBe('custom_type')
      expect(type.nameJapanese).toBe('カスタム')
      // Display order auto-increments (after prepopulated types with max order 5)
      expect(type.displayOrder).toBe(6)
    })
  })

  describe('update', () => {
    it('throws when type does not exist', () => {
      const repo = useClassificationTypeRepository()
      const throwFn = () => repo.update(999, { typeName: 'test' })

      expect(throwFn).toThrow('ClassificationType with id 999 not found')
    })

    it('updates type fields', () => {
      const repo = useClassificationTypeRepository()
      const updated = repo.update(1, {
        description: 'Updated description'
      })

      expect(updated.description).toBe('Updated description')
      expect(updated.typeName).toBe('pictograph') // Unchanged
    })
  })

  describe('remove', () => {
    it('removes a classification type', () => {
      // First create one we can safely delete
      const repo = useClassificationTypeRepository()
      const created = repo.create({ typeName: 'to_delete' })

      repo.remove(created.id)

      expect(repo.getById(created.id)).toBeNull()
    })
  })

  describe('reorder', () => {
    it('reorders types by new id sequence', () => {
      const repo = useClassificationTypeRepository()
      // Reorder first two types
      repo.reorder([2, 1])

      const types = repo.getAll()
      const type1 = types.find((t) => t.id === 1)
      const type2 = types.find((t) => t.id === 2)

      expect(type2?.displayOrder).toBe(0)
      expect(type1?.displayOrder).toBe(1)
    })
  })

  describe('getUsageCount', () => {
    it('returns 0 when classification type is not referenced by any kanji', () => {
      const repo = useClassificationTypeRepository()
      // Insert a new classification type with no kanji linked to it
      const newType = repo.create({ typeName: 'unused_type' })

      expect(repo.getUsageCount(newType.id)).toBe(0)
    })

    it('returns positive count when classification type is referenced by kanji', () => {
      // Seed a kanji and link it to classification type id=1
      testDb.run(`INSERT INTO kanjis (character) VALUES ('水')`)
      const kanjiResult = testDb.exec('SELECT last_insert_rowid() as id')
      const kanjiId = kanjiResult[0]?.values[0]?.[0] as number

      testDb.run(
        `INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order) VALUES (?, 1, 0)`,
        [kanjiId]
      )

      const repo = useClassificationTypeRepository()
      expect(repo.getUsageCount(1)).toBe(1)
    })

    it('returns 0 for a classification type id that does not exist', () => {
      const repo = useClassificationTypeRepository()
      expect(repo.getUsageCount(9999)).toBe(0)
    })
  })
})
