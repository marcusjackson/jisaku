/**
 * Text helpers
 */

/**
 * Converts a blank (empty or whitespace-only) string to null so an empty
 * form field is stored as a missing value rather than `''`.
 *
 * @param value - Raw form text, possibly undefined
 * @returns The original text, or null when it is missing or blank
 */
export function blankToNull(value: string | undefined | null): string | null {
  return value === undefined || value === null || value.trim() === '' ? null : value;
}
