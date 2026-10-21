/**
 * Use Vocab Detail Root Handlers
 *
 * Handles headline and basic info save operations for the vocab detail root
 * component, plus vocabulary deletion.
 *
 * @param deps - Vocab ref and isDeleting flag
 * @returns Handlers for save and delete operations
 */

import { useVocabularyRepository } from '@/api/vocabulary';

import { useToast } from '@/shared/composables';

import { ROUTES } from '@/router/routes';

import type { BasicInfoSaveData, HeadlineSaveData } from '../vocab-detail-types';
import type { UpdateVocabularyInput, Vocabulary } from '@/api/vocabulary';
import type { Ref } from 'vue';
import type { Router } from 'vue-router';

/** Dependencies for the composable */
interface UseVocabDetailRootHandlersDeps {
  vocab: Ref<Vocabulary | null>;
  isDeleting: Ref<boolean>;
  router: Router;
}

/** Return type of the composable */
export interface UseVocabDetailRootHandlersReturn {
  handleHeadlineSave: (data: HeadlineSaveData) => boolean;
  handleBasicInfoSave: (data: BasicInfoSaveData) => boolean;
  handleDelete: () => void;
}

/**
 * Provides save and delete handlers for the vocab detail root component.
 *
 * @param deps - Vocab ref and isDeleting flag
 * @returns Handlers for headline save, basic info save, and deletion
 */
export function useVocabDetailRootHandlers(
  deps: UseVocabDetailRootHandlersDeps
): UseVocabDetailRootHandlersReturn {
  const { isDeleting, router, vocab } = deps;
  const vocabRepo = useVocabularyRepository();
  const toast = useToast();

  function applyVocabUpdate(data: UpdateVocabularyInput): boolean {
    if (!vocab.value) return false;
    try {
      vocab.value = vocabRepo.update(vocab.value.id, data);
      toast.success('Vocabulary updated successfully');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update vocabulary');
      return false;
    }
  }

  function handleHeadlineSave(data: HeadlineSaveData): boolean {
    return applyVocabUpdate(data);
  }

  function handleBasicInfoSave(data: BasicInfoSaveData): boolean {
    return applyVocabUpdate(data);
  }

  function handleDelete(): void {
    if (!vocab.value) return;
    isDeleting.value = true;
    try {
      vocabRepo.remove(vocab.value.id);
      toast.success('Vocabulary deleted successfully');
      void router.push({
        path: ROUTES.VOCABULARY_LIST,
        query: router.currentRoute.value.query,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete vocabulary');
    } finally {
      isDeleting.value = false;
    }
  }

  return {
    handleBasicInfoSave,
    handleDelete,
    handleHeadlineSave,
  };
}
