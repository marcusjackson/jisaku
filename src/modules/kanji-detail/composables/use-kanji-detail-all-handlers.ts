/**
 * use-kanji-detail-all-handlers
 *
 * Facade composable that combines all kanji detail handlers.
 * Reduces import count in KanjiDetailRoot.
 */

import { useKanjiDetailNotesHandlers } from './use-kanji-detail-notes-handlers'
import { useKanjiDetailSaveHandlers } from './use-kanji-detail-save-handlers'

import type {
  BasicInfoSaveData,
  MeaningsSaveData,
  ReadingsSaveData
} from '../kanji-detail-types'
import type { Kanji } from '@/api/kanji'
import type { Ref } from 'vue'

interface UseKanjiDetailAllHandlersReturn {
  // Save handlers
  handleBasicInfoSave: (data: BasicInfoSaveData) => void
  handleMeaningsSave: (data: MeaningsSaveData) => void
  handleReadingsSave: (data: ReadingsSaveData) => void
  // Notes handlers
  handleSemanticNotesSave: (value: string | null) => void
  handleEtymologyNotesSave: (value: string | null) => void
  handleEducationNotesSave: (value: string | null) => void
  handlePersonalNotesSave: (value: string | null) => void
  // Stroke handlers
  handleStrokeDiagramSave: (value: Uint8Array | null) => void
  handleStrokeAnimationSave: (value: Uint8Array | null) => void
}

/**
 * Facade composable combining all kanji detail handlers into a single interface.
 *
 * @param kanji - Reactive reference to the current kanji
 * @param saveBasicInfo - Handler for saving basic info changes
 * @param handleSaveReadings - Handler for saving readings changes
 * @param handleSaveMeanings - Handler for saving meanings changes
 * @returns Combined handlers for notes, save, and stroke operations
 */
export function useKanjiDetailAllHandlers(
  kanji: Ref<Kanji | null>,
  saveBasicInfo: (data: BasicInfoSaveData) => void,
  handleSaveReadings: (data: ReadingsSaveData) => void,
  handleSaveMeanings: (data: MeaningsSaveData) => void
): UseKanjiDetailAllHandlersReturn {
  const { handleBasicInfoSave, handleMeaningsSave, handleReadingsSave } =
    useKanjiDetailSaveHandlers(
      saveBasicInfo,
      handleSaveReadings,
      handleSaveMeanings
    )

  const {
    handleEducationNotesSave,
    handleEtymologyNotesSave,
    handlePersonalNotesSave,
    handleSemanticNotesSave,
    handleStrokeAnimationSave,
    handleStrokeDiagramSave
  } = useKanjiDetailNotesHandlers(kanji)

  return {
    handleBasicInfoSave,
    handleMeaningsSave,
    handleReadingsSave,
    handleSemanticNotesSave,
    handleEtymologyNotesSave,
    handleEducationNotesSave,
    handlePersonalNotesSave,
    handleStrokeDiagramSave,
    handleStrokeAnimationSave
  }
}
