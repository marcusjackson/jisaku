/**
 * Use Kanji Detail Vocabulary Handlers
 *
 * Handles link/unlink/create operations for vocabulary section.
 *
 * @module modules/kanji-detail
 */

import { computed, ref } from 'vue';

import { useVocabKanjiRepository, useVocabularyRepository } from '@/api/vocabulary';

import { useDatabase } from '@/shared/composables/use-database';
import { useToast } from '@/shared/composables/use-toast';

import { createVocabularyAndLink } from './use-kanji-detail-vocabulary-create-handler';

import type { QuickCreateVocabularyData, VocabularyListItem } from '../kanji-detail-types';
import type { Kanji } from '@/api/kanji/kanji-types';
import type { VocabKanjiWithVocabulary } from '@/api/vocabulary';
import type { ComputedRef, Ref } from 'vue';

// ============================================================================
// Types
// ============================================================================

interface State {
  kanji: Ref<Kanji | null>;
  vocabulary: Ref<VocabKanjiWithVocabulary[]>;
}

type VocabRepo = ReturnType<typeof useVocabularyRepository>;

interface VocabCtx {
  state: State;
  vocabRepo: VocabRepo;
  vocabKanjiRepo: ReturnType<typeof useVocabKanjiRepository>;
  toast: ReturnType<typeof useToast>;
  refresh: () => void;
}

interface UseKanjiDetailVocabularyHandlersReturn {
  allVocabulary: ComputedRef<VocabularyListItem[]>;
  vocabularyList: ComputedRef<VocabularyListItem[]>;
  handleLink: (vocabularyId: number) => boolean;
  handleUnlink: (vocabularyId: number) => void;
  handleCreate: (data: QuickCreateVocabularyData) => boolean;
  refreshVocabulary: () => void;
}

// ============================================================================
// Module-scope implementation functions
// ============================================================================

function doHandleLink(vocabularyId: number, ctx: VocabCtx): boolean {
  const kanjiVal = ctx.state.kanji.value;
  if (!kanjiVal) {
    ctx.toast.error('No kanji selected');
    return false;
  }
  const alreadyLinked = ctx.state.vocabulary.value.some((v) => v.vocabulary.id === vocabularyId);
  if (alreadyLinked) {
    ctx.toast.error('This vocabulary is already linked to this kanji');
    return false;
  }
  try {
    ctx.vocabKanjiRepo.create({ vocabId: vocabularyId, kanjiId: kanjiVal.id });
    ctx.refresh();
    ctx.toast.success('Vocabulary linked successfully');
    return true;
  } catch {
    ctx.toast.error('Failed to link vocabulary');
    return false;
  }
}

function doHandleUnlink(vocabularyId: number, ctx: VocabCtx): void {
  if (!ctx.state.kanji.value) {
    ctx.toast.error('No kanji selected');
    return;
  }
  const link = ctx.state.vocabulary.value.find((v) => v.vocabulary.id === vocabularyId);
  if (!link) {
    ctx.toast.error('Vocabulary is not linked to this kanji');
    return;
  }
  try {
    ctx.vocabKanjiRepo.remove(link.vocabKanji.id);
    ctx.refresh();
    ctx.toast.success('Vocabulary unlinked successfully');
  } catch {
    ctx.toast.error('Failed to unlink vocabulary');
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
  const toast = useToast();
  const vocabRepo = useVocabularyRepository();
  const vocabKanjiRepo = useVocabKanjiRepository();

  // The repository read is not reactive, so the search list re-reads it whenever
  // the linked list is refreshed (after a link, unlink or quick-create).
  const vocabularyVersion = ref(0);

  const ctx: VocabCtx = {
    state,
    vocabRepo,
    vocabKanjiRepo,
    toast,
    refresh: () => {
      const k = state.kanji.value;
      if (k) state.vocabulary.value = vocabKanjiRepo.getByKanjiIdWithVocabulary(k.id);
      vocabularyVersion.value++;
    },
  };

  const allVocabulary = computed<VocabularyListItem[]>(() =>
    (vocabularyVersion.value >= 0 ? vocabRepo.getAll() : []).map((v) => ({
      linkId: 0,
      vocabularyId: v.id,
      word: v.word,
      kana: v.kana,
      shortMeaning: v.shortMeaning,
    }))
  );

  const vocabularyList = computed<VocabularyListItem[]>(() =>
    state.vocabulary.value.map((v) => ({
      linkId: v.vocabKanji.id,
      vocabularyId: v.vocabulary.id,
      word: v.vocabulary.word,
      kana: v.vocabulary.kana,
      shortMeaning: v.vocabulary.shortMeaning,
    }))
  );

  return {
    allVocabulary,
    vocabularyList,
    handleLink: (id) => doHandleLink(id, ctx),
    handleUnlink: (id) => {
      doHandleUnlink(id, ctx);
    },
    handleCreate: (data) => createVocabularyAndLink(data, ctx, useDatabase().transaction),
    refreshVocabulary: ctx.refresh,
  };
}
