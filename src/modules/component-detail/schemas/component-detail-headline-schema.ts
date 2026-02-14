/**
 * Validation schema for component headline edit form
 */

import { z } from 'zod'

import { optionalString, singleCharacterSchema } from '@/shared/validation'

export const componentHeadlineSchema = z.object({
  character: singleCharacterSchema,
  shortMeaning: optionalString(100),
  searchKeywords: optionalString(500)
})

export type ComponentHeadlineFormData = z.infer<typeof componentHeadlineSchema>
