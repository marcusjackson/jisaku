/**
 * Component Occurrence Repository Tests
 *
 * Unit tests for component occurrences in kanji repository.
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
import { useComponentOccurrenceRepository } from './component-occurrence-repository'

describe('useComponentOccurrenceRepository', function () {
  let kanjiId: number
  let componentId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()

    // Create a kanji
    testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', [
      '明',
      8
    ])
    kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number

    // Create a component
    testDb.run(
      'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
      ['日', 4]
    )
    componentId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByParentId', () => {
    it('returns empty array when no occurrences exist', () => {
      const repo = useComponentOccurrenceRepository()
      expect(repo.getByParentId(kanjiId)).toEqual([])
    })

    it('returns occurrences ordered by display_order', () => {
      // Create second component
      testDb.run('INSERT INTO components (character) VALUES (?)', ['月'])
      const secondComponentId = testDb.exec(
        'SELECT last_insert_rowid() as id'
      )[0]?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 0]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, secondComponentId, 0, 1]
      )

      const repo = useComponentOccurrenceRepository()
      const occurrences = repo.getByParentId(kanjiId)

      expect(occurrences).toHaveLength(2)
      expect(occurrences[0]?.componentId).toBe(componentId)
      expect(occurrences[1]?.componentId).toBe(secondComponentId)
    })
  })

  describe('getById', () => {
    it('returns null when occurrence does not exist', () => {
      const repo = useComponentOccurrenceRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns occurrence when it exists', () => {
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 1, 0]
      )

      const repo = useComponentOccurrenceRepository()
      const occurrence = repo.getById(1)

      expect(occurrence?.kanjiId).toBe(kanjiId)
      expect(occurrence?.componentId).toBe(componentId)
      expect(occurrence?.isRadical).toBe(true)
    })
  })

  describe('getByComponentId', () => {
    it('returns empty array when component has no occurrences', () => {
      const repo = useComponentOccurrenceRepository()
      expect(repo.getByComponentId(componentId)).toEqual([])
    })

    it('returns all occurrences of a component', () => {
      // Create second kanji
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['暗'])
      const secondKanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 0]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [secondKanjiId, componentId, 0, 0]
      )

      const repo = useComponentOccurrenceRepository()
      const occurrences = repo.getByComponentId(componentId)

      expect(occurrences).toHaveLength(2)
    })
  })

  describe('getByComponentIdWithKanji', () => {
    it('returns empty array when component has no occurrences', () => {
      const repo = useComponentOccurrenceRepository()
      expect(repo.getByComponentIdWithKanji(componentId)).toEqual([])
    })

    it('returns occurrences with joined kanji data', () => {
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order, analysis_notes) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, componentId, 1, 0, 'Test notes']
      )

      const repo = useComponentOccurrenceRepository()
      const occurrences = repo.getByComponentIdWithKanji(componentId)

      expect(occurrences).toHaveLength(1)
      expect(occurrences[0]?.kanji.character).toBe('明')
      expect(occurrences[0]?.kanji.strokeCount).toBe(8)
      expect(occurrences[0]?.isRadical).toBe(true)
      expect(occurrences[0]?.analysisNotes).toBe('Test notes')
    })

    it('returns null for position when no position is assigned', () => {
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 0]
      )

      const repo = useComponentOccurrenceRepository()
      const occurrences = repo.getByComponentIdWithKanji(componentId)

      expect(occurrences[0]?.position).toBeNull()
    })

    it('returns joined position data when position is assigned', () => {
      // Use seeded position type 'hen' (id=1 in seeded data)
      const positionTypeId = testDb.exec(
        "SELECT id FROM position_types WHERE position_name = 'hen'"
      )[0]?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, position_type_id, is_radical, display_order) VALUES (?, ?, ?, ?, ?)',
        [kanjiId, componentId, positionTypeId, 0, 0]
      )

      const repo = useComponentOccurrenceRepository()
      const occurrences = repo.getByComponentIdWithKanji(componentId)

      expect(occurrences[0]?.position).not.toBeNull()
      expect(occurrences[0]?.position?.positionName).toBe('hen')
      expect(occurrences[0]?.position?.nameJapanese).toBe('偏')
      expect(occurrences[0]?.position?.nameEnglish).toBe('Left side')
    })

    it('returns occurrences ordered by display_order', () => {
      // Create second kanji
      testDb.run(
        'INSERT INTO kanjis (character, short_meaning) VALUES (?, ?)',
        ['暗', 'dark']
      )
      const secondKanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [secondKanjiId, componentId, 0, 0]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 1]
      )

      const repo = useComponentOccurrenceRepository()
      const occurrences = repo.getByComponentIdWithKanji(componentId)

      expect(occurrences).toHaveLength(2)
      expect(occurrences[0]?.kanji.character).toBe('暗')
      expect(occurrences[1]?.kanji.character).toBe('明')
    })
  })

  describe('getRadicalOccurrence', () => {
    it('returns null when kanji has no radical', () => {
      const repo = useComponentOccurrenceRepository()
      expect(repo.getRadicalOccurrence(kanjiId)).toBeNull()
    })

    it('returns the radical occurrence', () => {
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 1, 0]
      )

      const repo = useComponentOccurrenceRepository()
      const radical = repo.getRadicalOccurrence(kanjiId)

      expect(radical?.isRadical).toBe(true)
      expect(radical?.componentId).toBe(componentId)
    })
  })

  describe('create', () => {
    it('creates an occurrence with default values', () => {
      const repo = useComponentOccurrenceRepository()
      const occurrence = repo.create({
        kanjiId,
        componentId
      })

      expect(occurrence.kanjiId).toBe(kanjiId)
      expect(occurrence.componentId).toBe(componentId)
      expect(occurrence.isRadical).toBe(false)
      expect(occurrence.displayOrder).toBe(0)
    })

    it('creates a radical occurrence', () => {
      const repo = useComponentOccurrenceRepository()
      const occurrence = repo.create({
        kanjiId,
        componentId,
        isRadical: true
      })

      expect(occurrence.isRadical).toBe(true)
    })

    it('auto-increments display_order', () => {
      // Create second component
      testDb.run('INSERT INTO components (character) VALUES (?)', ['月'])
      const secondComponentId = testDb.exec(
        'SELECT last_insert_rowid() as id'
      )[0]?.values[0]?.[0] as number

      const repo = useComponentOccurrenceRepository()

      repo.create({ kanjiId, componentId })
      const second = repo.create({ kanjiId, componentId: secondComponentId })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when occurrence does not exist', () => {
      const repo = useComponentOccurrenceRepository()
      const throwFn = () => repo.update(999, { isRadical: true })

      expect(throwFn).toThrow('ComponentOccurrence with id 999 not found')
    })

    it('updates occurrence fields', () => {
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 0]
      )

      const repo = useComponentOccurrenceRepository()
      const updated = repo.update(1, {
        isRadical: true,
        analysisNotes: 'This is the radical'
      })

      expect(updated.isRadical).toBe(true)
      expect(updated.analysisNotes).toBe('This is the radical')
    })
  })

  describe('remove', () => {
    it('removes an occurrence', () => {
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 0]
      )

      const repo = useComponentOccurrenceRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('removeByKanjiId', () => {
    it('removes all occurrences for a kanji', () => {
      // Create second component
      testDb.run('INSERT INTO components (character) VALUES (?)', ['月'])
      const secondComponentId = testDb.exec(
        'SELECT last_insert_rowid() as id'
      )[0]?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 0]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, secondComponentId, 0, 1]
      )

      const repo = useComponentOccurrenceRepository()
      repo.removeByKanjiId(kanjiId)

      expect(repo.getByParentId(kanjiId)).toEqual([])
    })
  })

  describe('reorder', () => {
    it('reorders occurrences by new id sequence', () => {
      // Create second component
      testDb.run('INSERT INTO components (character) VALUES (?)', ['月'])
      const secondComponentId = testDb.exec(
        'SELECT last_insert_rowid() as id'
      )[0]?.values[0]?.[0] as number

      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, componentId, 0, 0]
      )
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, secondComponentId, 0, 1]
      )

      const repo = useComponentOccurrenceRepository()
      repo.reorder([2, 1])

      const occurrences = repo.getByParentId(kanjiId)
      expect(occurrences[0]?.componentId).toBe(secondComponentId)
      expect(occurrences[1]?.componentId).toBe(componentId)
    })
  })
})
