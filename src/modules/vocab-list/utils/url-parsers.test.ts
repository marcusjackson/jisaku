/**
 * Tests for vocab-list URL parsing helpers.
 */

import { describe, expect, it } from 'vitest';

import {
  parseBoolean,
  parseDescriptionFilter,
  parseJlptLevels,
  parseKanjiIds,
  parseString,
} from './url-parsers';

describe('vocab-list url parsers', () => {
  it('parseString keeps only non-empty strings', () => {
    expect(parseString('word')).toBe('word');
    expect(parseString('')).toBeUndefined();
    expect(parseString(undefined)).toBeUndefined();
  });

  it('parseBoolean accepts only true', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('false')).toBeUndefined();
    expect(parseBoolean('1')).toBeUndefined();
  });

  it('parseJlptLevels keeps valid levels and drops the rest', () => {
    expect(parseJlptLevels('N5,N1,bogus')).toEqual(['N5', 'N1']);
    expect(parseJlptLevels('bogus')).toBeUndefined();
    expect(parseJlptLevels('')).toBeUndefined();
  });

  it('parseDescriptionFilter accepts filled and empty', () => {
    expect(parseDescriptionFilter('filled')).toBe('filled');
    expect(parseDescriptionFilter('empty')).toBe('empty');
    expect(parseDescriptionFilter('x')).toBeUndefined();
  });

  it('parseKanjiIds keeps positive numbers', () => {
    expect(parseKanjiIds('1, 2,x,0,-3')).toEqual([1, 2]);
    expect(parseKanjiIds('x')).toBeUndefined();
  });
});
