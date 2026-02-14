/**
 * Component Form Repository Tests
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
import { useComponentFormRepository } from './use-component-form-repository'

describe('useComponentFormRepository', () => {
  let componentId: number

  beforeEach(async () => {
    testDb = await createTestDatabase()

    // Create a component to use for forms
    testDb.run(
      `INSERT INTO components (character, stroke_count, short_meaning, can_be_radical)
       VALUES ('水', 4, 'water', 1)`
    )
    const idResult = testDb.exec('SELECT last_insert_rowid() as id')
    componentId = idResult[0]?.values[0]?.[0] as number
  })

  describe('getByComponentId', () => {
    it('returns empty array when no forms exist', () => {
      const { getByComponentId } = useComponentFormRepository()
      const forms = getByComponentId(componentId)

      expect(forms).toEqual([])
    })

    it('returns forms ordered by display_order', () => {
      const { create, getByComponentId } = useComponentFormRepository()

      // Create forms in different order
      create({
        componentId,
        formCharacter: '氺',
        displayOrder: 2
      })
      create({
        componentId,
        formCharacter: '水',
        displayOrder: 0
      })
      create({
        componentId,
        formCharacter: '氵',
        displayOrder: 1
      })

      const forms = getByComponentId(componentId)

      expect(forms.length).toBe(3)
      expect(forms[0]?.formCharacter).toBe('水')
      expect(forms[1]?.formCharacter).toBe('氵')
      expect(forms[2]?.formCharacter).toBe('氺')
    })
  })

  describe('getById', () => {
    it('returns form by id', () => {
      const { create, getById } = useComponentFormRepository()

      const created = create({
        componentId,
        formCharacter: '氵',
        formName: 'sanzui',
        strokeCount: 3
      })

      const retrieved = getById(created.id)

      expect(retrieved).toEqual(created)
    })

    it('returns null when form not found', () => {
      const { getById } = useComponentFormRepository()
      const result = getById(999999)

      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('creates form with all fields', () => {
      const { create } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '氵',
        formName: 'sanzui',
        strokeCount: 3,
        usageNotes: 'Used on left side of kanji'
      })

      expect(form.id).toBeDefined()
      expect(form.componentId).toBe(componentId)
      expect(form.formCharacter).toBe('氵')
      expect(form.formName).toBe('sanzui')
      expect(form.strokeCount).toBe(3)
      expect(form.usageNotes).toBe('Used on left side of kanji')
      expect(form.displayOrder).toBe(0)
      expect(form.createdAt).toBeDefined()
      expect(form.updatedAt).toBeDefined()
    })

    it('creates form with minimal fields', () => {
      const { create } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '水'
      })

      expect(form.formCharacter).toBe('水')
      expect(form.formName).toBeNull()
      expect(form.strokeCount).toBeNull()
      expect(form.usageNotes).toBeNull()
    })

    it('auto-increments display_order', () => {
      const { create } = useComponentFormRepository()

      const form1 = create({ componentId, formCharacter: '水' })
      const form2 = create({ componentId, formCharacter: '氵' })
      const form3 = create({ componentId, formCharacter: '氺' })

      expect(form1.displayOrder).toBe(0)
      expect(form2.displayOrder).toBe(1)
      expect(form3.displayOrder).toBe(2)
    })
  })

  describe('update', () => {
    it('updates form name', () => {
      const { create, getById, update } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '氵'
      })

      update(form.id, { formName: 'sanzui' })

      const updated = getById(form.id)
      expect(updated?.formName).toBe('sanzui')
    })

    it('updates stroke count', () => {
      const { create, getById, update } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '氵'
      })

      update(form.id, { strokeCount: 3 })

      const updated = getById(form.id)
      expect(updated?.strokeCount).toBe(3)
    })

    it('updates usage notes', () => {
      const { create, getById, update } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '氵'
      })

      update(form.id, { usageNotes: 'Left side' })

      const updated = getById(form.id)
      expect(updated?.usageNotes).toBe('Left side')
    })

    it('updates multiple fields at once', () => {
      const { create, getById, update } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '氵'
      })

      update(form.id, {
        formName: 'sanzui',
        strokeCount: 3,
        usageNotes: 'Water radical on left'
      })

      const updated = getById(form.id)
      expect(updated?.formName).toBe('sanzui')
      expect(updated?.strokeCount).toBe(3)
      expect(updated?.usageNotes).toBe('Water radical on left')
    })

    it('allows setting values to null', () => {
      const { create, getById, update } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '氵',
        formName: 'sanzui',
        strokeCount: 3
      })

      update(form.id, { formName: null, strokeCount: null })

      const updated = getById(form.id)
      expect(updated?.formName).toBeNull()
      expect(updated?.strokeCount).toBeNull()
    })
  })

  describe('remove', () => {
    it('removes form', () => {
      const { create, getById, remove } = useComponentFormRepository()

      const form = create({
        componentId,
        formCharacter: '氵'
      })

      remove(form.id)

      const retrieved = getById(form.id)
      expect(retrieved).toBeNull()
    })

    it('does not affect other forms', () => {
      const { create, getByComponentId, remove } = useComponentFormRepository()

      const form1 = create({ componentId, formCharacter: '水' })
      const form2 = create({ componentId, formCharacter: '氵' })

      remove(form1.id)

      const forms = getByComponentId(componentId)
      expect(forms.length).toBe(1)
      expect(forms[0]?.id).toBe(form2.id)
    })
  })

  describe('reorder', () => {
    it('reorders forms by setting display_order', () => {
      const { create, getByComponentId, reorder } = useComponentFormRepository()

      const form1 = create({ componentId, formCharacter: '水' })
      const form2 = create({ componentId, formCharacter: '氵' })
      const form3 = create({ componentId, formCharacter: '氺' })

      // Reverse the order
      reorder([form3.id, form2.id, form1.id])

      const forms = getByComponentId(componentId)
      expect(forms[0]?.formCharacter).toBe('氺')
      expect(forms[1]?.formCharacter).toBe('氵')
      expect(forms[2]?.formCharacter).toBe('水')
    })
  })

  describe('getNextDisplayOrder', () => {
    it('returns 0 when no forms exist', () => {
      const { getNextDisplayOrder } = useComponentFormRepository()

      const order = getNextDisplayOrder(componentId)
      expect(order).toBe(0)
    })

    it('returns next available order', () => {
      const { create, getNextDisplayOrder } = useComponentFormRepository()

      create({ componentId, formCharacter: '水' })
      create({ componentId, formCharacter: '氵' })

      const order = getNextDisplayOrder(componentId)
      expect(order).toBe(2)
    })
  })
})
