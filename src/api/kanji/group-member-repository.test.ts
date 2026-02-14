/**
 * Kanji Meaning Group Member Repository Tests
 *
 * Unit tests for group member repository (junction table).
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
import { useGroupMemberRepository } from './group-member-repository'

describe('useGroupMemberRepository', function () {
  let kanjiId: number
  let groupId1: number
  let groupId2: number
  let meaningId1: number
  let meaningId2: number

  beforeEach(async () => {
    testDb = await createTestDatabase()

    // Create a test kanji
    testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
      '明',
      8
    ])
    kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number

    // Create reading groups
    testDb.run(
      'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
      [kanjiId, 'あか', 0]
    )
    groupId1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number

    testDb.run(
      'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
      [kanjiId, 'めい', 1]
    )
    groupId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number

    // Create meanings
    testDb.run(
      'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
      [kanjiId, 'bright', 0]
    )
    meaningId1 = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number

    testDb.run(
      'INSERT INTO kanji_meanings (kanji_id, meaning_text, display_order) VALUES (?, ?, ?)',
      [kanjiId, 'light', 1]
    )
    meaningId2 = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByGroupId', () => {
    it('returns empty array when no members exist', () => {
      const repo = useGroupMemberRepository()
      expect(repo.getByGroupId(groupId1)).toEqual([])
    })

    it('returns members ordered by display_order', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId2, 1]
      )

      const repo = useGroupMemberRepository()
      const members = repo.getByGroupId(groupId1)

      expect(members).toHaveLength(2)
      expect(members[0]?.meaningId).toBe(meaningId1)
      expect(members[1]?.meaningId).toBe(meaningId2)
    })
  })

  describe('getByKanjiId', () => {
    it('returns empty array when no members exist', () => {
      const repo = useGroupMemberRepository()
      expect(repo.getByKanjiId(kanjiId)).toEqual([])
    })

    it('returns members across all groups for a kanji', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId2, meaningId2, 0]
      )

      const repo = useGroupMemberRepository()
      const members = repo.getByKanjiId(kanjiId)

      expect(members).toHaveLength(2)
      expect(members[0]?.readingGroupId).toBe(groupId1)
      expect(members[1]?.readingGroupId).toBe(groupId2)
    })
  })

  describe('getByGroupAndMeaning', () => {
    it('returns null when member does not exist', () => {
      const repo = useGroupMemberRepository()
      expect(repo.getByGroupAndMeaning(groupId1, meaningId1)).toBeNull()
    })

    it('returns member when it exists', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )

      const repo = useGroupMemberRepository()
      const member = repo.getByGroupAndMeaning(groupId1, meaningId1)

      expect(member).not.toBeNull()
      expect(member?.readingGroupId).toBe(groupId1)
      expect(member?.meaningId).toBe(meaningId1)
    })
  })

  describe('getById', () => {
    it('returns null when member does not exist', () => {
      const repo = useGroupMemberRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns member when it exists', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )

      const repo = useGroupMemberRepository()
      const member = repo.getById(1)

      expect(member).not.toBeNull()
      expect(member?.readingGroupId).toBe(groupId1)
      expect(member?.meaningId).toBe(meaningId1)
    })
  })

  describe('create', () => {
    it('creates a member with default values', () => {
      const repo = useGroupMemberRepository()
      const member = repo.create({
        readingGroupId: groupId1,
        meaningId: meaningId1
      })

      expect(member.id).toBe(1)
      expect(member.readingGroupId).toBe(groupId1)
      expect(member.meaningId).toBe(meaningId1)
      expect(member.displayOrder).toBe(0)
    })

    it('creates a member with custom display order', () => {
      const repo = useGroupMemberRepository()
      const member = repo.create({
        readingGroupId: groupId1,
        meaningId: meaningId1,
        displayOrder: 5
      })

      expect(member.displayOrder).toBe(5)
    })

    it('auto-increments display_order within group', () => {
      const repo = useGroupMemberRepository()
      repo.create({ readingGroupId: groupId1, meaningId: meaningId1 })
      const member2 = repo.create({
        readingGroupId: groupId1,
        meaningId: meaningId2
      })

      expect(member2.displayOrder).toBe(1)
    })

    it('maintains separate display_order per group', () => {
      const repo = useGroupMemberRepository()
      repo.create({ readingGroupId: groupId1, meaningId: meaningId1 })
      const member2 = repo.create({
        readingGroupId: groupId2,
        meaningId: meaningId2
      })

      // Second group starts at 0 (not 1)
      expect(member2.displayOrder).toBe(0)
    })
  })

  describe('remove', () => {
    it('removes a member by id', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )

      const repo = useGroupMemberRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('removeByGroupAndMeaning', () => {
    it('removes a member by group and meaning ids', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )

      const repo = useGroupMemberRepository()
      repo.removeByGroupAndMeaning(groupId1, meaningId1)

      expect(repo.getByGroupAndMeaning(groupId1, meaningId1)).toBeNull()
    })
  })

  describe('removeAllByGroupId', () => {
    it('removes all members for a group', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId2, 1]
      )

      const repo = useGroupMemberRepository()
      repo.removeAllByGroupId(groupId1)

      expect(repo.getByGroupId(groupId1)).toEqual([])
    })

    it('does not affect other groups', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId2, meaningId2, 0]
      )

      const repo = useGroupMemberRepository()
      repo.removeAllByGroupId(groupId1)

      expect(repo.getByGroupId(groupId1)).toEqual([])
      expect(repo.getByGroupId(groupId2)).toHaveLength(1)
    })
  })

  describe('reorder', () => {
    it('reorders members by new id sequence', () => {
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId1, 0]
      )
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId1, meaningId2, 1]
      )

      const repo = useGroupMemberRepository()
      repo.reorder([2, 1]) // Swap order

      const members = repo.getByGroupId(groupId1)
      expect(members[0]?.meaningId).toBe(meaningId2)
      expect(members[1]?.meaningId).toBe(meaningId1)
    })
  })
})
