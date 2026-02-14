/**
 * Use Kanji Detail Save Handlers
 *
 * Wraps save operations with toast notifications
 *
 * @module modules/kanji-detail
 */

import { useToast } from '@/shared/composables/use-toast'

import type {
  BasicInfoSaveData,
  MeaningsSaveData,
  ReadingsSaveData
} from '../kanji-detail-types'

export function useKanjiDetailSaveHandlers(
  saveBasicInfo: (data: BasicInfoSaveData) => void,
  handleSaveReadings: (data: ReadingsSaveData) => void,
  handleSaveMeanings: (data: MeaningsSaveData) => void
) {
  const toast = useToast()

  function handleBasicInfoSave(data: BasicInfoSaveData): void {
    try {
      saveBasicInfo(data)
      toast.success('Basic info updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
  }

  function handleReadingsSave(data: ReadingsSaveData): void {
    try {
      handleSaveReadings(data)
      toast.success('Readings updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
  }

  function handleMeaningsSave(data: MeaningsSaveData): void {
    try {
      handleSaveMeanings(data)
      toast.success('Meanings updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    }
  }

  return {
    handleBasicInfoSave,
    handleReadingsSave,
    handleMeaningsSave
  }
}
