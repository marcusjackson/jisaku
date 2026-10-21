/**
 * Tests for type-name-helpers
 */

import { describe, expect, it } from 'vitest';

import { optionalText, typeNameError } from './type-name-helpers';

describe('optionalText', () => {
  it('returns null for undefined, null, empty and blank values', () => {
    expect(optionalText(undefined)).toBeNull();
    expect(optionalText(null)).toBeNull();
    expect(optionalText('')).toBeNull();
    expect(optionalText('   ')).toBeNull();
  });

  it('returns the trimmed text otherwise', () => {
    expect(optionalText(' 偏 ')).toBe('偏');
  });
});

describe('typeNameError', () => {
  const existing = [
    { id: 1, name: 'hen' },
    { id: 2, name: 'tsukuri' },
  ];

  it('requires a name', () => {
    expect(typeNameError('  ', existing, 'position type')).toBe('Position type name is required');
  });

  it('refuses a name another item has, ignoring surrounding spaces', () => {
    expect(typeNameError(' hen ', existing, 'position type')).toBe(
      'A position type named "hen" already exists'
    );
  });

  it('allows an item to keep its own name', () => {
    expect(typeNameError('hen', existing, 'position type', 1)).toBeNull();
  });

  it('accepts a new name', () => {
    expect(typeNameError('kanmuri', existing, 'position type')).toBeNull();
  });
});
