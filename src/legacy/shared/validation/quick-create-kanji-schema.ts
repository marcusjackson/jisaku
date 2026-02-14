/**
 * Quick-Create Kanji Schema
 *
 * Zod validation schema for quick-creating kanji with minimal fields.
 * Note: search_keywords can be added later on detail page.
 */

import { z } from 'zod'

export const quickCreateKanjiSchema = z.object({
  character: z
    .string()
    .min(1, 'Character is required')
    .max(1, 'Must be a single character'),

  shortMeaning: z.string().optional(),

  searchKeywords: z.string().optional()
})

// Export inferred type
export type QuickCreateKanjiData = z.infer<typeof quickCreateKanjiSchema>
