/**
 * Kanji create-and-link handler for vocab detail kanji breakdown.
 */

import { blankToNull } from '@/shared/utils/text-utils';

import type { Kanji, useKanjiRepository } from '@/api/kanji';
import type { useVocabKanjiRepository } from '@/api/vocabulary';
import type { UseDatabaseReturn, useToast } from '@/shared/composables';
import type { QuickCreateKanjiData } from '@/shared/validation';
import type { Ref } from 'vue';

/**
 * Creates a handler that creates a new kanji and links it to the current vocabulary.
 *
 * @param deps - Vocab ID, reload function, kanji list ref, and repository instances
 * @returns Handler function that creates and links a kanji
 */
export function createKanjiCreateHandler(deps: {
  vocabId: Ref<number>;
  reloadBreakdown: () => void;
  allKanji: Ref<Kanji[]>;
  vocabKanjiRepo: ReturnType<typeof useVocabKanjiRepository>;
  kanjiRepo: ReturnType<typeof useKanjiRepository>;
  toast: ReturnType<typeof useToast>;
  transaction: UseDatabaseReturn['transaction'];
}): (data: QuickCreateKanjiData) => boolean {
  return (data: QuickCreateKanjiData): boolean => {
    try {
      deps.transaction(() => {
        const newKanji = deps.kanjiRepo.create({
          character: data.character,
          shortMeaning: blankToNull(data.shortMeaning),
          searchKeywords: blankToNull(data.searchKeywords),
        });
        deps.vocabKanjiRepo.create({
          vocabId: deps.vocabId.value,
          kanjiId: newKanji.id,
        });
      });
      deps.reloadBreakdown();
      deps.allKanji.value = deps.kanjiRepo.getAll();
      deps.toast.success('Kanji created and linked');
      return true;
    } catch (err) {
      deps.toast.error(err instanceof Error ? err.message : 'Failed to create and link kanji');
      return false;
    }
  };
}
