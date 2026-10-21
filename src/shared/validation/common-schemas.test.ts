/**
 * Tests for Common Validation Schemas
 */

import { describe, expect, it } from 'vitest';

import {
  boundedString,
  parseStrokeCountText,
  rangedStrokeCountTextSchema,
  singleCharacterSchema,
} from './common-schemas';

describe('singleCharacterSchema', () => {
  it('accepts a single kanji character', () => {
    const result = singleCharacterSchema.safeParse('水');
    expect(result.success).toBe(true);
  });

  it('accepts a single hiragana character', () => {
    const result = singleCharacterSchema.safeParse('あ');
    expect(result.success).toBe(true);
  });

  it('accepts a single katakana character', () => {
    const result = singleCharacterSchema.safeParse('ア');
    expect(result.success).toBe(true);
  });

  it('accepts a complex kanji with surrogate pairs', () => {
    const result = singleCharacterSchema.safeParse('𠀋');
    expect(result.success).toBe(true);
  });

  it('rejects empty string', () => {
    const result = singleCharacterSchema.safeParse('');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected parse to fail');
    expect(result.error.issues[0]?.message).toBe('Please enter a character');
  });

  it('rejects multiple characters', () => {
    const result = singleCharacterSchema.safeParse('水火');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected parse to fail');
    expect(result.error.issues[0]?.message).toBe('Please enter only one character');
  });

  it('trims whitespace before validation', () => {
    const result = singleCharacterSchema.safeParse(' 水 ');
    expect(result.success).toBe(true);
    expect(result.data).toBe('水');
  });

  it('rejects whitespace-only input', () => {
    const result = singleCharacterSchema.safeParse('   ');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected parse to fail');
    expect(result.error.issues[0]?.message).toBe('Please enter a character');
  });
});

describe('boundedString', () => {
  it('accepts string within max length', () => {
    const schema = boundedString(10);
    const result = schema.safeParse('hello');
    expect(result.success).toBe(true);
  });

  it('accepts empty string', () => {
    const schema = boundedString(10);
    const result = schema.safeParse('');
    expect(result.success).toBe(true);
  });

  it('rejects string exceeding max length', () => {
    const schema = boundedString(5);
    const result = schema.safeParse('hello world');
    expect(result.success).toBe(false);
    if (result.success) throw new Error('Expected parse to fail');
    expect(result.error.issues[0]?.message).toContain('Max 5 characters');
  });
});

describe('stroke count text schemas', () => {
  it.each(['', '  ', '3', ' 12 '])('accepts %j', (text) => {
    expect(parseStrokeCountText(text).error).toBeUndefined();
  });

  it.each(['3.5', '2x', 'abc', '-3', '1e2'])('rejects %j', (text) => {
    expect(parseStrokeCountText(text)).toEqual({
      error: 'Stroke count must be a whole number',
    });
  });

  it('returns null for blank and the number otherwise', () => {
    expect(parseStrokeCountText('')).toEqual({ value: null });
    expect(parseStrokeCountText(' 12 ')).toEqual({ value: 12 });
  });

  it('keeps the 1 to 64 range when asked', () => {
    expect(parseStrokeCountText('65', rangedStrokeCountTextSchema).error).toBe(
      'Stroke count must be between 1 and 64'
    );
    expect(parseStrokeCountText('0', rangedStrokeCountTextSchema).error).toBe(
      'Stroke count must be between 1 and 64'
    );
    expect(parseStrokeCountText('12abc', rangedStrokeCountTextSchema).error).toBe(
      'Stroke count must be a whole number'
    );
    expect(parseStrokeCountText('64', rangedStrokeCountTextSchema)).toEqual({
      value: 64,
    });
  });
});
