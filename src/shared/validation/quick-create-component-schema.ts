/**
 * Quick-Create Component Schema
 *
 * Zod validation schema for quick-creating components with minimal fields.
 * Note: search_keywords and stroke_count can be added later on detail page.
 */

import { z } from 'zod';

import { shortMeaningSchema, singleCharacterSchema } from './common-schemas';

export const quickCreateComponentSchema = z.object({
  character: singleCharacterSchema,

  shortMeaning: shortMeaningSchema.optional(),
});

// Export inferred type
export type QuickCreateComponentData = z.infer<typeof quickCreateComponentSchema>;
