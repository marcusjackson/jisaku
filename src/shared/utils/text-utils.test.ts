import { describe, expect, it } from 'vitest';

import { blankToNull } from './text-utils';

describe('blankToNull', () => {
  it('returns null for undefined, null, empty and whitespace', () => {
    expect(blankToNull(undefined)).toBeNull();
    expect(blankToNull(null)).toBeNull();
    expect(blankToNull('')).toBeNull();
    expect(blankToNull('  ')).toBeNull();
  });

  it('returns non-blank text unchanged', () => {
    expect(blankToNull(' tree ')).toBe(' tree ');
  });
});
