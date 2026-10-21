/**
 * Use Kanji Detail Vocabulary Create Handler
 *
 * Quick-creates a vocabulary entry and links it to the current kanji.
 *
 * @module modules/kanji-detail
 */

import { blankToNull } from '@/shared/utils/text-utils';

import type { QuickCreateVocabularyData } from '../kanji-detail-types';
import type { Kanji } from '@/api/kanji/kanji-types';
import type { useVocabKanjiRepository, useVocabularyRepository } from '@/api/vocabulary';
import type { UseDatabaseReturn } from '@/shared/composables/use-database';
import type { useToast } from '@/shared/composables/use-toast';
import type { Ref } from 'vue';

interface CreateCtx {
  state: { kanji: Ref<Kanji | null> };
  vocabRepo: ReturnType<typeof useVocabularyRepository>;
  vocabKanjiRepo: ReturnType<typeof useVocabKanjiRepository>;
  toast: ReturnType<typeof useToast>;
  refresh: () => void;
}

/**
 * Create the vocabulary and its link in one transaction, so a failed link
 * leaves no orphan vocabulary row behind.
 */
export function createVocabularyAndLink(
  data: QuickCreateVocabularyData,
  ctx: CreateCtx,
  transaction: UseDatabaseReturn['transaction']
): boolean {
  const kanjiVal = ctx.state.kanji.value;
  if (!kanjiVal) {
    ctx.toast.error('No kanji selected');
    return false;
  }
  try {
    transaction(() => {
      const newVocabulary = ctx.vocabRepo.create({
        word: data.word,
        kana: data.kana,
        shortMeaning: blankToNull(data.shortMeaning),
      });
      ctx.vocabKanjiRepo.create({
        vocabId: newVocabulary.id,
        kanjiId: kanjiVal.id,
      });
    });
    ctx.refresh();
    ctx.toast.success(`Created and linked "${data.word}"`);
    return true;
  } catch {
    ctx.toast.error('Failed to create vocabulary');
    return false;
  }
}
