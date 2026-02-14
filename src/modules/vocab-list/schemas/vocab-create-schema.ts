/**
 * Vocab Create Schema
 *
 * Zod validation schema for the create vocabulary dialog.
 *
 * @module modules/vocab-list
 */

import { z } from 'zod'

export const vocabCreateSchema = z.object({
  word: z
    .string()
    .min(1, 'Word is required')
    .max(100, 'Word must be 100 characters or less'),
  kana: z
    .string()
    .max(100, 'Kana must be 100 characters or less')
    .optional()
    .transform((val) => val ?? '')
})

export type VocabCreateData = z.infer<typeof vocabCreateSchema>
