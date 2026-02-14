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

// eslint-disable-next-line max-lines-per-function -- Handler collection composable
export function useKanjiDetailReadingsDialogHandlers(
  editOnReadings: Ref<EditOnReading[]>,
  editKunReadings: Ref<EditKunReading[]>,
  nextTempId: Ref<number>
) {
  // On-yomi handlers
  function addOnReading(): void {
    editOnReadings.value.push({
      id: nextTempId.value--,
      isNew: true,
      reading: '',
      readingLevel: '小'
    })
  }

  function updateOnReadingField(index: number, value: string): void {
    const reading = editOnReadings.value[index]
    if (reading) reading.reading = value
  }

  function updateOnReadingLevel(index: number, value: ReadingLevel): void {
    const reading = editOnReadings.value[index]
    if (reading) reading.readingLevel = value
  }

  function moveOnReading(index: number, direction: -1 | 1): void {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= editOnReadings.value.length) return
    const items = [...editOnReadings.value]
    const current = items[index]
    const target = items[newIndex]
    if (current && target) {
      items[index] = target
      items[newIndex] = current
      editOnReadings.value = items
    }
  }

  function removeOnReading(index: number): void {
    editOnReadings.value.splice(index, 1)
  }

  // Kun-yomi handlers
  function addKunReading(): void {
    editKunReadings.value.push({
      id: nextTempId.value--,
      isNew: true,
      okurigana: '',
      reading: '',
      readingLevel: '小'
    })
  }

  function updateKunReadingField(index: number, value: string): void {
    const reading = editKunReadings.value[index]
    if (reading) reading.reading = value
  }

  function updateKunOkurigana(index: number, value: string): void {
    const reading = editKunReadings.value[index]
    if (reading) reading.okurigana = value
  }

  function updateKunReadingLevel(index: number, value: ReadingLevel): void {
    const reading = editKunReadings.value[index]
    if (reading) reading.readingLevel = value
  }

  function moveKunReading(index: number, direction: -1 | 1): void {
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= editKunReadings.value.length) return
    const items = [...editKunReadings.value]
    const current = items[index]
    const target = items[newIndex]
    if (current && target) {
      items[index] = target
      items[newIndex] = current
      editKunReadings.value = items
    }
  }

  function removeKunReading(index: number): void {
    editKunReadings.value.splice(index, 1)
  }

  return {
    addKunReading,
    addOnReading,
    moveKunReading,
    moveOnReading,
    removeKunReading,
    removeOnReading,
    updateKunOkurigana,
    updateKunReadingField,
    updateKunReadingLevel,
    updateOnReadingField,
    updateOnReadingLevel
  }
}
