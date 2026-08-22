/**
 * Use Vocab Detail Kanji Breakdown Handlers
 *
 * Handles kanji breakdown CRUD and reorder operations for the vocab detail page.
 */

import { useKanjiRepository } from '@/api/kanji'
import { useVocabKanjiRepository } from '@/api/vocabulary'

import { useToast } from '@/shared/composables'

import { createKanjiCreateHandler } from './use-vocab-detail-kanji-create-handler'

import type { Kanji } from '@/api/kanji'
import type { VocabKanjiWithKanji } from '@/api/vocabulary'
import type { QuickCreateKanjiData } from '@/shared/validation'
import type { Ref } from 'vue'

/** Dependencies for the composable */
interface UseVocabDetailKanjiBreakdownHandlersDeps {
  /** Vocabulary ID ref */
  vocabId: Ref<number>
  /** Kanji breakdown list ref to update */
  kanjiBreakdown: Ref<VocabKanjiWithKanji[]>
  /** All kanji ref to update after creating new kanji */
  allKanji: Ref<Kanji[]>
}

/** Return type of the composable */
interface UseVocabDetailKanjiBreakdownHandlersReturn {
  handleAdd: (kanjiId: number) => void
  handleCreate: (data: QuickCreateKanjiData) => void
  handleUpdateNotes: (id: number, notes: string | null) => void
  handleReorder: (ids: number[]) => void
  handleRemove: (id: number) => void
}

// Helper to reload breakdown from repository
function createBreakdownReloader(
  vocabId: Ref<number>,
  kanjiBreakdown: Ref<VocabKanjiWithKanji[]>,
  repo: ReturnType<typeof useVocabKanjiRepository>
) {
  return (): void => {
    kanjiBreakdown.value = repo.getByVocabIdWithKanji(vocabId.value)
  }
}

// Helper to create add handler
function createAddHandler(
  vocabId: Ref<number>,
  reloadBreakdown: () => void,
  repo: ReturnType<typeof useVocabKanjiRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (kanjiId: number): void => {
    try {
      repo.create({ vocabId: vocabId.value, kanjiId })
      reloadBreakdown()
      toast.success('Kanji linked')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to link kanji')
    }
  }
}

// Helper to create update-notes handler
function createUpdateNotesHandler(
  reloadBreakdown: () => void,
  repo: ReturnType<typeof useVocabKanjiRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (id: number, notes: string | null): void => {
    try {
      repo.update(id, { analysisNotes: notes })
      reloadBreakdown()
      toast.success('Notes updated')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update notes')
    }
  }
}

// Helper to create reorder handler
function createReorderHandler(
  reloadBreakdown: () => void,
  repo: ReturnType<typeof useVocabKanjiRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (ids: number[]): void => {
    try {
      repo.reorder(ids)
      reloadBreakdown()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to reorder breakdown'
      )
    }
  }
}

// Helper to create remove handler
function createRemoveHandler(
  reloadBreakdown: () => void,
  repo: ReturnType<typeof useVocabKanjiRepository>,
  toast: ReturnType<typeof useToast>
) {
  return (id: number): void => {
    try {
      repo.remove(id)
      reloadBreakdown()
      toast.success('Kanji unlinked')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to unlink kanji')
    }
  }
}

/**
 * Composable for kanji breakdown CRUD handlers in vocab detail.
 *
 * Follows the pattern from use-component-detail-occurrence-handlers.
 */
export function useVocabDetailKanjiBreakdownHandlers(
  deps: UseVocabDetailKanjiBreakdownHandlersDeps
): UseVocabDetailKanjiBreakdownHandlersReturn {
  const vocabKanjiRepo = useVocabKanjiRepository()
  const kanjiRepo = useKanjiRepository()
  const toast = useToast()

  const reloadBreakdown = createBreakdownReloader(
    deps.vocabId,
    deps.kanjiBreakdown,
    vocabKanjiRepo
  )

  return {
    handleAdd: createAddHandler(
      deps.vocabId,
      reloadBreakdown,
      vocabKanjiRepo,
      toast
    ),
    handleCreate: createKanjiCreateHandler({
      vocabId: deps.vocabId,
      reloadBreakdown,
      allKanji: deps.allKanji,
      vocabKanjiRepo,
      kanjiRepo,
      toast
    }),
    handleUpdateNotes: createUpdateNotesHandler(
      reloadBreakdown,
      vocabKanjiRepo,
      toast
    ),
    handleReorder: createReorderHandler(reloadBreakdown, vocabKanjiRepo, toast),
    handleRemove: createRemoveHandler(reloadBreakdown, vocabKanjiRepo, toast)
  }
}
