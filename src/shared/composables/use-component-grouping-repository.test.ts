/**
 * Component Grouping Repository Tests
 *
 * Tests CRUD operations, reordering, and member management
 * for component groupings (pattern analysis groups).
 */

import { createTestDatabase } from '@test/helpers/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// We need to mock the useDatabase composable
let testDb: Database

// Mock useDatabase
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { useComponentGroupingRepository } from './use-component-grouping-repository'

describe('useComponentGroupingRepository', () => {
  let componentId: number
  let occurrenceId1: number
  let occurrenceId2: number

  beforeEach(async () => {
    testDb = await createTestDatabase()

    // Create a component
    testDb.run(
      `INSERT INTO components (character, stroke_count, short_meaning)
       VALUES ('水', 4, 'water')`
    )
    const compResult = testDb.exec('SELECT last_insert_rowid() as id')
    componentId = compResult[0]?.values[0]?.[0] as number

    // Create kanji for occurrences
    testDb.run(
      `INSERT INTO kanjis (character, stroke_count, short_meaning)
       VALUES ('海', 9, 'sea')`
    )
    const kanjiResult1 = testDb.exec('SELECT last_insert_rowid() as id')
    const kanjiId1 = kanjiResult1[0]?.values[0]?.[0] as number

    testDb.run(
      `INSERT INTO kanjis (character, stroke_count, short_meaning)
       VALUES ('泳', 8, 'swim')`
    )
    const kanjiResult2 = testDb.exec('SELECT last_insert_rowid() as id')
    const kanjiId2 = kanjiResult2[0]?.values[0]?.[0] as number

    // Create occurrences
    testDb.run(
      `INSERT INTO component_occurrences (component_id, kanji_id)
       VALUES (?, ?)`,
      [componentId, kanjiId1]
    )
    const occResult1 = testDb.exec('SELECT last_insert_rowid() as id')
    occurrenceId1 = occResult1[0]?.values[0]?.[0] as number

    testDb.run(
      `INSERT INTO component_occurrences (component_id, kanji_id)
       VALUES (?, ?)`,
      [componentId, kanjiId2]
    )
    const occResult2 = testDb.exec('SELECT last_insert_rowid() as id')
    occurrenceId2 = occResult2[0]?.values[0]?.[0] as number
  })

  describe('getByComponentId', () => {
    it('returns empty array when no groupings exist', () => {
      const { getByComponentId } = useComponentGroupingRepository()
      const groupings = getByComponentId(componentId)

      expect(groupings).toEqual([])
    })

    it('returns groupings ordered by display_order', () => {
      const { create, getByComponentId } = useComponentGroupingRepository()

      create({
        componentId,
        name: 'Second',
        description: null,
        displayOrder: 1
      })
      create({
        componentId,
        name: 'First',
        description: null,
        displayOrder: 0
      })
      create({
        componentId,
        name: 'Third',
        description: null,
        displayOrder: 2
      })

      const groupings = getByComponentId(componentId)

      expect(groupings.length).toBe(3)
      expect(groupings[0]?.name).toBe('First')
      expect(groupings[1]?.name).toBe('Second')
      expect(groupings[2]?.name).toBe('Third')
    })

    it('returns occurrence count for each grouping', () => {
      const { addMember, create, getByComponentId } =
        useComponentGroupingRepository()

      const grouping1 = create({
        componentId,
        name: 'Group 1',
        description: null
      })

      const grouping2 = create({
        componentId,
        name: 'Group 2',
        description: null
      })

      // Add members to first group
      addMember(grouping1.id, occurrenceId1)
      addMember(grouping1.id, occurrenceId2)

      // Add member to second group
      addMember(grouping2.id, occurrenceId1)

      const groupings = getByComponentId(componentId)

      expect(groupings[0]?.occurrenceCount).toBe(2)
      expect(groupings[1]?.occurrenceCount).toBe(1)
    })
  })

  describe('getById', () => {
    it('returns grouping by id', () => {
      const { create, getById } = useComponentGroupingRepository()

      const created = create({
        componentId,
        name: 'Water-related',
        description: 'Semantic group'
      })

      const retrieved = getById(created.id)

      expect(retrieved).toEqual(created)
    })

    it('returns null when grouping not found', () => {
      const { getById } = useComponentGroupingRepository()
      const result = getById(999999)

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('creates grouping with all fields', () => {
      const { create } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test Group',
        description: 'Test description',
        displayOrder: 5
      })

      expect(grouping.id).toBeGreaterThan(0)
      expect(grouping.componentId).toBe(componentId)
      expect(grouping.name).toBe('Test Group')
      expect(grouping.description).toBe('Test description')
      expect(grouping.displayOrder).toBe(5)
      expect(grouping.createdAt).toBeTruthy()
      expect(grouping.updatedAt).toBeTruthy()
    })

    it('creates grouping with null description', () => {
      const { create } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test Group',
        description: null
      })

      expect(grouping.description).toBeNull()
    })

    it('auto-assigns display order when not provided', () => {
      const { create, getByComponentId } = useComponentGroupingRepository()

      create({ componentId, name: 'First', description: null })
      create({ componentId, name: 'Second', description: null })
      create({ componentId, name: 'Third', description: null })

      const groupings = getByComponentId(componentId)

      expect(groupings[0]?.displayOrder).toBe(0)
      expect(groupings[1]?.displayOrder).toBe(1)
      expect(groupings[2]?.displayOrder).toBe(2)
    })
  })

  describe('update', () => {
    it('updates name and description', () => {
      const { create, getById, update } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Old Name',
        description: 'Old Description'
      })

      update(grouping.id, {
        name: 'New Name',
        description: 'New Description'
      })

      const updated = getById(grouping.id)
      expect(updated?.name).toBe('New Name')
      expect(updated?.description).toBe('New Description')
    })

    it('updates only name when description not provided', () => {
      const { create, getById, update } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Old Name',
        description: 'Original Description'
      })

      update(grouping.id, {
        name: 'New Name'
      })

      const updated = getById(grouping.id)
      expect(updated?.name).toBe('New Name')
      expect(updated?.description).toBe('Original Description')
    })

    it('can set description to null', () => {
      const { create, getById, update } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: 'Has description'
      })

      update(grouping.id, {
        description: null
      })

      const updated = getById(grouping.id)
      expect(updated?.description).toBeNull()
    })
  })

  describe('remove', () => {
    it('deletes grouping', () => {
      const { create, getById, remove } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      remove(grouping.id)

      const retrieved = getById(grouping.id)
      expect(retrieved).toBeNull()
    })

    it('cascades to delete members', () => {
      const { addMember, create, getMembers, remove } =
        useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      addMember(grouping.id, occurrenceId1)
      addMember(grouping.id, occurrenceId2)

      expect(getMembers(grouping.id).length).toBe(2)

      remove(grouping.id)

      // Members should be deleted
      const members = getMembers(grouping.id)
      expect(members).toEqual([])
    })
  })

  describe('reorder', () => {
    it('reorders groupings by id array', () => {
      const { create, getByComponentId, reorder } =
        useComponentGroupingRepository()

      const g1 = create({ componentId, name: 'First', description: null })
      const g2 = create({ componentId, name: 'Second', description: null })
      const g3 = create({ componentId, name: 'Third', description: null })

      // Reverse order
      reorder([g3.id, g2.id, g1.id])

      const groupings = getByComponentId(componentId)

      expect(groupings[0]?.name).toBe('Third')
      expect(groupings[1]?.name).toBe('Second')
      expect(groupings[2]?.name).toBe('First')
    })
  })

  describe('getNextDisplayOrder', () => {
    it('returns 0 when no groupings exist', () => {
      const { getNextDisplayOrder } = useComponentGroupingRepository()
      const order = getNextDisplayOrder(componentId)

      expect(order).toBe(0)
    })

    it('returns max + 1 when groupings exist', () => {
      const { create, getNextDisplayOrder } = useComponentGroupingRepository()

      create({ componentId, name: 'First', description: null, displayOrder: 0 })
      create({
        componentId,
        name: 'Second',
        description: null,
        displayOrder: 1
      })

      const order = getNextDisplayOrder(componentId)

      expect(order).toBe(2)
    })
  })

  describe('getMembers', () => {
    it('returns empty array when no members', () => {
      const { create, getMembers } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      const members = getMembers(grouping.id)

      expect(members).toEqual([])
    })

    it('returns members ordered by display_order', () => {
      const { addMember, create, getMembers } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      addMember(grouping.id, occurrenceId1)
      addMember(grouping.id, occurrenceId2)

      const members = getMembers(grouping.id)

      expect(members.length).toBe(2)
      expect(members[0]?.occurrenceId).toBe(occurrenceId1)
      expect(members[1]?.occurrenceId).toBe(occurrenceId2)
    })
  })

  describe('addMember', () => {
    it('adds occurrence to grouping', () => {
      const { addMember, create, getMembers } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      addMember(grouping.id, occurrenceId1)

      const members = getMembers(grouping.id)

      expect(members.length).toBe(1)
      expect(members[0]?.groupingId).toBe(grouping.id)
      expect(members[0]?.occurrenceId).toBe(occurrenceId1)
    })

    it('assigns display order automatically', () => {
      const { addMember, create, getMembers } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      addMember(grouping.id, occurrenceId1)
      addMember(grouping.id, occurrenceId2)

      const members = getMembers(grouping.id)

      expect(members[0]?.displayOrder).toBe(0)
      expect(members[1]?.displayOrder).toBe(1)
    })

    it('ignores duplicate additions (INSERT OR IGNORE)', () => {
      const { addMember, create, getMembers } = useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      addMember(grouping.id, occurrenceId1)
      addMember(grouping.id, occurrenceId1) // Duplicate

      const members = getMembers(grouping.id)

      expect(members.length).toBe(1)
    })
  })

  describe('removeMember', () => {
    it('removes occurrence from grouping', () => {
      const { addMember, create, getMembers, removeMember } =
        useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      addMember(grouping.id, occurrenceId1)
      addMember(grouping.id, occurrenceId2)

      removeMember(grouping.id, occurrenceId1)

      const members = getMembers(grouping.id)

      expect(members.length).toBe(1)
      expect(members[0]?.occurrenceId).toBe(occurrenceId2)
    })
  })

  describe('reorderMembers', () => {
    it('reorders members within a grouping', () => {
      const { addMember, create, getMembers, reorderMembers } =
        useComponentGroupingRepository()

      const grouping = create({
        componentId,
        name: 'Test',
        description: null
      })

      addMember(grouping.id, occurrenceId1)
      addMember(grouping.id, occurrenceId2)

      // Reverse order
      reorderMembers(grouping.id, [occurrenceId2, occurrenceId1])

      const members = getMembers(grouping.id)

      expect(members[0]?.occurrenceId).toBe(occurrenceId2)
      expect(members[1]?.occurrenceId).toBe(occurrenceId1)
    })
  })

  describe('integration: many-to-many relationship', () => {
    it('allows same occurrence in multiple groupings', () => {
      const { addMember, create, getMembers } = useComponentGroupingRepository()

      const group1 = create({
        componentId,
        name: 'Group 1',
        description: null
      })
      const group2 = create({
        componentId,
        name: 'Group 2',
        description: null
      })

      // Add same occurrence to both groups
      addMember(group1.id, occurrenceId1)
      addMember(group2.id, occurrenceId1)

      const members1 = getMembers(group1.id)
      const members2 = getMembers(group2.id)

      expect(members1.length).toBe(1)
      expect(members2.length).toBe(1)
      expect(members1[0]?.occurrenceId).toBe(occurrenceId1)
      expect(members2[0]?.occurrenceId).toBe(occurrenceId1)
    })

    it('removing from one group does not affect other groups', () => {
      const { addMember, create, getMembers, removeMember } =
        useComponentGroupingRepository()

      const group1 = create({
        componentId,
        name: 'Group 1',
        description: null
      })
      const group2 = create({
        componentId,
        name: 'Group 2',
        description: null
      })

      addMember(group1.id, occurrenceId1)
      addMember(group2.id, occurrenceId1)

      // Remove from group 1
      removeMember(group1.id, occurrenceId1)

      const members1 = getMembers(group1.id)
      const members2 = getMembers(group2.id)

      expect(members1.length).toBe(0)
      expect(members2.length).toBe(1)
      expect(members2[0]?.occurrenceId).toBe(occurrenceId1)
    })
  })
})
