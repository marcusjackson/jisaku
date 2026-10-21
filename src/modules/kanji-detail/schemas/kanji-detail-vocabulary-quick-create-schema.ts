/**
 * Kanji Detail Vocabulary Quick Create Schema
 *
 * Zod validation schema for quick-creating vocabulary from kanji detail page.
 *
 * @module modules/kanji-detail
 */

import { z } from 'zod';

export const kanjiDetailVocabularyQuickCreateSchema = z.object({
  word: z
    .string()
    .trim()
    .min(1, 'Word is required')
    .max(100, 'Word must be 100 characters or less'),
  kana: z
    .string()
    .trim()
    .max(100, 'Kana must be 100 characters or less')
    .optional()
    .transform((val) => val ?? ''),
  shortMeaning: z
    .string()
    .trim()
    .max(100, 'Short meaning must be 100 characters or less')
    .optional()
    .transform((val) => val ?? ''),
});

export type KanjiDetailVocabularyQuickCreateData = z.infer<
  typeof kanjiDetailVocabularyQuickCreateSchema
>;
