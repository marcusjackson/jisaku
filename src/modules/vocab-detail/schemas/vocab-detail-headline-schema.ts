/**
 * Validation schema for vocabulary headline edit form
 */

import { z } from 'zod';

import { boundedString } from '@/shared/validation';

export const vocabHeadlineSchema = z.object({
  word: z
    .string()
    .trim()
    .min(1, 'Word is required')
    .max(100, 'Word must be 100 characters or less'),
  kana: z.string().trim().max(100, 'Kana must be 100 characters or less'),
  shortMeaning: boundedString(100),
  searchKeywords: boundedString(500),
});
