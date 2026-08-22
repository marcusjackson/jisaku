/**
 * Common Validation Schemas
 *
 * Shared zod schemas used across multiple modules.
 *
 * @module shared/validation
 */

import { z } from 'zod'

/**
 * Validates a single Japanese character (handles Unicode properly)
 * Uses Intl.Segmenter for accurate grapheme counting.
 */
export const singleCharacterSchema = z
  .string()
  .min(1, 'Please enter a character')
  .refine(
    (val) => {
      const segmenter = new Intl.Segmenter('ja', { granularity: 'grapheme' })
      return [...segmenter.segment(val.trim())].length === 1
    },
    { message: 'Please enter only one character' }
  )

/**
 * Creates an optional string schema with a maximum length validation.
 * @param maxLength - Maximum number of characters allowed
 * @returns Zod schema accepting undefined, empty string, or a string up to maxLength characters
 */
export function optionalString(maxLength: number) {
  return z.string().max(maxLength, `Max ${String(maxLength)} characters`)
}
