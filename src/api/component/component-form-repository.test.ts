/**
 * Component Form Repository Tests
 *
 * Unit tests for component visual variants repository.
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
import { useComponentFormRepository } from './component-form-repository'

describe('useComponentFormRepository', function () {
  let componentId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()
    testDb.run(
      'INSERT INTO components (character, stroke_count) VALUES (?, ?)',
      ['水', 4]
    )
    componentId = testDb.exec('SELECT last_insert_rowid() as id')[0]
      ?.values[0]?.[0] as number
  })

  describe('getByParentId', () => {
    it('returns empty array when no forms exist', () => {
      const repo = useComponentFormRepository()
      expect(repo.getByParentId(componentId)).toEqual([])
    })

    it('returns forms ordered by display_order', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氵', 0]
      )
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氺', 1]
      )

      const repo = useComponentFormRepository()
      const forms = repo.getByParentId(componentId)

      expect(forms).toHaveLength(2)
      expect(forms[0]?.formCharacter).toBe('氵')
      expect(forms[1]?.formCharacter).toBe('氺')
    })
  })

  describe('getById', () => {
    it('returns null when form does not exist', () => {
      const repo = useComponentFormRepository()
      expect(repo.getById(999)).toBeNull()
    })

    it('returns form when it exists', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, form_name, display_order) VALUES (?, ?, ?, ?)',
        [componentId, '氵', 'water left', 0]
      )

      const repo = useComponentFormRepository()
      const form = repo.getById(1)

      expect(form?.formCharacter).toBe('氵')
      expect(form?.formName).toBe('water left')
    })
  })

  describe('getPrimaryForm', () => {
    it('returns null when no forms exist', () => {
      const repo = useComponentFormRepository()
      expect(repo.getPrimaryForm(componentId)).toBeNull()
    })

    it('returns first form (by display_order) as primary', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氺', 1]
      )
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氵', 0]
      )

      const repo = useComponentFormRepository()
      const primary = repo.getPrimaryForm(componentId)

      expect(primary?.formCharacter).toBe('氵')
    })
  })

  describe('create', () => {
    it('creates a form with default values', () => {
      const repo = useComponentFormRepository()
      const form = repo.create({
        componentId,
        formCharacter: '氵'
      })

      expect(form.formCharacter).toBe('氵')
      expect(form.formName).toBeNull()
      expect(form.displayOrder).toBe(0)
    })

    it('creates a form with optional fields', () => {
      const repo = useComponentFormRepository()
      const form = repo.create({
        componentId,
        formCharacter: '氵',
        formName: 'water left'
      })

      expect(form.formName).toBe('water left')
    })

    it('auto-increments display_order', () => {
      const repo = useComponentFormRepository()

      repo.create({ componentId, formCharacter: '氵' })
      const second = repo.create({ componentId, formCharacter: '氺' })

      expect(second.displayOrder).toBe(1)
    })
  })

  describe('update', () => {
    it('throws when form does not exist', () => {
      const repo = useComponentFormRepository()
      const throwFn = () => repo.update(999, { formCharacter: '氺' })

      expect(throwFn).toThrow('ComponentForm with id 999 not found')
    })

    it('updates form fields', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氵', 0]
      )

      const repo = useComponentFormRepository()
      const updated = repo.update(1, {
        formCharacter: '氺',
        formName: 'water bottom'
      })

      expect(updated.formCharacter).toBe('氺')
      expect(updated.formName).toBe('water bottom')
    })
  })

  describe('remove', () => {
    it('removes a form', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氵', 0]
      )

      const repo = useComponentFormRepository()
      repo.remove(1)

      expect(repo.getById(1)).toBeNull()
    })
  })

  describe('reorder', () => {
    it('reorders forms by new id sequence', () => {
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氵', 0]
      )
      testDb.run(
        'INSERT INTO component_forms (component_id, form_character, display_order) VALUES (?, ?, ?)',
        [componentId, '氺', 1]
      )

      const repo = useComponentFormRepository()
      repo.reorder([2, 1])

      const forms = repo.getByParentId(componentId)
      expect(forms[0]?.formCharacter).toBe('氺')
      expect(forms[1]?.formCharacter).toBe('氵')
    })
  })
})
