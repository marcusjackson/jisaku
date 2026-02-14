/**
 * use-kanji-detail-notes-handlers
 *
 * Handler functions for kanji notes and stroke image save operations.
 * Provides save handlers for all four note field types and stroke images.
 */

import { useKanjiRepository } from '@/api/kanji'

import { useToast } from '@/shared/composables'

import type { Kanji } from '@/api/kanji'
import type { Ref } from 'vue'

export interface KanjiDetailNotesHandlers {
  handleSemanticNotesSave: (value: string | null) => void
  handleEtymologyNotesSave: (value: string | null) => void
  handleEducationNotesSave: (value: string | null) => void
  handlePersonalNotesSave: (value: string | null) => void
  handleStrokeDiagramSave: (value: Uint8Array | null) => void
  handleStrokeAnimationSave: (value: Uint8Array | null) => void
}

type NoteField =
  | 'notesSemantic'
  | 'notesEtymology'
  | 'notesEducationMnemonics'
  | 'notesPersonal'
type StrokeField = 'strokeDiagramImage' | 'strokeGifImage'

export function useKanjiDetailNotesHandlers(
  kanji: Ref<Kanji | null>
): KanjiDetailNotesHandlers {
  const kanjiRepo = useKanjiRepository()
  const toast = useToast()

  function saveNote(field: NoteField, value: string | null, msg: string): void {
    if (!kanji.value) return
    try {
      kanji.value = kanjiRepo.updateField(kanji.value.id, field, value)
      toast.success(msg)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save notes')
    }
  }

  function saveStroke(
    field: StrokeField,
    value: Uint8Array | null,
    msg: string
  ): void {
    if (!kanji.value) return
    try {
      kanji.value = kanjiRepo.updateField(kanji.value.id, field, value)
      toast.success(msg)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save image')
    }
  }

  return {
    handleSemanticNotesSave: (v) => {
      saveNote('notesSemantic', v, 'Semantic notes saved')
    },
    handleEtymologyNotesSave: (v) => {
      saveNote('notesEtymology', v, 'Etymology notes saved')
    },
    handleEducationNotesSave: (v) => {
      saveNote('notesEducationMnemonics', v, 'Education notes saved')
    },
    handlePersonalNotesSave: (v) => {
      saveNote('notesPersonal', v, 'Personal notes saved')
    },
    handleStrokeDiagramSave: (v) => {
      saveStroke('strokeDiagramImage', v, 'Stroke diagram saved')
    },
    handleStrokeAnimationSave: (v) => {
      saveStroke('strokeGifImage', v, 'Stroke animation saved')
    }
  }
}
