/** use-vocab-detail-data - Composable for loading and managing vocab detail data. */
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useKanjiRepository } from '@/api/kanji'
import {
  useVocabKanjiRepository,
  useVocabularyRepository
} from '@/api/vocabulary'

import type { Kanji } from '@/api/kanji'
import type { VocabKanjiWithKanji, Vocabulary } from '@/api/vocabulary'
import type { ComputedRef, Ref } from 'vue'

interface VocabDetailDataReturn {
  vocab: Ref<Vocabulary | null>
  kanjiBreakdown: Ref<VocabKanjiWithKanji[]>
  allKanji: Ref<Kanji[]>
  isLoading: Ref<boolean>
  loadError: Ref<string | null>
  vocabId: ComputedRef<number>
}

function loadVocabData(
  vocabId: number,
  state: {
    vocab: Ref<Vocabulary | null>
    kanjiBreakdown: Ref<VocabKanjiWithKanji[]>
    allKanji: Ref<Kanji[]>
    isLoading: Ref<boolean>
    loadError: Ref<string | null>
  },
  repos: {
    vocabRepo: ReturnType<typeof useVocabularyRepository>
    vocabKanjiRepo: ReturnType<typeof useVocabKanjiRepository>
    kanjiRepo: ReturnType<typeof useKanjiRepository>
  }
): void {
  state.isLoading.value = true
  state.loadError.value = null
  try {
    state.vocab.value = repos.vocabRepo.getById(vocabId)
    if (!state.vocab.value) {
      state.loadError.value = `Vocabulary with ID ${String(vocabId)} not found`
      return
    }
    state.kanjiBreakdown.value =
      repos.vocabKanjiRepo.getByVocabIdWithKanji(vocabId)
    state.allKanji.value = repos.kanjiRepo.getAll()
  } catch (err) {
    state.loadError.value =
      err instanceof Error ? err.message : 'Failed to load vocabulary'
  } finally {
    state.isLoading.value = false
  }
}

/**
 * Loads and manages all reactive state for the vocab detail page.
 *
 * @returns Reactive state for the vocab detail page (does not include repositories)
 */
export function useVocabDetailData(): VocabDetailDataReturn {
  const route = useRoute()
  const vocabRepo = useVocabularyRepository()
  const vocabKanjiRepo = useVocabKanjiRepository()
  const kanjiRepo = useKanjiRepository()

  const vocab = ref<Vocabulary | null>(null)
  const kanjiBreakdown = ref<VocabKanjiWithKanji[]>([])
  const allKanji = ref<Kanji[]>([])
  const isLoading = ref(true)
  const loadError = ref<string | null>(null)

  const vocabId = computed(() => Number(route.params['id']))

  watch(
    vocabId,
    () => {
      loadVocabData(
        vocabId.value,
        { vocab, kanjiBreakdown, allKanji, isLoading, loadError },
        { vocabRepo, vocabKanjiRepo, kanjiRepo }
      )
    },
    { immediate: true }
  )

  return { vocab, kanjiBreakdown, allKanji, isLoading, loadError, vocabId }
}
