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

    it('returns occurrenceCount of 0 when no members', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'Empty group', 0]
      )

      const repo = useComponentGroupingRepository()
      const groupings = repo.getByParentId(componentId)

      expect(groupings[0]?.occurrenceCount).toBe(0)
    })

    it('returns correct occurrenceCount after adding members', () => {
      // Create grouping
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'Test group', 0]
      )
      const groupingId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      // Create kanji and occurrence
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, componentId, 0]
      )
      const occurrenceId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      // Add member
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id, display_order) VALUES (?, ?, ?)',
        [groupingId, occurrenceId, 0]
      )

      const repo = useComponentGroupingRepository()
      const groupings = repo.getByParentId(componentId)

      expect(groupings[0]?.occurrenceCount).toBe(1)
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

    it('removes associated members when grouping is deleted', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'Test group', 0]
      )
      const groupingId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, componentId, 0]
      )
      const occurrenceId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id, display_order) VALUES (?, ?, ?)',
        [groupingId, occurrenceId, 0]
      )

      const repo = useComponentGroupingRepository()
      repo.remove(groupingId)

      const members = testDb.exec(
        'SELECT * FROM component_grouping_members WHERE grouping_id = ?',
        [groupingId]
      )
      expect(members[0]?.values ?? []).toHaveLength(0)
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

    it('removes associated members when groupings are deleted by component', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name, display_order) VALUES (?, ?, ?)',
        [componentId, 'Group 1', 0]
      )
      const groupingId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, componentId, 0]
      )
      const occurrenceId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id, display_order) VALUES (?, ?, ?)',
        [groupingId, occurrenceId, 0]
      )

      const repo = useComponentGroupingRepository()
      repo.removeByComponentId(componentId)

      const members = testDb.exec(
        'SELECT * FROM component_grouping_members WHERE grouping_id = ?',
        [groupingId]
      )
      expect(members[0]?.values ?? []).toHaveLength(0)
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

  // ============================================================================
  // Member Operations
  // ============================================================================

  describe('getMembers', () => {
    it('returns empty array when no members exist', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Test group']
      )

      const repo = useComponentGroupingRepository()
      expect(repo.getMembers(1)).toEqual([])
    })

    it('returns members ordered by display_order', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Test group']
      )
      const groupingId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      // Create two kanji and occurrences
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      const kanjiId1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId1, componentId, 0]
      )
      const occ1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      const kanjiId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId2, componentId, 1]
      )
      const occ2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      // Add members in specific order
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id, display_order) VALUES (?, ?, ?)',
        [groupingId, occ2, 0]
      )
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id, display_order) VALUES (?, ?, ?)',
        [groupingId, occ1, 1]
      )

      const repo = useComponentGroupingRepository()
      const members = repo.getMembers(groupingId)

      expect(members).toHaveLength(2)
      expect(members[0]?.occurrenceId).toBe(occ2)
      expect(members[1]?.occurrenceId).toBe(occ1)
      expect(members[0]?.displayOrder).toBe(0)
      expect(members[1]?.displayOrder).toBe(1)
    })
  })

  describe('addMember', () => {
    let groupingId: number
    let occurrenceId: number

    beforeEach(() => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Test group']
      )
      groupingId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, componentId, 0]
      )
      occurrenceId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
    })

    it('adds member with sequential display_order', () => {
      const repo = useComponentGroupingRepository()
      repo.addMember(groupingId, occurrenceId)

      const members = repo.getMembers(groupingId)
      expect(members).toHaveLength(1)
      expect(members[0]?.occurrenceId).toBe(occurrenceId)
      expect(members[0]?.displayOrder).toBe(0)
    })

    it('assigns next display_order for subsequent members', () => {
      // Add another occurrence
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      const kanjiId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId2, componentId, 1]
      )
      const occurrenceId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      const repo = useComponentGroupingRepository()
      repo.addMember(groupingId, occurrenceId)
      repo.addMember(groupingId, occurrenceId2)

      const members = repo.getMembers(groupingId)
      expect(members).toHaveLength(2)
      expect(members[1]?.displayOrder).toBe(1)
    })

    it('is idempotent when adding duplicate member', () => {
      const repo = useComponentGroupingRepository()
      repo.addMember(groupingId, occurrenceId)
      repo.addMember(groupingId, occurrenceId)

      const members = repo.getMembers(groupingId)
      expect(members).toHaveLength(1)
    })

    it('returns true when member is newly inserted', () => {
      const repo = useComponentGroupingRepository()
      expect(repo.addMember(groupingId, occurrenceId)).toBe(true)
    })

    it('returns false when member already exists', () => {
      const repo = useComponentGroupingRepository()
      repo.addMember(groupingId, occurrenceId)
      expect(repo.addMember(groupingId, occurrenceId)).toBe(false)
    })
  })

  describe('removeMember', () => {
    it('removes only the targeted member', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Test group']
      )
      const groupingId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      // Create two occurrences
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      const kanjiId1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId1, componentId, 0]
      )
      const occ1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      const kanjiId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId2, componentId, 1]
      )
      const occ2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      const repo = useComponentGroupingRepository()
      repo.addMember(groupingId, occ1)
      repo.addMember(groupingId, occ2)

      repo.removeMember(groupingId, occ1)

      const members = repo.getMembers(groupingId)
      expect(members).toHaveLength(1)
      expect(members[0]?.occurrenceId).toBe(occ2)
    })
  })

  describe('reorderMembers', () => {
    it('updates display_order for each member by array position', () => {
      testDb.run(
        'INSERT INTO component_groupings (component_id, name) VALUES (?, ?)',
        [componentId, 'Test group']
      )
      const groupingId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      // Create two occurrences
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水'])
      const kanjiId1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId1, componentId, 0]
      )
      const occ1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      const kanjiId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId2, componentId, 1]
      )
      const occ2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      const repo = useComponentGroupingRepository()
      repo.addMember(groupingId, occ1)
      repo.addMember(groupingId, occ2)

      // Reverse the order
      repo.reorderMembers(groupingId, [occ2, occ1])

      const members = repo.getMembers(groupingId)
      expect(members[0]?.occurrenceId).toBe(occ2)
      expect(members[1]?.occurrenceId).toBe(occ1)
    })
  })

  describe('getMembersByComponentId', () => {
    it('returns empty map when no groupings exist', () => {
      const repo = useComponentGroupingRepository()
      const result = repo.getMembersByComponentId(componentId)
      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(0)
    })

    it('returns empty map when groupings exist but have no members', () => {
      const repo = useComponentGroupingRepository()
      repo.create({ componentId, name: 'G1', description: null })
      const result = repo.getMembersByComponentId(componentId)
      expect(result.size).toBe(0)
    })

    it('groups members by grouping ID', () => {
      const repo = useComponentGroupingRepository()
      const g1 = repo.create({
        componentId,
        name: 'Group 1',
        description: null
      }).id
      const g2 = repo.create({
        componentId,
        name: 'Group 2',
        description: null
      }).id

      // Create occurrences
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['木'])
      const kId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kId, componentId, 0]
      )
      const occ1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      const kId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kId2, componentId, 1]
      )
      const occ2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      repo.addMember(g1, occ1)
      repo.addMember(g2, occ2)

      const result = repo.getMembersByComponentId(componentId)
      expect(result.size).toBe(2)
      expect(result.get(g1)).toHaveLength(1)
      expect(result.get(g2)).toHaveLength(1)
      expect(result.get(g1)![0]?.occurrenceId).toBe(occ1)
      expect(result.get(g2)![0]?.occurrenceId).toBe(occ2)
    })

    it('returns members sorted by display order', () => {
      const repo = useComponentGroupingRepository()
      const gId = repo.create({ componentId, name: 'G', description: null }).id

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['木'])
      const kId1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kId1, componentId, 0]
      )
      const occ1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火'])
      const kId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kId2, componentId, 1]
      )
      const occ2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      repo.addMember(gId, occ1)
      repo.addMember(gId, occ2)
      repo.reorderMembers(gId, [occ2, occ1])

      const result = repo.getMembersByComponentId(componentId)
      const members = result.get(gId)!
      expect(members[0]?.occurrenceId).toBe(occ2)
      expect(members[1]?.occurrenceId).toBe(occ1)
    })
  })
})
