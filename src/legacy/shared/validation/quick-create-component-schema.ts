/**
 * Quick-Create Component Schema
 *
 * Zod validation schema for quick-creating components with minimal fields.
 * Note: search_keywords and stroke_count can be added later on detail page.
 */

import { z } from 'zod'

export const quickCreateComponentSchema = z.object({
  character: z
    .string()
    .min(1, 'Character is required')
    .max(1, 'Must be a single character'),

  shortMeaning: z.string().optional()
})

// Export inferred type
export type QuickCreateComponentData = z.infer<
  typeof quickCreateComponentSchema
>
