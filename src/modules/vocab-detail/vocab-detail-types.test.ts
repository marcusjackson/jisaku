/**
 * Vocabulary Detail Types Tests
 *
 * Type assertion tests to verify that the save payload types are exported.
 */

import { describe, expect, it } from 'vitest';

import type { BasicInfoSaveData, HeadlineSaveData } from './vocab-detail-types';

describe('vocab-detail-types', () => {
  it('exports HeadlineSaveData type', () => {
    const data: HeadlineSaveData = {
      word: '日本語',
      kana: 'にほんご',
      shortMeaning: null,
      searchKeywords: 'nihongo',
    };
    expect(data.word).toBe('日本語');
  });

  it('exports BasicInfoSaveData type', () => {
    const data: BasicInfoSaveData = { jlptLevel: 'N5', isCommon: true, description: null };
    expect(data.jlptLevel).toBe('N5');
  });
});
