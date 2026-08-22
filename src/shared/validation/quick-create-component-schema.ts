/**
 * Quick-Create Component Schema
 *
 * Zod validation schema for quick-creating components with minimal fields.
 * Note: search_keywords and stroke_count can be added later on detail page.
 */

import { z } from 'zod'

import { singleCharacterSchema } from './common-schemas'

export const quickCreateComponentSchema = z.object({
  character: singleCharacterSchema,

  shortMeaning: z.string().optional()
})

// Export inferred type
export type QuickCreateComponentData = z.infer<
  typeof quickCreateComponentSchema
>
