/**
 * Vocab List URL Parsing Helpers
 *
 * Functions to parse URL query parameters into typed filter values.
 *
 * @module modules/vocab-list/utils
 */

import type { DescriptionFilledFilter, VocabJlptLevel } from '../vocab-list-types';

export function parseString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.length > 0) return value;
  return undefined;
}

export function parseBoolean(value: unknown): boolean | undefined {
  // The UI only writes `true` or removes the key; `false` is no restriction.
  if (value === 'true') return true;
  return undefined;
}

export function parseJlptLevels(value: unknown): VocabJlptLevel[] | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const validLevels: VocabJlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt'];
  const levels = value
    .split(',')
    .filter((l): l is VocabJlptLevel => validLevels.includes(l as VocabJlptLevel));
  return levels.length > 0 ? levels : undefined;
}

export function parseDescriptionFilter(value: unknown): DescriptionFilledFilter | undefined {
  if (value === 'filled' || value === 'empty') return value;
  return undefined;
}

export function parseKanjiIds(value: unknown): number[] | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  const ids = value
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => !isNaN(id) && id > 0);
  return ids.length > 0 ? ids : undefined;
}
