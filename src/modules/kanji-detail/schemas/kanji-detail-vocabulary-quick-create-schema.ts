/**
 * Kanji Detail Vocabulary Quick Create Schema
 *
 * Zod validation schema for quick-creating vocabulary from kanji detail page.
 *
 * @module modules/kanji-detail
 */

import { z } from 'zod'

export const kanjiDetailVocabularyQuickCreateSchema = z.object({
  word: z
    .string()
    .min(1, 'Word is required')
    .max(100, 'Word must be 100 characters or less'),
  kana: z
    .string()
    .max(200, 'Kana must be 200 characters or less')
    .optional()
    .transform((val) => val ?? ''),
  shortMeaning: z
    .string()
    .max(500, 'Short meaning must be 500 characters or less')
    .optional()
    .transform((val) => (val?.trim() === '' ? '' : (val ?? '')))
})

export type KanjiDetailVocabularyQuickCreateData = z.infer<
  typeof kanjiDetailVocabularyQuickCreateSchema
>
