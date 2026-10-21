/**
 * createVocabularyAndLink tests: one transaction, toasts, empty meaning
 */

import { ref } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createVocabularyAndLink } from './use-kanji-detail-vocabulary-create-handler';

import type { Kanji } from '@/api/kanji/kanji-types';

type Ctx = Parameters<typeof createVocabularyAndLink>[1];

function createCtx(kanji: Kanji | null): {
  ctx: Ctx;
  vocabCreate: ReturnType<typeof vi.fn>;
  linkCreate: ReturnType<typeof vi.fn>;
  toast: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn> };
  refresh: ReturnType<typeof vi.fn>;
} {
  const vocabCreate = vi.fn(() => ({ id: 7 }));
  const linkCreate = vi.fn();
  const toast = { success: vi.fn(), error: vi.fn() };
  const refresh = vi.fn();
  const ctx = {
    state: { kanji: ref(kanji) },
    vocabRepo: { create: vocabCreate },
    vocabKanjiRepo: { create: linkCreate },
    toast,
    refresh,
  } as unknown as Ctx;
  return { ctx, vocabCreate, linkCreate, toast, refresh };
}

const kanji = { id: 3, character: '水' } as Kanji;
let transactionCalls = 0;
function runNow<T>(fn: () => T): T {
  transactionCalls++;
  return fn();
}

describe('createVocabularyAndLink', () => {
  beforeEach(() => {
    transactionCalls = 0;
  });

  it('creates and links inside one transaction', () => {
    const { ctx, linkCreate, refresh, toast, vocabCreate } = createCtx(kanji);

    createVocabularyAndLink(
      { word: '水道', kana: 'すいどう', shortMeaning: 'water supply' },
      ctx,
      runNow
    );

    expect(transactionCalls).toBe(1);
    expect(vocabCreate).toHaveBeenCalledWith({
      word: '水道',
      kana: 'すいどう',
      shortMeaning: 'water supply',
    });
    expect(linkCreate).toHaveBeenCalledWith({ vocabId: 7, kanjiId: 3 });
    expect(refresh).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  it('stores a blank short meaning as null', () => {
    const { ctx, vocabCreate } = createCtx(kanji);

    createVocabularyAndLink({ word: '水', kana: 'みず', shortMeaning: '  ' }, ctx, runNow);

    expect(vocabCreate).toHaveBeenCalledWith(expect.objectContaining({ shortMeaning: null }));
  });

  it('shows an error and skips the refresh when the link fails', () => {
    const { ctx, linkCreate, refresh, toast } = createCtx(kanji);
    linkCreate.mockImplementationOnce(() => {
      throw new Error('link failed');
    });

    createVocabularyAndLink({ word: '水', kana: 'みず' }, ctx, runNow);

    expect(toast.error).toHaveBeenCalledWith('Failed to create vocabulary');
    expect(refresh).not.toHaveBeenCalled();
  });

  it('does nothing but warn when no kanji is selected', () => {
    const { ctx, toast, vocabCreate } = createCtx(null);

    createVocabularyAndLink({ word: '水', kana: 'みず' }, ctx, runNow);

    expect(vocabCreate).not.toHaveBeenCalled();
    expect(transactionCalls).toBe(0);
    expect(toast.error).toHaveBeenCalledWith('No kanji selected');
  });
});
