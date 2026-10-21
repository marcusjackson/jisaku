/**
 * Vocabulary Detail Types
 *
 * Type definitions for the vocabulary detail module.
 *
 * @module modules/vocab-detail
 */

import type { VocabJlptLevel } from '@/api/vocabulary/vocabulary-types';

/**
 * Data emitted when headline fields are saved
 */
export interface HeadlineSaveData {
  word: string;
  kana: string;
  shortMeaning: string | null;
  searchKeywords: string | null;
}

/**
 * Data emitted when basic information fields are saved
 */
export interface BasicInfoSaveData {
  jlptLevel: VocabJlptLevel | null;
  isCommon: boolean;
  description: string | null;
}
