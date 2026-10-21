/**
 * Validation schema for component headline edit form
 */

import { z } from 'zod';

import {
  searchKeywordsSchema,
  shortMeaningSchema,
  singleCharacterSchema,
} from '@/shared/validation';

export const componentHeadlineSchema = z.object({
  character: singleCharacterSchema,
  shortMeaning: shortMeaningSchema,
  searchKeywords: searchKeywordsSchema,
});
