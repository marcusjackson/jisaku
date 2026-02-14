/**
 * Vocab List Data Composable
 *
 * Handles data fetching for the vocabulary list.
 * Loads vocabulary list and kanji for filter dropdown.
 *
 * @module modules/vocab-list/composables
 */

import { ref } from 'vue'

import { useKanjiRepository } from '@/api/kanji'
import { useVocabularyRepository } from '@/api/vocabulary'

import type { VocabListFilters } from '../vocab-list-types'
import type { Kanji } from '@/api/kanji'
import type { Vocabulary } from '@/api/vocabulary'
import type { Ref } from 'vue'

// ============================================================================
// Composable Interface
// ============================================================================

export interface UseVocabListData {
  vocabList: Ref<Vocabulary[]>
  allKanji: Ref<Kanji[]>
  fetchError: Ref<Error | null>
  loadVocabulary: (filters: VocabListFilters) => void
  loadReferenceData: () => void
}

// ============================================================================
// Composable Implementation
// ============================================================================

export function useVocabListData(): UseVocabListData {
  const vocabList = ref<Vocabulary[]>([])
  const allKanji = ref<Kanji[]>([])
  const fetchError = ref<Error | null>(null)

  function loadVocabulary(filters: VocabListFilters): void {
    try {
      const repo = useVocabularyRepository()
      vocabList.value = repo.search(filters)
    } catch (err) {
      fetchError.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  function loadReferenceData(): void {
    try {
      const kanjiRepo = useKanjiRepository()
      allKanji.value = kanjiRepo.getAll()
    } catch (err) {
      fetchError.value = err instanceof Error ? err : new Error(String(err))
    }
  }

  return {
    vocabList,
    allKanji,
    fetchError,
    loadVocabulary,
    loadReferenceData
  }
}
