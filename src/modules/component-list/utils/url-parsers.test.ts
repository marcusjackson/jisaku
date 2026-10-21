/**
 * Tests for component-list URL parsing helpers.
 */

import { describe, expect, it } from 'vitest';

import { parseBoolean, parseNumber, parsePresence, parseString } from './url-parsers';

describe('component-list url parsers', () => {
  it('parseString keeps only non-empty strings', () => {
    expect(parseString('水')).toBe('水');
    expect(parseString('')).toBeUndefined();
    expect(parseString(3)).toBeUndefined();
  });

  it('parseNumber reads integers from strings', () => {
    expect(parseNumber('12')).toBe(12);
    expect(parseNumber('abc')).toBeUndefined();
    expect(parseNumber(12)).toBeUndefined();
  });

  it('parseBoolean accepts only true and false', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean('yes')).toBeUndefined();
  });

  it('parsePresence accepts has and missing, else null', () => {
    expect(parsePresence('has')).toBe('has');
    expect(parsePresence('missing')).toBe('missing');
    expect(parsePresence('other')).toBeNull();
  });
});
