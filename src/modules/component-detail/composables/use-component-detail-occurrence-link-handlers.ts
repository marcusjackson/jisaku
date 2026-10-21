/**
 * Use Component Detail Occurrence Link Handlers
 *
 * Handles the "link" operations for occurrences:
 * - add existing kanji → occurrence (handleOccurrenceAdd)
 * - create new kanji then link (handleOccurrenceCreate)
 *
 * Extracted from use-component-detail-occurrence-handlers.ts
 * to stay within file size limits.
 */

import { useKanjiRepository } from '@/api/kanji';

import { useDatabase, useToast } from '@/shared/composables';
import { blankToNull } from '@/shared/utils/text-utils';

import type { useComponentOccurrenceRepository } from '@/api/component';
import type { Kanji } from '@/api/kanji';
import type { UseDatabaseReturn } from '@/shared/composables';
import type { QuickCreateKanjiData } from '@/shared/validation';
import type { Ref } from 'vue';

interface UseComponentDetailOccurrenceLinkHandlersDeps {
  componentId: Ref<number | null>;
  kanjiOptions: Ref<Kanji[]>;
  reloadOccurrences: () => void;
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>;
}

interface UseComponentDetailOccurrenceLinkHandlersReturn {
  handleOccurrenceAdd: (kanjiId: number) => boolean;
  handleOccurrenceCreate: (data: QuickCreateKanjiData) => boolean;
}

function createAddHandler(params: {
  componentId: Ref<number | null>;
  reloadOccurrences: () => void;
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>;
  toast: ReturnType<typeof useToast>;
}): (kanjiId: number) => boolean {
  const { componentId, occurrenceRepo, reloadOccurrences, toast } = params;
  return (kanjiId: number): boolean => {
    if (componentId.value === null) return false;
    try {
      occurrenceRepo.create({ kanjiId, componentId: componentId.value });
      reloadOccurrences();
      toast.success('Kanji linked');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to link kanji');
      return false;
    }
  };
}

function createCreateAndLinkHandler(params: {
  componentId: Ref<number | null>;
  kanjiOptions: Ref<Kanji[]>;
  reloadOccurrences: () => void;
  occurrenceRepo: ReturnType<typeof useComponentOccurrenceRepository>;
  kanjiRepo: ReturnType<typeof useKanjiRepository>;
  toast: ReturnType<typeof useToast>;
  transaction: UseDatabaseReturn['transaction'];
}): (data: QuickCreateKanjiData) => boolean {
  const {
    componentId,
    kanjiOptions,
    kanjiRepo,
    occurrenceRepo,
    reloadOccurrences,
    toast,
    transaction,
  } = params;
  return (data: QuickCreateKanjiData): boolean => {
    const id = componentId.value;
    if (id === null) return false;
    const character = data.character.trim();
    try {
      if (kanjiRepo.getByCharacter(character)) {
        toast.error('This kanji is already registered');
        return false;
      }
      transaction(() => {
        const newKanji = kanjiRepo.create({
          character,
          shortMeaning: blankToNull(data.shortMeaning),
          searchKeywords: blankToNull(data.searchKeywords),
        });
        occurrenceRepo.create({
          kanjiId: newKanji.id,
          componentId: id,
        });
      });
      reloadOccurrences();
      kanjiOptions.value = kanjiRepo.getAll();
      toast.success('Kanji created and linked');
      return true;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create and link kanji');
      return false;
    }
  };
}

/**
 * Provides handlers for linking kanji to the component: add an existing kanji, or create one and link it.
 *
 * @param deps - Component ID, kanji options, occurrence reload callback, and occurrence repository
 * @returns Handlers for linking an existing kanji and for creating then linking a new one
 */
export function useComponentDetailOccurrenceLinkHandlers(
  deps: UseComponentDetailOccurrenceLinkHandlersDeps
): UseComponentDetailOccurrenceLinkHandlersReturn {
  const kanjiRepo = useKanjiRepository();
  const toast = useToast();
  return {
    handleOccurrenceAdd: createAddHandler({
      componentId: deps.componentId,
      reloadOccurrences: deps.reloadOccurrences,
      occurrenceRepo: deps.occurrenceRepo,
      toast,
    }),
    handleOccurrenceCreate: createCreateAndLinkHandler({
      componentId: deps.componentId,
      kanjiOptions: deps.kanjiOptions,
      reloadOccurrences: deps.reloadOccurrences,
      occurrenceRepo: deps.occurrenceRepo,
      kanjiRepo,
      toast,
      transaction: useDatabase().transaction,
    }),
  };
}
