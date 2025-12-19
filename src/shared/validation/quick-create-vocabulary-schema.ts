/**
 * Quick-Create Vocabulary Schema
 *
 * Zod validation schema for quick-creating vocabulary with minimal fields.
 * Fields: word, kana (optional), short_meaning
 * Other fields can be added on the detail page.
 */

import { z } from 'zod'

export const quickCreateVocabularySchema = z.object({
  word: z.string().min(1, 'Word is required'),

  kana: z.string().optional(),

  shortMeaning: z.string().optional()
})

// Export inferred type
export type QuickCreateVocabularyData = z.infer<
  typeof quickCreateVocabularySchema
>
