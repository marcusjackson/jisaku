/**
 * Tests for useComponentRepository composable
 */

import {
  createTestDatabase,
  seedComponent,
  seedKanji
} from '@test/helpers/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// We need to mock the useDatabase composable
// since useComponentRepository depends on it
let testDb: Database

// Mock useDatabase
vi.mock('@/legacy/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { useComponentRepository } from './use-component-repository'

describe('useComponentRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getAll', () => {
    it('returns empty array when no components exist', () => {
      const { getAll } = useComponentRepository()
      const result = getAll()
      expect(result).toEqual([])
    })

    it('returns all components ordered by id desc (most recent first)', () => {
      seedComponent(testDb, { character: '亻', strokeCount: 2 })
      seedComponent(testDb, { character: '氵', strokeCount: 3 })
      seedComponent(testDb, { character: '火', strokeCount: 4 })

      const { getAll } = useComponentRepository()
      const result = getAll()

      expect(result).toHaveLength(3)
      // Most recent first (highest id)
      expect(result[0]?.character).toBe('火')
      expect(result[1]?.character).toBe('氵')
      expect(result[2]?.character).toBe('亻')
    })

    it('maps database columns to camelCase properties', () => {
      seedComponent(testDb, {
        character: '亻',
        description: 'Person radical',
        searchKeywords: 'にんべん',
        strokeCount: 2
      })

      const { getAll } = useComponentRepository()
      const result = getAll()

      expect(result[0]).toMatchObject({
        character: '亻',
        description: 'Person radical',
        searchKeywords: 'にんべん',
        strokeCount: 2
      })
      expect(result[0]).toHaveProperty('id')
      expect(result[0]).toHaveProperty('createdAt')
      expect(result[0]).toHaveProperty('updatedAt')
    })
  })

  describe('getById', () => {
    it('returns null when component does not exist', () => {
      const { getById } = useComponentRepository()
      const result = getById(999)
      expect(result).toBeNull()
    })

    it('returns component by id', () => {
      const seeded = seedComponent(testDb, { character: '亻', strokeCount: 2 })

      const { getById } = useComponentRepository()
      const result = getById(seeded.id)

      expect(result).not.toBeNull()
      expect(result?.character).toBe('亻')
    })
  })

  describe('getByCharacter', () => {
    it('returns null when component does not exist', () => {
      const { getByCharacter } = useComponentRepository()
      const result = getByCharacter('亻')
      expect(result).toBeNull()
    })

    it('returns component by character', () => {
      seedComponent(testDb, { character: '亻', strokeCount: 2 })

      const { getByCharacter } = useComponentRepository()
      const result = getByCharacter('亻')

      expect(result).not.toBeNull()
      expect(result?.character).toBe('亻')
    })
  })

  describe('create', () => {
    it('creates a component with required fields', () => {
      const { create, getById } = useComponentRepository()

      const created = create({
        character: '氵',
        strokeCount: 3
      })

      expect(created.character).toBe('氵')
      expect(created.strokeCount).toBe(3)
      expect(created.id).toBeDefined()

      // Verify it's in the database
      const fetched = getById(created.id)
      expect(fetched?.character).toBe('氵')
    })

    it('creates a component with all fields', () => {
      const { create } = useComponentRepository()

      const created = create({
        character: '亻',
        description: 'Person radical',
        searchKeywords: 'にんべん',
        strokeCount: 2
      })

      expect(created).toMatchObject({
        character: '亻',
        description: 'Person radical',
        searchKeywords: 'にんべん',
        strokeCount: 2
      })
    })

    it('creates a component with sourceKanjiId', () => {
      // First create a kanji to reference
      const kanji = seedKanji(testDb, { character: '人', strokeCount: 2 })

      const { create } = useComponentRepository()
      const created = create({
        character: '亻',
        sourceKanjiId: kanji.id,
        strokeCount: 2
      })

      expect(created.sourceKanjiId).toBe(kanji.id)
    })
  })

  describe('update', () => {
    it('updates component fields', () => {
      const seeded = seedComponent(testDb, { character: '亻', strokeCount: 2 })

      const { update } = useComponentRepository()
      const updated = update(seeded.id, {
        description: 'Updated description',
        strokeCount: 3
      })

      expect(updated.description).toBe('Updated description')
      expect(updated.strokeCount).toBe(3)
      expect(updated.character).toBe('亻') // Unchanged
    })

    it('returns existing component when no fields to update', () => {
      const seeded = seedComponent(testDb, {
        character: '亻',
        description: 'Original',
        strokeCount: 2
      })

      const { update } = useComponentRepository()
      const updated = update(seeded.id, {})

      expect(updated.description).toBe('Original')
    })

    it('throws error for non-existent component', () => {
      const { update } = useComponentRepository()

      expect(() => update(999, { strokeCount: 5 })).toThrow(
        'Component with id 999 not found'
      )
    })
  })

  describe('remove', () => {
    it('removes a component', () => {
      const seeded = seedComponent(testDb, { character: '亻', strokeCount: 2 })

      const { getById, remove } = useComponentRepository()
      remove(seeded.id)

      const result = getById(seeded.id)
      expect(result).toBeNull()
    })

    it('removes junction table entries when component is deleted', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Link kanji to component via component_occurrences
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanji.id, component.id, 1]
      )

      const { getLinkedKanjiCount, remove } = useComponentRepository()

      // Verify link exists
      expect(getLinkedKanjiCount(component.id)).toBe(1)

      // Delete component
      remove(component.id)

      // Junction entry should be removed (component no longer exists)
      const result = testDb.exec(
        'SELECT * FROM component_occurrences WHERE component_id = ?',
        [component.id]
      )
      expect(result[0]?.values.length ?? 0).toBe(0)
    })
  })

  describe('getLinkedKanjiCount', () => {
    it('returns 0 when no kanji are linked', () => {
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      const { getLinkedKanjiCount } = useComponentRepository()
      const count = getLinkedKanjiCount(component.id)

      expect(count).toBe(0)
    })

    it('returns count of linked kanji', () => {
      const kanji1 = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const kanji2 = seedKanji(testDb, { character: '体', strokeCount: 7 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Link both kanji to component via component_occurrences
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanji1.id, component.id, 1]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanji2.id, component.id, 1]
      )

      const { getLinkedKanjiCount } = useComponentRepository()
      const count = getLinkedKanjiCount(component.id)

      expect(count).toBe(2)
    })
  })

  describe('getLinkedKanjiIds', () => {
    it('returns empty array when no kanji are linked', () => {
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      const { getLinkedKanjiIds } = useComponentRepository()
      const ids = getLinkedKanjiIds(component.id)

      expect(ids).toEqual([])
    })

    it('returns ids of linked kanji ordered by position', () => {
      const kanji1 = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const kanji2 = seedKanji(testDb, { character: '体', strokeCount: 7 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Link kanji with positions via component_occurrences
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanji2.id, component.id, 2]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanji1.id, component.id, 1]
      )

      const { getLinkedKanjiIds } = useComponentRepository()
      const ids = getLinkedKanjiIds(component.id)

      // Should be ordered by display_order
      expect(ids).toEqual([kanji1.id, kanji2.id])
    })
  })
})
