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

interface AllHandlers {
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

export function useKanjiDetailAllHandlers(
  kanji: Ref<Kanji | null>,
  saveBasicInfo: (data: BasicInfoSaveData) => void,
  handleSaveReadings: (data: ReadingsSaveData) => void,
  handleSaveMeanings: (data: MeaningsSaveData) => void
): AllHandlers {
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
