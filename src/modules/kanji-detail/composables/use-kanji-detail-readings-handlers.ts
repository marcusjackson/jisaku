/**
 * Kanji Detail Readings Handlers
 *
 * Composable for handling reading operations in the kanji detail page.
 * Manages on-yomi and kun-yomi CRUD operations.
 */

import {
  processKunReadings,
  processOnReadings
} from '../utils/reading-processing'

import type { ReadingsSaveData } from '../kanji-detail-types'
import type { KunReading, OnReading } from '@/api/kanji'
import type { useKunReadingRepository } from '@/api/kanji/kun-reading-repository'
import type { useOnReadingRepository } from '@/api/kanji/on-reading-repository'
import type { Ref } from 'vue'

interface Repositories {
  kunReadingRepo: ReturnType<typeof useKunReadingRepository>
  onReadingRepo: ReturnType<typeof useOnReadingRepository>
}

interface State {
  kanjiId: Ref<number>
  kunReadings: Ref<KunReading[]>
  onReadings: Ref<OnReading[]>
}

interface UseKanjiDetailReadingsHandlersReturn {
  handleSaveReadings: (data: ReadingsSaveData) => void
  reloadReadings: () => void
}

/**
 * Provides handlers for on-yomi and kun-yomi reading save/reload operations.
 *
 * @param state - Reactive kanji detail state with reading refs
 * @param repos - On-reading and kun-reading repositories
 * @returns Save and reload handlers for readings
 */
export function useKanjiDetailReadingsHandlers(
  state: State,
  repos: Repositories
): UseKanjiDetailReadingsHandlersReturn {
  const { kanjiId, kunReadings, onReadings } = state
  const { kunReadingRepo, onReadingRepo } = repos

  function handleSaveReadings(data: ReadingsSaveData): void {
    processOnReadings(
      data.onReadings,
      onReadings.value,
      kanjiId.value,
      onReadingRepo
    )
    processKunReadings(
      data.kunReadings,
      kunReadings.value,
      kanjiId.value,
      kunReadingRepo
    )
    reloadReadings()
  }

  function reloadReadings(): void {
    kunReadings.value = kunReadingRepo.getByParentId(kanjiId.value)
    onReadings.value = onReadingRepo.getByParentId(kanjiId.value)
  }

  return { handleSaveReadings, reloadReadings }
}

export type { ReadingLevel } from '@/api/kanji'
