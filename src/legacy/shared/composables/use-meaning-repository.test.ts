/**
 * Tests for useMeaningRepository composable
 */

import { createTestDatabase } from '@test/helpers/database'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { Database } from 'sql.js'

// We need to mock the useDatabase composable
let testDb: Database

// Mock useDatabase
vi.mock('@/legacy/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params)
  })
}))

// Import after mocking
import { useMeaningRepository } from './use-meaning-repository'

describe('useMeaningRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('meaning methods', () => {
    describe('getMeaningsByKanjiId', () => {
      it('returns empty array when no meanings exist', () => {
        const { getMeaningsByKanjiId } = useMeaningRepository()
        const result = getMeaningsByKanjiId(999)
        expect(result).toEqual([])
      })

      it('returns meanings ordered by display_order', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        // Insert meanings
        testDb.run(
          'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
          [kanjiId, 'bright', 'light quality', 0]
        )
        testDb.run(
          'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
          [kanjiId, 'light', null, 1]
        )

        const { getMeaningsByKanjiId } = useMeaningRepository()
        const result = getMeaningsByKanjiId(kanjiId)

        expect(result).toHaveLength(2)
        expect(result[0]?.meaningText).toBe('bright')
        expect(result[1]?.meaningText).toBe('light')
      })
    })

    describe('createMeaning', () => {
      it('creates a new meaning', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createMeaning, getMeaningsByKanjiId } = useMeaningRepository()
        const meaning = createMeaning({
          kanjiId,
          meaningText: 'bright',
          additionalInfo: 'light quality'
        })

        expect(meaning.meaningText).toBe('bright')
        expect(meaning.additionalInfo).toBe('light quality')
        expect(meaning.kanjiId).toBe(kanjiId)

        const all = getMeaningsByKanjiId(kanjiId)
        expect(all).toHaveLength(1)
      })

      it('auto-increments display_order', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createMeaning } = useMeaningRepository()
        const first = createMeaning({
          kanjiId,
          meaningText: 'bright'
        })
        const second = createMeaning({
          kanjiId,
          meaningText: 'light'
        })

        expect(first.displayOrder).toBe(0)
        expect(second.displayOrder).toBe(1)
      })
    })

    describe('updateMeaning', () => {
      it('updates meaning fields', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createMeaning, getMeaningById, updateMeaning } =
          useMeaningRepository()
        const meaning = createMeaning({
          kanjiId,
          meaningText: 'bright',
          additionalInfo: 'light quality'
        })

        updateMeaning(meaning.id, {
          meaningText: 'shining',
          additionalInfo: 'very bright'
        })

        const updated = getMeaningById(meaning.id)
        expect(updated?.meaningText).toBe('shining')
        expect(updated?.additionalInfo).toBe('very bright')
      })
    })

    describe('removeMeaning', () => {
      it('deletes a meaning', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createMeaning, getMeaningById, removeMeaning } =
          useMeaningRepository()
        const meaning = createMeaning({
          kanjiId,
          meaningText: 'bright'
        })

        removeMeaning(meaning.id)

        const deleted = getMeaningById(meaning.id)
        expect(deleted).toBeNull()
      })
    })

    describe('reorderMeanings', () => {
      it('reorders meanings', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createMeaning, getMeaningsByKanjiId, reorderMeanings } =
          useMeaningRepository()
        const first = createMeaning({
          kanjiId,
          meaningText: 'bright'
        })
        const second = createMeaning({
          kanjiId,
          meaningText: 'light'
        })

        // Reverse order
        reorderMeanings(kanjiId, [second.id, first.id])

        const meanings = getMeaningsByKanjiId(kanjiId)
        expect(meanings[0]?.meaningText).toBe('light')
        expect(meanings[1]?.meaningText).toBe('bright')
      })
    })
  })

  describe('reading group methods', () => {
    describe('getReadingGroupsByKanjiId', () => {
      it('returns empty array when no groups exist', () => {
        const { getReadingGroupsByKanjiId } = useMeaningRepository()
        const result = getReadingGroupsByKanjiId(999)
        expect(result).toEqual([])
      })

      it('returns reading groups ordered by display_order', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        // Insert reading groups
        testDb.run(
          'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
          [kanjiId, 'メイ', 0]
        )
        testDb.run(
          'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
          [kanjiId, 'ミョウ', 1]
        )

        const { getReadingGroupsByKanjiId } = useMeaningRepository()
        const result = getReadingGroupsByKanjiId(kanjiId)

        expect(result).toHaveLength(2)
        expect(result[0]?.readingText).toBe('メイ')
        expect(result[1]?.readingText).toBe('ミョウ')
      })
    })

    describe('createReadingGroup', () => {
      it('creates a new reading group', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createReadingGroup, getReadingGroupsByKanjiId } =
          useMeaningRepository()
        const group = createReadingGroup({
          kanjiId,
          readingText: 'メイ'
        })

        expect(group.readingText).toBe('メイ')
        expect(group.kanjiId).toBe(kanjiId)

        const all = getReadingGroupsByKanjiId(kanjiId)
        expect(all).toHaveLength(1)
      })
    })

    describe('removeReadingGroup', () => {
      it('deletes a reading group', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createReadingGroup, getReadingGroupById, removeReadingGroup } =
          useMeaningRepository()
        const group = createReadingGroup({
          kanjiId,
          readingText: 'メイ'
        })

        removeReadingGroup(group.id)

        const deleted = getReadingGroupById(group.id)
        expect(deleted).toBeNull()
      })
    })

    describe('removeAllReadingGroups', () => {
      it('deletes all reading groups for a kanji', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const {
          createReadingGroup,
          getReadingGroupsByKanjiId,
          removeAllReadingGroups
        } = useMeaningRepository()
        createReadingGroup({ kanjiId, readingText: 'メイ' })
        createReadingGroup({ kanjiId, readingText: 'ミョウ' })

        removeAllReadingGroups(kanjiId)

        const remaining = getReadingGroupsByKanjiId(kanjiId)
        expect(remaining).toHaveLength(0)
      })
    })
  })

  describe('group member methods', () => {
    describe('addMeaningToGroup', () => {
      it('adds a meaning to a reading group', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const {
          addMeaningToGroup,
          createMeaning,
          createReadingGroup,
          getGroupMembersByGroupId
        } = useMeaningRepository()

        const meaning = createMeaning({ kanjiId, meaningText: 'bright' })
        const group = createReadingGroup({ kanjiId, readingText: 'メイ' })

        const member = addMeaningToGroup({
          readingGroupId: group.id,
          meaningId: meaning.id
        })

        expect(member.readingGroupId).toBe(group.id)
        expect(member.meaningId).toBe(meaning.id)

        const members = getGroupMembersByGroupId(group.id)
        expect(members).toHaveLength(1)
      })
    })

    describe('removeMeaningFromGroup', () => {
      it('removes a meaning from a reading group', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const {
          addMeaningToGroup,
          createMeaning,
          createReadingGroup,
          getGroupMembersByGroupId,
          removeMeaningFromGroup
        } = useMeaningRepository()

        const meaning = createMeaning({ kanjiId, meaningText: 'bright' })
        const group = createReadingGroup({ kanjiId, readingText: 'メイ' })
        addMeaningToGroup({ readingGroupId: group.id, meaningId: meaning.id })

        removeMeaningFromGroup(group.id, meaning.id)

        const members = getGroupMembersByGroupId(group.id)
        expect(members).toHaveLength(0)
      })
    })
  })

  describe('utility methods', () => {
    describe('isGroupingEnabled', () => {
      it('returns false when no groups exist', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { isGroupingEnabled } = useMeaningRepository()
        expect(isGroupingEnabled(kanjiId)).toBe(false)
      })

      it('returns true when groups exist', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const { createReadingGroup, isGroupingEnabled } = useMeaningRepository()
        createReadingGroup({ kanjiId, readingText: 'メイ' })

        expect(isGroupingEnabled(kanjiId)).toBe(true)
      })
    })

    describe('getUnassignedMeanings', () => {
      it('returns meanings not in any group', () => {
        // Insert test kanji
        testDb.run(
          'INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)',
          ['明', 8]
        )
        const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
          ?.values[0]?.[0] as number

        const {
          addMeaningToGroup,
          createMeaning,
          createReadingGroup,
          getUnassignedMeanings
        } = useMeaningRepository()

        const meaning1 = createMeaning({ kanjiId, meaningText: 'bright' })
        createMeaning({ kanjiId, meaningText: 'light' })
        const group = createReadingGroup({ kanjiId, readingText: 'メイ' })
        addMeaningToGroup({ readingGroupId: group.id, meaningId: meaning1.id })

        const unassigned = getUnassignedMeanings(kanjiId)
        expect(unassigned).toHaveLength(1)
        expect(unassigned[0]?.meaningText).toBe('light')
      })
    })
  })
})
