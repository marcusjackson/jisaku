/**
 * Validation schema for vocabulary headline edit form
 */

import { z } from 'zod'

import { optionalString } from '@/shared/validation'

export const vocabHeadlineSchema = z.object({
  word: z
    .string()
    .min(1, 'Word is required')
    .max(100, 'Word must be 100 characters or less'),
  kana: z
    .string()
    .min(1, 'Kana is required')
    .max(100, 'Kana must be 100 characters or less'),
  shortMeaning: optionalString(100),
  searchKeywords: optionalString(500)
})

export type VocabHeadlineFormData = z.infer<typeof vocabHeadlineSchema>
