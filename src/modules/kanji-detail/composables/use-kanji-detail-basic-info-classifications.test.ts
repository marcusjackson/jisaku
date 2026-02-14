/**
 * Tests for useKanjiDetailBasicInfoClassifications composable
 */

import { describe, expect, it } from 'vitest'

import { useKanjiDetailBasicInfoClassifications } from './use-kanji-detail-basic-info-classifications'

import type { KanjiClassification } from '@/api/classification/classification-types'

const createClassification = (
  id: number,
  typeId: number,
  order: number
): KanjiClassification => ({
  id,
  kanjiId: 1,
  classificationTypeId: typeId,
  displayOrder: order
})

describe('useKanjiDetailBasicInfoClassifications', () => {
  describe('initialization', () => {
    it('initializes with empty array', () => {
      const { items } = useKanjiDetailBasicInfoClassifications([])
      expect(items.value).toEqual([])
    })

    it('initializes with provided classifications', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1)
      ]
      const { items } = useKanjiDetailBasicInfoClassifications(initial)

      expect(items.value).toHaveLength(2)
      expect(items.value[0]).toEqual({
        id: 1,
        classificationTypeId: 10,
        displayOrder: 0
      })
      expect(items.value[1]).toEqual({
        id: 2,
        classificationTypeId: 20,
        displayOrder: 1
      })
    })
  })

  describe('add', () => {
    it('adds a new classification with correct displayOrder', () => {
      const { add, items } = useKanjiDetailBasicInfoClassifications([])

      add(10)

      expect(items.value).toHaveLength(1)
      expect(items.value[0]).toEqual({
        id: undefined,
        classificationTypeId: 10,
        displayOrder: 0
      })
    })

    it('increments displayOrder for subsequent additions', () => {
      const { add, items } = useKanjiDetailBasicInfoClassifications([])

      add(10)
      add(20)
      add(30)

      expect(items.value[0]?.displayOrder).toBe(0)
      expect(items.value[1]?.displayOrder).toBe(1)
      expect(items.value[2]?.displayOrder).toBe(2)
    })

    it('continues from highest existing order', () => {
      const initial = [createClassification(1, 10, 5)]
      const { add, items } = useKanjiDetailBasicInfoClassifications(initial)

      add(20)

      expect(items.value[1]?.displayOrder).toBe(6)
    })
  })

  describe('removeAt', () => {
    it('removes item at specified index', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1),
        createClassification(3, 30, 2)
      ]
      const { items, removeAt } =
        useKanjiDetailBasicInfoClassifications(initial)

      removeAt(1)

      expect(items.value).toHaveLength(2)
      expect(items.value.map((i) => i.classificationTypeId)).toEqual([10, 30])
    })

    it('removes first item', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1)
      ]
      const { items, removeAt } =
        useKanjiDetailBasicInfoClassifications(initial)

      removeAt(0)

      expect(items.value).toHaveLength(1)
      expect(items.value[0]?.classificationTypeId).toBe(20)
    })

    it('removes last item', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1)
      ]
      const { items, removeAt } =
        useKanjiDetailBasicInfoClassifications(initial)

      removeAt(1)

      expect(items.value).toHaveLength(1)
      expect(items.value[0]?.classificationTypeId).toBe(10)
    })
  })

  describe('moveUp', () => {
    it('moves item up one position', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1),
        createClassification(3, 30, 2)
      ]
      const { items, moveUp } = useKanjiDetailBasicInfoClassifications(initial)

      moveUp(1)

      expect(items.value.map((i) => i.classificationTypeId)).toEqual([
        20, 10, 30
      ])
    })

    it('does nothing when index is 0', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1)
      ]
      const { items, moveUp } = useKanjiDetailBasicInfoClassifications(initial)

      moveUp(0)

      expect(items.value.map((i) => i.classificationTypeId)).toEqual([10, 20])
    })

    it('does nothing when index is negative', () => {
      const initial = [createClassification(1, 10, 0)]
      const { items, moveUp } = useKanjiDetailBasicInfoClassifications(initial)

      moveUp(-1)

      expect(items.value.map((i) => i.classificationTypeId)).toEqual([10])
    })
  })

  describe('moveDown', () => {
    it('moves item down one position', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1),
        createClassification(3, 30, 2)
      ]
      const { items, moveDown } =
        useKanjiDetailBasicInfoClassifications(initial)

      moveDown(1)

      expect(items.value.map((i) => i.classificationTypeId)).toEqual([
        10, 30, 20
      ])
    })

    it('does nothing when at last index', () => {
      const initial = [
        createClassification(1, 10, 0),
        createClassification(2, 20, 1)
      ]
      const { items, moveDown } =
        useKanjiDetailBasicInfoClassifications(initial)

      moveDown(1)

      expect(items.value.map((i) => i.classificationTypeId)).toEqual([10, 20])
    })
  })

  describe('hasType', () => {
    it('returns true when type exists', () => {
      const initial = [createClassification(1, 10, 0)]
      const { hasType } = useKanjiDetailBasicInfoClassifications(initial)

      expect(hasType(10)).toBe(true)
    })

    it('returns false when type does not exist', () => {
      const initial = [createClassification(1, 10, 0)]
      const { hasType } = useKanjiDetailBasicInfoClassifications(initial)

      expect(hasType(99)).toBe(false)
    })

    it('returns false on empty list', () => {
      const { hasType } = useKanjiDetailBasicInfoClassifications([])

      expect(hasType(10)).toBe(false)
    })
  })

  describe('reset', () => {
    it('resets items to new classifications', () => {
      const initial = [createClassification(1, 10, 0)]
      const { items, reset } = useKanjiDetailBasicInfoClassifications(initial)

      reset([createClassification(2, 20, 0), createClassification(3, 30, 1)])

      expect(items.value).toHaveLength(2)
      expect(items.value[0]?.classificationTypeId).toBe(20)
      expect(items.value[1]?.classificationTypeId).toBe(30)
    })

    it('resets to empty array', () => {
      const initial = [createClassification(1, 10, 0)]
      const { items, reset } = useKanjiDetailBasicInfoClassifications(initial)

      reset([])

      expect(items.value).toHaveLength(0)
    })
  })

  describe('normalizedItems', () => {
    it('recalculates displayOrder from 0', () => {
      const initial = [
        createClassification(1, 10, 5),
        createClassification(2, 20, 10),
        createClassification(3, 30, 15)
      ]
      const { normalizedItems } =
        useKanjiDetailBasicInfoClassifications(initial)

      expect(normalizedItems.value[0]?.displayOrder).toBe(0)
      expect(normalizedItems.value[1]?.displayOrder).toBe(1)
      expect(normalizedItems.value[2]?.displayOrder).toBe(2)
    })

    it('filters out items with classificationTypeId of 0', () => {
      const initial = [
        createClassification(1, 0, 0),
        createClassification(2, 20, 1)
      ]
      const { normalizedItems } =
        useKanjiDetailBasicInfoClassifications(initial)

      expect(normalizedItems.value).toHaveLength(1)
      expect(normalizedItems.value[0]?.classificationTypeId).toBe(20)
    })

    it('preserves id for existing items', () => {
      const initial = [createClassification(42, 10, 0)]
      const { normalizedItems } =
        useKanjiDetailBasicInfoClassifications(initial)

      expect(normalizedItems.value[0]?.id).toBe(42)
    })

    it('has undefined id for new items', () => {
      const { add, normalizedItems } = useKanjiDetailBasicInfoClassifications(
        []
      )

      add(10)

      expect(normalizedItems.value[0]?.id).toBeUndefined()
    })
  })
})
