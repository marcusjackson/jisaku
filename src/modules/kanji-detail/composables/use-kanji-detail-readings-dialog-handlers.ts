/**
 * use-kanji-detail-readings-dialog-handlers
 *
 * Handlers for managing readings in the edit dialog.
 * Extracted from KanjiDetailDialogReadings to keep file size under limit.
 */

import type {
  EditKunReading,
  EditOnReading,
  ReadingLevel
} from '../kanji-detail-types'
import type { Ref } from 'vue'

// ============================================================================
// Return type
// ============================================================================

interface UseKanjiDetailReadingsDialogHandlersReturn {
  addOnReading: () => void
  updateOnReadingField: (index: number, value: string) => void
  updateOnReadingLevel: (index: number, value: ReadingLevel) => void
  moveOnReading: (index: number, direction: -1 | 1) => void
  removeOnReading: (index: number) => void
  addKunReading: () => void
  updateKunReadingField: (index: number, value: string) => void
  updateKunOkurigana: (index: number, value: string) => void
  updateKunReadingLevel: (index: number, value: ReadingLevel) => void
  moveKunReading: (index: number, direction: -1 | 1) => void
  removeKunReading: (index: number) => void
}

// ============================================================================
// Module-scope implementation functions — On-yomi
// ============================================================================

function doAddOnReading(
  editOnReadings: Ref<EditOnReading[]>,
  nextTempId: Ref<number>
): void {
  editOnReadings.value.push({
    id: nextTempId.value--,
    isNew: true,
    reading: '',
    readingLevel: '小'
  })
}

function doUpdateOnReadingField(
  editOnReadings: Ref<EditOnReading[]>,
  index: number,
  value: string
): void {
  const reading = editOnReadings.value[index]
  if (reading) reading.reading = value
}

function doUpdateOnReadingLevel(
  editOnReadings: Ref<EditOnReading[]>,
  index: number,
  value: ReadingLevel
): void {
  const reading = editOnReadings.value[index]
  if (reading) reading.readingLevel = value
}

function doMoveReading<T>(
  arr: Ref<T[]>,
  index: number,
  direction: -1 | 1
): void {
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= arr.value.length) return
  const items = [...arr.value]
  const current = items[index]
  const target = items[newIndex]
  if (current && target) {
    items[index] = target
    items[newIndex] = current
    arr.value = items
  }
}

// ============================================================================
// Module-scope implementation functions — Kun-yomi
// ============================================================================

function doAddKunReading(
  editKunReadings: Ref<EditKunReading[]>,
  nextTempId: Ref<number>
): void {
  editKunReadings.value.push({
    id: nextTempId.value--,
    isNew: true,
    okurigana: '',
    reading: '',
    readingLevel: '小'
  })
}

function doUpdateKunReadingField(
  editKunReadings: Ref<EditKunReading[]>,
  index: number,
  value: string
): void {
  const reading = editKunReadings.value[index]
  if (reading) reading.reading = value
}

function doUpdateKunOkurigana(
  editKunReadings: Ref<EditKunReading[]>,
  index: number,
  value: string
): void {
  const reading = editKunReadings.value[index]
  if (reading) reading.okurigana = value
}

function doUpdateKunReadingLevel(
  editKunReadings: Ref<EditKunReading[]>,
  index: number,
  value: ReadingLevel
): void {
  const reading = editKunReadings.value[index]
  if (reading) reading.readingLevel = value
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Provides handlers for on-yomi and kun-yomi reading management in the edit dialog.
 *
 * @param editOnReadings - Ref to the list of on-yomi readings being edited
 * @param editKunReadings - Ref to the list of kun-yomi readings being edited
 * @param nextTempId - Ref providing decremented temp IDs for new items
 * @returns Handlers for adding, updating, moving, and removing readings
 */
export function useKanjiDetailReadingsDialogHandlers(
  editOnReadings: Ref<EditOnReading[]>,
  editKunReadings: Ref<EditKunReading[]>,
  nextTempId: Ref<number>
): UseKanjiDetailReadingsDialogHandlersReturn {
  return {
    addOnReading: () => {
      doAddOnReading(editOnReadings, nextTempId)
    },
    updateOnReadingField: (i, v) => {
      doUpdateOnReadingField(editOnReadings, i, v)
    },
    updateOnReadingLevel: (i, v) => {
      doUpdateOnReadingLevel(editOnReadings, i, v)
    },
    moveOnReading: (i, d) => {
      doMoveReading(editOnReadings, i, d)
    },
    removeOnReading: (i) => {
      editOnReadings.value.splice(i, 1)
    },
    addKunReading: () => {
      doAddKunReading(editKunReadings, nextTempId)
    },
    updateKunReadingField: (i, v) => {
      doUpdateKunReadingField(editKunReadings, i, v)
    },
    updateKunOkurigana: (i, v) => {
      doUpdateKunOkurigana(editKunReadings, i, v)
    },
    updateKunReadingLevel: (i, v) => {
      doUpdateKunReadingLevel(editKunReadings, i, v)
    },
    moveKunReading: (i, d) => {
      doMoveReading(editKunReadings, i, d)
    },
    removeKunReading: (i) => {
      editKunReadings.value.splice(i, 1)
    }
  }
}
