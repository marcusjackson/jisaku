/**
 * Validation schema for kanji headline edit form
 */

import { z } from 'zod'

import { optionalString, singleCharacterSchema } from '@/shared/validation'

export const kanjiHeadlineSchema = z.object({
  character: singleCharacterSchema,
  shortMeaning: optionalString(100),
  searchKeywords: optionalString(500)
})

export type KanjiHeadlineFormData = z.infer<typeof kanjiHeadlineSchema>
