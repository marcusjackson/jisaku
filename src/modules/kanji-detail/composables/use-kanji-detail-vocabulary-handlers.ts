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
import type { Ref } from 'vue'

interface State {
  kanji: Ref<Kanji | null>
  vocabulary: Ref<VocabKanjiWithVocabulary[]>
}

// eslint-disable-next-line max-lines-per-function -- Handler collection composable
export function useKanjiDetailVocabularyHandlers(state: State) {
  const toast = useToast()
  const vocabularyRepository = useVocabularyRepository()
  const vocabKanjiRepository = useVocabKanjiRepository()

  /**
   * All available vocabulary (for search/link)
   */
  const allVocabulary = computed<VocabularyListItem[]>(() => {
    return vocabularyRepository.getAll().map((v) => ({
      linkId: 0, // Not used for all vocabulary list
      vocabularyId: v.id,
      word: v.word,
      kana: v.kana,
      shortMeaning: v.shortMeaning
    }))
  })

  /**
   * Linked vocabulary list (for display)
   */
  const vocabularyList = computed<VocabularyListItem[]>(() =>
    state.vocabulary.value.map((v) => ({
      linkId: v.vocabKanji.id,
      vocabularyId: v.vocabulary.id,
      word: v.vocabulary.word,
      kana: v.vocabulary.kana,
      shortMeaning: v.vocabulary.shortMeaning
    }))
  )

  /**
   * Refresh vocabulary list from database
   */
  function refreshVocabulary(): void {
    const kanjiVal = state.kanji.value
    if (!kanjiVal) return

    state.vocabulary.value = vocabKanjiRepository.getByKanjiIdWithVocabulary(
      kanjiVal.id
    )
  }

  /**
   * Link existing vocabulary to current kanji
   */
  function handleLink(vocabularyId: number): void {
    const kanjiVal = state.kanji.value
    if (!kanjiVal) {
      toast.error('No kanji selected')
      return
    }

    // Check if already linked
    const alreadyLinked = state.vocabulary.value.some(
      (v) => v.vocabulary.id === vocabularyId
    )
    if (alreadyLinked) {
      toast.error('This vocabulary is already linked to this kanji')
      return
    }

    try {
      vocabKanjiRepository.create({
        vocabId: vocabularyId,
        kanjiId: kanjiVal.id
      })
      refreshVocabulary()
      toast.success('Vocabulary linked successfully')
    } catch (error) {
      toast.error('Failed to link vocabulary')
      console.error('Link vocabulary error:', error)
    }
  }

  /**
   * Unlink vocabulary from current kanji
   */
  function handleUnlink(vocabularyId: number): void {
    const kanjiVal = state.kanji.value
    if (!kanjiVal) {
      toast.error('No kanji selected')
      return
    }

    const link = state.vocabulary.value.find(
      (v) => v.vocabulary.id === vocabularyId
    )
    if (!link) {
      toast.error('Vocabulary is not linked to this kanji')
      return
    }

    try {
      vocabKanjiRepository.remove(link.vocabKanji.id)
      refreshVocabulary()
      toast.success('Vocabulary unlinked successfully')
    } catch (error) {
      toast.error('Failed to unlink vocabulary')
      console.error('Unlink vocabulary error:', error)
    }
  }

  /**
   * Create new vocabulary and link to current kanji
   */
  function handleCreate(data: QuickCreateVocabularyData): void {
    const kanjiVal = state.kanji.value
    if (!kanjiVal) {
      toast.error('No kanji selected')
      return
    }

    try {
      // Create vocabulary
      const newVocabulary = vocabularyRepository.create({
        word: data.word,
        kana: data.kana,
        shortMeaning:
          data.shortMeaning && data.shortMeaning.trim() !== ''
            ? data.shortMeaning
            : null
      })

      // Link to kanji
      vocabKanjiRepository.create({
        vocabId: newVocabulary.id,
        kanjiId: kanjiVal.id
      })

      refreshVocabulary()
      toast.success(`Created and linked "${data.word}"`)
    } catch (error) {
      toast.error('Failed to create vocabulary')
      console.error('Create vocabulary error:', error)
    }
  }

  return {
    allVocabulary,
    vocabularyList,
    handleLink,
    handleUnlink,
    handleCreate,
    refreshVocabulary
  }
}
