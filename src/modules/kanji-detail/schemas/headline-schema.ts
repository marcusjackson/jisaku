/**
 * Validation schema for kanji headline edit form
 */

import { z } from 'zod';

import {
  searchKeywordsSchema,
  shortMeaningSchema,
  singleCharacterSchema,
} from '@/shared/validation';

export const kanjiHeadlineSchema = z.object({
  character: singleCharacterSchema,
  shortMeaning: shortMeaningSchema,
  searchKeywords: searchKeywordsSchema,
});

export type KanjiHeadlineFormData = z.infer<typeof kanjiHeadlineSchema>;
