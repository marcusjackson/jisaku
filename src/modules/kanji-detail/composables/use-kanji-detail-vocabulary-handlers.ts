/**
 * Use Kanji Detail Vocabulary Handlers
 *
 * Handles link/unlink/create operations for vocabulary section.
 *
 * @module modules/kanji-detail
 */

import { computed } from 'vue'

import {
  useVocabKanjiRepository,
  useVocabularyRepository
} from '@/api/vocabulary'

import { useToast } from '@/shared/composables/use-toast'

import type {
  QuickCreateVocabularyData,
  VocabularyListItem
} from '../kanji-detail-types'
import type { Kanji } from '@/api/kanji/kanji-types'
import type { VocabKanjiWithVocabulary } from '@/api/vocabulary'
import type { ComputedRef, Ref } from 'vue'

// ============================================================================
// Types
// ============================================================================

interface State {
  kanji: Ref<Kanji | null>
  vocabulary: Ref<VocabKanjiWithVocabulary[]>
}

type VocabRepo = ReturnType<typeof useVocabularyRepository>

interface VocabCtx {
  state: State
  vocabRepo: VocabRepo
  vocabKanjiRepo: ReturnType<typeof useVocabKanjiRepository>
  toast: ReturnType<typeof useToast>
  refresh: () => void
}

interface UseKanjiDetailVocabularyHandlersReturn {
  allVocabulary: ComputedRef<VocabularyListItem[]>
  vocabularyList: ComputedRef<VocabularyListItem[]>
  handleLink: (vocabularyId: number) => void
  handleUnlink: (vocabularyId: number) => void
  handleCreate: (data: QuickCreateVocabularyData) => void
  refreshVocabulary: () => void
}

// ============================================================================
// Module-scope implementation functions
// ============================================================================

function doHandleLinkAction(
  vocabularyId: number,
  isLink: boolean,
  ctx: VocabCtx
): void {
  const kanjiVal = ctx.state.kanji.value
  if (!kanjiVal) {
    ctx.toast.error('No kanji selected')
    return
  }
  if (isLink) {
    const alreadyLinked = ctx.state.vocabulary.value.some(
      (v) => v.vocabulary.id === vocabularyId
    )
    if (alreadyLinked) {
      ctx.toast.error('This vocabulary is already linked to this kanji')
      return
    }
    try {
      ctx.vocabKanjiRepo.create({ vocabId: vocabularyId, kanjiId: kanjiVal.id })
      ctx.refresh()
      ctx.toast.success('Vocabulary linked successfully')
    } catch {
      ctx.toast.error('Failed to link vocabulary')
    }
  } else {
    const link = ctx.state.vocabulary.value.find(
      (v) => v.vocabulary.id === vocabularyId
    )
    if (!link) {
      ctx.toast.error('Vocabulary is not linked to this kanji')
      return
    }
    try {
      ctx.vocabKanjiRepo.remove(link.vocabKanji.id)
      ctx.refresh()
      ctx.toast.success('Vocabulary unlinked successfully')
    } catch {
      ctx.toast.error('Failed to unlink vocabulary')
    }
  }
}

function doHandleCreate(data: QuickCreateVocabularyData, ctx: VocabCtx): void {
  const kanjiVal = ctx.state.kanji.value
  if (!kanjiVal) {
    ctx.toast.error('No kanji selected')
    return
  }
  try {
    const newVocabulary = ctx.vocabRepo.create({
      word: data.word,
      kana: data.kana,
      shortMeaning:
        data.shortMeaning && data.shortMeaning.trim() !== ''
          ? data.shortMeaning
          : null
    })
    ctx.vocabKanjiRepo.create({
      vocabId: newVocabulary.id,
      kanjiId: kanjiVal.id
    })
    ctx.refresh()
    ctx.toast.success(`Created and linked "${data.word}"`)
  } catch {
    ctx.toast.error('Failed to create vocabulary')
  }
}

// ============================================================================
// Composable
// ============================================================================

/**
 * Provides handlers for linking, unlinking, and creating vocabulary in the
 * kanji detail section.
 *
 * @param state - Reactive kanji detail state (kanji + vocabulary refs)
 * @returns Handlers and computed lists for vocabulary management
 */
export function useKanjiDetailVocabularyHandlers(
  state: State
): UseKanjiDetailVocabularyHandlersReturn {
  const toast = useToast()
  const vocabRepo = useVocabularyRepository()
  const vocabKanjiRepo = useVocabKanjiRepository()

  const ctx: VocabCtx = {
    state,
    vocabRepo,
    vocabKanjiRepo,
    toast,
    refresh: () => {
      const k = state.kanji.value
      if (k)
        state.vocabulary.value = vocabKanjiRepo.getByKanjiIdWithVocabulary(k.id)
    }
  }

  const allVocabulary = computed<VocabularyListItem[]>(() =>
    vocabRepo.getAll().map((v) => ({
      linkId: 0,
      vocabularyId: v.id,
      word: v.word,
      kana: v.kana,
      shortMeaning: v.shortMeaning
    }))
  )

  const vocabularyList = computed<VocabularyListItem[]>(() =>
    state.vocabulary.value.map((v) => ({
      linkId: v.vocabKanji.id,
      vocabularyId: v.vocabulary.id,
      word: v.vocabulary.word,
      kana: v.vocabulary.kana,
      shortMeaning: v.vocabulary.shortMeaning
    }))
  )

  return {
    allVocabulary,
    vocabularyList,
    handleLink: (id) => {
      doHandleLinkAction(id, true, ctx)
    },
    handleUnlink: (id) => {
      doHandleLinkAction(id, false, ctx)
    },
    handleCreate: (data) => {
      doHandleCreate(data, ctx)
    },
    refreshVocabulary: ctx.refresh
  }
}
