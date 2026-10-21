/**
 * Quick-Create Kanji Schema
 *
 * Zod validation schema for quick-creating kanji with minimal fields.
 * Note: stroke_count, readings, and other details can be added later on detail page.
 */

import { z } from 'zod';

import { searchKeywordsSchema, shortMeaningSchema, singleCharacterSchema } from './common-schemas';

export const quickCreateKanjiSchema = z.object({
  character: singleCharacterSchema,

  shortMeaning: shortMeaningSchema.optional(),

  searchKeywords: searchKeywordsSchema.optional(),
});

// Export inferred type
export type QuickCreateKanjiData = z.infer<typeof quickCreateKanjiSchema>;
