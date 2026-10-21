/**
 * use-kanji-detail-handlers
 *
 * Handler functions for kanji detail page actions.
 * Extracted from KanjiDetailRoot to reduce component size.
 */

import { useRouter } from 'vue-router';

import { useKanjiRepository } from '@/api/kanji';

import { useToast } from '@/shared/composables';

import { ROUTES } from '@/router/routes';

import type { HeadlineSaveData } from '../kanji-detail-types';
import type { Kanji } from '@/api/kanji';
import type { Ref } from 'vue';

export interface UseKanjiDetailHandlersReturn {
  handleHeadlineSave: (data: HeadlineSaveData) => boolean;
  handleDelete: () => void;
}

/**
 * Provides headline save and delete handlers for the kanji detail root component.
 * The headline save returns whether it succeeded, so its dialog can stay open on failure.
 *
 * @param kanji - Reactive reference to the current kanji
 * @param isDeleting - Flag indicating a deletion is in progress
 * @returns Handlers for headline save and deletion
 */
export function useKanjiDetailHandlers(
  kanji: Ref<Kanji | null>,
  isDeleting: Ref<boolean>
): UseKanjiDetailHandlersReturn {
  const router = useRouter();
  const toast = useToast();
  const kanjiRepo = useKanjiRepository();

  function handleHeadlineSave(data: HeadlineSaveData): boolean {
    if (!kanji.value) return false;

    try {
      kanjiRepo.update(kanji.value.id, data);
      kanji.value = { ...kanji.value, ...data };
      toast.success('Kanji updated successfully');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update kanji');
      return false;
    }
  }

  function handleDelete(): void {
    if (!kanji.value) return;

    isDeleting.value = true;
    try {
      kanjiRepo.remove(kanji.value.id);
      toast.success('Kanji deleted successfully');
      void router.push({
        path: ROUTES.KANJI_LIST,
        query: router.currentRoute.value.query,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete kanji');
    } finally {
      isDeleting.value = false;
    }
  }

  return {
    handleHeadlineSave,
    handleDelete,
  };
}
