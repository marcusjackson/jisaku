/**
 * Component List URL Parsing Helpers
 *
 * Functions to parse URL query parameters into typed filter values.
 *
 * @module modules/component-list/utils
 */

import type { PresenceFilterValue } from '../component-list-types';

/** Parse a string value from query param */
export function parseString(value: unknown): string | undefined {
  if (typeof value === 'string' && value !== '') return value;
  return undefined;
}

/** Parse a number value from query param */
export function parseNumber(value: unknown): number | undefined {
  if (typeof value === 'string') {
    const num = parseInt(value, 10);
    if (!isNaN(num)) return num;
  }
  return undefined;
}

/** Parse a boolean value from query param */
export function parseBoolean(value: unknown): boolean | undefined {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

/** Parse a presence filter value from query param */
export function parsePresence(value: unknown): PresenceFilterValue {
  if (value === 'has' || value === 'missing') return value;
  return null;
}
