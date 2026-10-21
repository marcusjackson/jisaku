/**
 * Vocab List Data Composable
 *
 * Handles data fetching for the vocabulary list.
 * Loads vocabulary list and kanji for filter dropdown.
 *
 * @module modules/vocab-list/composables
 */

import { ref } from 'vue';

import { useKanjiRepository } from '@/api/kanji';
import { useVocabularyRepository } from '@/api/vocabulary';

import { useToast } from '@/shared/composables';

import type { VocabListFilters } from '../vocab-list-types';
import type { Kanji } from '@/api/kanji';
import type { Vocabulary } from '@/api/vocabulary';
import type { Ref } from 'vue';

// ============================================================================
// Composable Interface
// ============================================================================

export interface UseVocabListDataReturn {
  vocabList: Ref<Vocabulary[]>;
  allKanji: Ref<Kanji[]>;
  fetchError: Ref<Error | null>;
  loadVocabulary: (filters: VocabListFilters) => void;
  loadReferenceData: () => void;
}

// ============================================================================
// Composable Implementation
// ============================================================================

/**
 * Fetches and manages data for the vocabulary list page.
 *
 * @returns Reactive state for vocab list data and load functions
 */
export function useVocabListData(): UseVocabListDataReturn {
  const vocabList = ref<Vocabulary[]>([]);
  const allKanji = ref<Kanji[]>([]);
  const fetchError = ref<Error | null>(null);
  const { error: showError } = useToast();

  function reportLoadError(err: unknown): void {
    fetchError.value = err instanceof Error ? err : new Error(String(err));
    showError(fetchError.value.message);
  }

  function loadVocabulary(filters: VocabListFilters): void {
    fetchError.value = null;
    try {
      const repo = useVocabularyRepository();
      vocabList.value = repo.search(filters);
    } catch (err) {
      reportLoadError(err);
    }
  }

  function loadReferenceData(): void {
    fetchError.value = null;
    try {
      const kanjiRepo = useKanjiRepository();
      allKanji.value = kanjiRepo.getAll();
    } catch (err) {
      reportLoadError(err);
    }
  }

  return {
    vocabList,
    allKanji,
    fetchError,
    loadVocabulary,
    loadReferenceData,
  };
}
