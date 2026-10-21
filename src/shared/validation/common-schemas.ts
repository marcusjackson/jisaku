/**
 * Common Validation Schemas
 *
 * Shared zod schemas used across multiple modules.
 *
 * @module shared/validation
 */

import { z } from 'zod';

/**
 * Validates a single Japanese character (handles Unicode properly)
 * Uses Intl.Segmenter for accurate grapheme counting.
 */
export const singleCharacterSchema = z
  .string()
  .trim()
  .min(1, 'Please enter a character')
  .refine(
    (val) => {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' });
      return [...segmenter.segment(val)].length === 1;
    },
    { message: 'Please enter only one character' }
  );

/**
 * Validates optional stroke-count text: blank, or digits only.
 * Rejects what `parseInt` would silently truncate ("3.5", "12abc").
 */
export const strokeCountTextSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || /^\d+$/.test(val), {
    message: 'Stroke count must be a whole number',
  });

/** Stroke-count text that, when present, must also be 1 to 64. */
export const rangedStrokeCountTextSchema = strokeCountTextSchema.refine(
  (val) => val === '' || (Number(val) >= 1 && Number(val) <= 64),
  { message: 'Stroke count must be between 1 and 64' }
);

/** Kangxi-number text that, when present, must be digits only and 1 to 214. */
export const kangxiNumberTextSchema = z
  .string()
  .trim()
  .refine((val) => val === '' || (/^\d+$/.test(val) && Number(val) >= 1 && Number(val) <= 214), {
    message: 'Kangxi number must be between 1 and 214',
  });

/**
 * Parses stroke-count text with the given schema.
 * @returns The number (null when blank), or an error message
 */
export function parseStrokeCountText(
  text: string,
  schema: z.ZodType<string> = strokeCountTextSchema
): { value: number | null; error?: undefined } | { error: string } {
  const result = schema.safeParse(text);
  if (!result.success) {
    return { error: result.error.issues[0]?.message ?? 'Invalid stroke count' };
  }
  return { value: result.data === '' ? null : Number(result.data) };
}

/**
 * Creates a string schema with a maximum length validation. The field is still
 * required: pass `''` for an empty value rather than omitting it.
 * @param maxLength - Maximum number of characters allowed
 * @returns Zod schema accepting an empty string or a string up to maxLength characters
 */
export function boundedString(maxLength: number) {
  return z.string().max(maxLength, `Max ${String(maxLength)} characters`);
}

/** Maximum length of a kanji or component Short Meaning. */
export const SHORT_MEANING_MAX_LENGTH = 100;

/** Maximum length of a kanji or component Search Keywords. */
export const SEARCH_KEYWORDS_MAX_LENGTH = 500;

/** Short Meaning field schema shared by headline and quick-create forms. */
export const shortMeaningSchema = boundedString(SHORT_MEANING_MAX_LENGTH);

/** Search Keywords field schema shared by headline and quick-create forms. */
export const searchKeywordsSchema = boundedString(SEARCH_KEYWORDS_MAX_LENGTH);
