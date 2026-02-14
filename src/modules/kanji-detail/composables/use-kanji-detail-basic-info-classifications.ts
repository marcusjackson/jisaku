/**
 * Use Kanji Detail Basic Info Classifications
 *
 * Manages local classification state within the basic info dialog.
 * Handles add/remove/reorder operations and normalizes indices on save.
 *
 * @module modules/kanji-detail
 */

import { computed, ref } from 'vue'

import type { ClassificationChange } from '../kanji-detail-types'
import type { ClassificationItem } from '../schemas/basic-info-schema'
import type { KanjiClassification } from '@/api/classification/classification-types'

// Helpers extracted to reduce function line count

function mapToItem(c: KanjiClassification): ClassificationItem {
  return {
    id: c.id,
    classificationTypeId: c.classificationTypeId,
    displayOrder: c.displayOrder
  }
}

function swapItems(arr: ClassificationItem[], i: number, j: number): void {
  const a = arr[i]
  const b = arr[j]
  if (a && b) {
    arr[i] = b
    arr[j] = a
  }
}

function createNewItem(
  items: ClassificationItem[],
  typeId: number
): ClassificationItem {
  const maxOrder = Math.max(-1, ...items.map((i) => i.displayOrder))
  return {
    id: undefined,
    classificationTypeId: typeId,
    displayOrder: maxOrder + 1
  }
}

export function useKanjiDetailBasicInfoClassifications(
  initial: KanjiClassification[]
) {
  const items = ref<ClassificationItem[]>(initial.map(mapToItem))

  const normalizedItems = computed<ClassificationChange[]>(() =>
    items.value
      .filter((item) => item.classificationTypeId > 0)
      .map((item, index) => ({
        id: item.id,
        classificationTypeId: item.classificationTypeId,
        displayOrder: index
      }))
  )

  const reset = (newInitial: KanjiClassification[]) => {
    items.value = newInitial.map(mapToItem)
  }
  const add = (typeId: number) => {
    items.value.push(createNewItem(items.value, typeId))
  }
  const removeAt = (index: number) => {
    items.value.splice(index, 1)
  }
  const moveUp = (index: number) => {
    if (index > 0) swapItems(items.value, index - 1, index)
  }
  const moveDown = (index: number) => {
    if (index < items.value.length - 1) swapItems(items.value, index, index + 1)
  }
  const hasType = (id: number) =>
    items.value.some((i) => i.classificationTypeId === id)

  return {
    items,
    normalizedItems,
    reset,
    add,
    removeAt,
    moveUp,
    moveDown,
    hasType
  }
}

export type UseKanjiDetailBasicInfoClassificationsReturn = ReturnType<
  typeof useKanjiDetailBasicInfoClassifications
>
