/**
 * SQL LIKE helpers shared by the repositories.
 *
 * @module api
 */

/**
 * Escape `\`, `%` and `_` so user text matches literally inside a `LIKE`
 * pattern. Pair the pattern with `ESCAPE '\\'` in the SQL.
 */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, '\\$&');
}
