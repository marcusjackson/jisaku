/**
 * Component Occurrence Repository Tests
 */

import {
  createTestDatabase,
  seedComponent,
  seedKanji
} from '@test/helpers/database'
import { beforeEach, describe, expect, it } from 'vitest'

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
import { useComponentOccurrenceRepository } from './use-component-occurrence-repository'

describe('useComponentOccurrenceRepository', () => {
  beforeEach(async () => {
    testDb = await createTestDatabase()
  })

  describe('getByKanjiId', () => {
    it('returns empty array when no occurrences exist', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const { getByKanjiId } = useComponentOccurrenceRepository()

      const occurrences = getByKanjiId(kanji.id)

      expect(occurrences).toEqual([])
    })

    it('returns occurrences for a kanji ordered by display_order', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component1 = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })
      const component2 = seedComponent(testDb, {
        character: '木',
        strokeCount: 4
      })

      // Create occurrences
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component2.id, 1, 0]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component1.id, 0, 1]
      )

      const { getByKanjiId } = useComponentOccurrenceRepository()
      const occurrences = getByKanjiId(kanji.id)

      expect(occurrences).toHaveLength(2)
      expect(occurrences[0]?.componentId).toBe(component1.id)
      expect(occurrences[0]?.displayOrder).toBe(0)
      expect(occurrences[1]?.componentId).toBe(component2.id)
      expect(occurrences[1]?.displayOrder).toBe(1)
    })
  })

  describe('getByComponentId', () => {
    it('returns empty array when component has no occurrences', () => {
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })
      const { getByComponentId } = useComponentOccurrenceRepository()

      const occurrences = getByComponentId(component.id)

      expect(occurrences).toEqual([])
    })

    it('returns all occurrences of a component across kanji', () => {
      const kanji1 = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const kanji2 = seedKanji(testDb, { character: '体', strokeCount: 7 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Create occurrences in both kanji
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji1.id, component.id, 0, 1]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji2.id, component.id, 0, 0]
      )

      const { getByComponentId } = useComponentOccurrenceRepository()
      const occurrences = getByComponentId(component.id)

      expect(occurrences).toHaveLength(2)
      expect(occurrences[0]?.kanjiId).toBe(kanji1.id)
      expect(occurrences[1]?.kanjiId).toBe(kanji2.id)
    })
  })

  describe('getByKanjiIdWithPosition', () => {
    it('returns occurrences with position data', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Get a position type (prepopulated in migration)
      const positionResult = testDb.exec(
        "SELECT id FROM position_types WHERE position_name = 'hen' LIMIT 1"
      )
      const positionId = positionResult[0]?.values[0]?.[0] as number

      // Create occurrence with position
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, position_type_id, is_radical) VALUES (?, ?, ?, ?, ?)',
        [kanji.id, component.id, 0, positionId, 1]
      )

      const { getByKanjiIdWithPosition } = useComponentOccurrenceRepository()
      const occurrences = getByKanjiIdWithPosition(kanji.id)

      expect(occurrences).toHaveLength(1)
      expect(occurrences[0]?.position).not.toBeNull()
      expect(occurrences[0]?.position?.positionName).toBe('hen')
    })

    it('returns null position when position_type_id is null', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Create occurrence without position
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component.id, 0, 0]
      )

      const { getByKanjiIdWithPosition } = useComponentOccurrenceRepository()
      const occurrences = getByKanjiIdWithPosition(kanji.id)

      expect(occurrences).toHaveLength(1)
      expect(occurrences[0]?.position).toBeNull()
    })
  })

  describe('getByComponentIdWithPosition', () => {
    it('returns occurrences with position data for a component', () => {
      const kanji1 = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const kanji2 = seedKanji(testDb, { character: '体', strokeCount: 7 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Get a position type
      const positionResult = testDb.exec(
        "SELECT id FROM position_types WHERE position_name = 'hen' LIMIT 1"
      )
      const positionId = positionResult[0]?.values[0]?.[0] as number

      // Create occurrences with position
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, position_type_id, is_radical) VALUES (?, ?, ?, ?, ?)',
        [kanji1.id, component.id, 0, positionId, 1]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, position_type_id, is_radical) VALUES (?, ?, ?, ?, ?)',
        [kanji2.id, component.id, 0, positionId, 0]
      )

      const { getByComponentIdWithPosition } =
        useComponentOccurrenceRepository()
      const occurrences = getByComponentIdWithPosition(component.id)

      expect(occurrences).toHaveLength(2)
      expect(occurrences[0]?.position?.positionName).toBe('hen')
      expect(occurrences[1]?.position?.positionName).toBe('hen')
    })
  })

  describe('updateAnalysisNotes', () => {
    it('updates analysis notes for an occurrence', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Create occurrence
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component.id, 0, 0]
      )
      const occurrenceResult = testDb.exec(
        'SELECT id FROM component_occurrences WHERE kanji_id = ? AND component_id = ?',
        [kanji.id, component.id]
      )
      const occurrenceId = occurrenceResult[0]?.values[0]?.[0] as number

      const { getByKanjiId, updateAnalysisNotes } =
        useComponentOccurrenceRepository()
      updateAnalysisNotes(occurrenceId, 'Test analysis note')

      const occurrences = getByKanjiId(kanji.id)
      expect(occurrences[0]?.analysisNotes).toBe('Test analysis note')
    })

    it('allows setting analysis notes to null', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Create occurrence with notes
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, analysis_notes, is_radical) VALUES (?, ?, ?, ?, ?)',
        [kanji.id, component.id, 0, 'Initial notes', 0]
      )
      const occurrenceResult = testDb.exec(
        'SELECT id FROM component_occurrences WHERE kanji_id = ? AND component_id = ?',
        [kanji.id, component.id]
      )
      const occurrenceId = occurrenceResult[0]?.values[0]?.[0] as number

      const { getByKanjiId, updateAnalysisNotes } =
        useComponentOccurrenceRepository()
      updateAnalysisNotes(occurrenceId, null)

      const occurrences = getByKanjiId(kanji.id)
      expect(occurrences[0]?.analysisNotes).toBeNull()
    })
  })

  describe('updatePosition', () => {
    it('updates position type for an occurrence', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Get position types
      const henResult = testDb.exec(
        "SELECT id FROM position_types WHERE position_name = 'hen' LIMIT 1"
      )
      const henId = henResult[0]?.values[0]?.[0] as number

      const tsukuriResult = testDb.exec(
        "SELECT id FROM position_types WHERE position_name = 'tsukuri' LIMIT 1"
      )
      const tsukuriId = tsukuriResult[0]?.values[0]?.[0] as number

      // Create occurrence with hen position
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, position_type_id, is_radical) VALUES (?, ?, ?, ?, ?)',
        [kanji.id, component.id, 0, henId, 0]
      )
      const occurrenceResult = testDb.exec(
        'SELECT id FROM component_occurrences WHERE kanji_id = ? AND component_id = ?',
        [kanji.id, component.id]
      )
      const occurrenceId = occurrenceResult[0]?.values[0]?.[0] as number

      const { getByKanjiIdWithPosition, updatePosition } =
        useComponentOccurrenceRepository()
      updatePosition(occurrenceId, tsukuriId)

      const occurrences = getByKanjiIdWithPosition(kanji.id)
      expect(occurrences[0]?.position?.positionName).toBe('tsukuri')
    })

    it('allows setting position to null', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Get a position type
      const positionResult = testDb.exec(
        "SELECT id FROM position_types WHERE position_name = 'hen' LIMIT 1"
      )
      const positionId = positionResult[0]?.values[0]?.[0] as number

      // Create occurrence with position
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, position_type_id, is_radical) VALUES (?, ?, ?, ?, ?)',
        [kanji.id, component.id, 0, positionId, 0]
      )
      const occurrenceResult = testDb.exec(
        'SELECT id FROM component_occurrences WHERE kanji_id = ? AND component_id = ?',
        [kanji.id, component.id]
      )
      const occurrenceId = occurrenceResult[0]?.values[0]?.[0] as number

      const { getByKanjiIdWithPosition, updatePosition } =
        useComponentOccurrenceRepository()
      updatePosition(occurrenceId, null)

      const occurrences = getByKanjiIdWithPosition(kanji.id)
      expect(occurrences[0]?.position).toBeNull()
    })
  })

  describe('updateIsRadical', () => {
    it('sets occurrence as radical and syncs kanji.radical_id', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Create occurrence
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component.id, 0, 0]
      )
      const occurrenceResult = testDb.exec(
        'SELECT id FROM component_occurrences WHERE kanji_id = ? AND component_id = ?',
        [kanji.id, component.id]
      )
      const occurrenceId = occurrenceResult[0]?.values[0]?.[0] as number

      const { getByKanjiId, updateIsRadical } =
        useComponentOccurrenceRepository()
      updateIsRadical(occurrenceId, true)

      // Check occurrence is_radical flag
      const occurrences = getByKanjiId(kanji.id)
      expect(occurrences[0]?.isRadical).toBe(true)

      // Check kanji.radical_id is synced
      const kanjiResult = testDb.exec(
        'SELECT radical_id FROM kanjis WHERE id = ?',
        [kanji.id]
      )
      expect(kanjiResult[0]?.values[0]?.[0]).toBe(component.id)
    })

    it('auto-unchecks previous radical when setting new one', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component1 = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })
      const component2 = seedComponent(testDb, {
        character: '木',
        strokeCount: 4
      })

      // Create two occurrences, first one is radical
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component1.id, 0, 1]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component2.id, 1, 0]
      )

      // Update kanji.radical_id to match first occurrence
      testDb.run('UPDATE kanjis SET radical_id = ? WHERE id = ?', [
        component1.id,
        kanji.id
      ])

      // Get second occurrence id
      const occurrenceResult = testDb.exec(
        'SELECT id FROM component_occurrences WHERE kanji_id = ? AND component_id = ?',
        [kanji.id, component2.id]
      )
      const occurrence2Id = occurrenceResult[0]?.values[0]?.[0] as number

      const { getByKanjiId, updateIsRadical } =
        useComponentOccurrenceRepository()
      updateIsRadical(occurrence2Id, true)

      // Check only second occurrence is radical now
      const occurrences = getByKanjiId(kanji.id)
      expect(occurrences[0]?.isRadical).toBe(false)
      expect(occurrences[1]?.isRadical).toBe(true)

      // Check kanji.radical_id is updated
      const kanjiResult = testDb.exec(
        'SELECT radical_id FROM kanjis WHERE id = ?',
        [kanji.id]
      )
      expect(kanjiResult[0]?.values[0]?.[0]).toBe(component2.id)
    })

    it('unsets radical flag and clears kanji.radical_id', () => {
      const kanji = seedKanji(testDb, { character: '休', strokeCount: 6 })
      const component = seedComponent(testDb, {
        character: '亻',
        strokeCount: 2
      })

      // Create occurrence as radical
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order, is_radical) VALUES (?, ?, ?, ?)',
        [kanji.id, component.id, 0, 1]
      )

      // Set kanji.radical_id
      testDb.run('UPDATE kanjis SET radical_id = ? WHERE id = ?', [
        component.id,
        kanji.id
      ])

      const occurrenceResult = testDb.exec(
        'SELECT id FROM component_occurrences WHERE kanji_id = ? AND component_id = ?',
        [kanji.id, component.id]
      )
      const occurrenceId = occurrenceResult[0]?.values[0]?.[0] as number

      const { getByKanjiId, updateIsRadical } =
        useComponentOccurrenceRepository()
      updateIsRadical(occurrenceId, false)

      // Check occurrence is_radical flag
      const occurrences = getByKanjiId(kanji.id)
      expect(occurrences[0]?.isRadical).toBe(false)

      // Check kanji.radical_id is cleared
      const kanjiResult = testDb.exec(
        'SELECT radical_id FROM kanjis WHERE id = ?',
        [kanji.id]
      )
      expect(kanjiResult[0]?.values[0]?.[0]).toBeNull()
    })

    it('throws error if occurrence not found', () => {
      const { updateIsRadical } = useComponentOccurrenceRepository()

      expect(() => {
        updateIsRadical(999999, true)
      }).toThrow('Occurrence with id 999999 not found')
    })
  })
})
