/**
 * E2E Test Data Constants
 *
 * Centralized test data for E2E tests.
 * Provides consistent, reusable test content across all test files.
 */

/**
 * Vocabulary words used as unique test identifiers in vocab-detail tests.
 */
export const VOCAB_TEST_WORDS = {
  JAPANESE_LANGUAGE: '日本語',
  STUDY: '勉強',
  WORD: '言葉',
  SPEAK: '話す',
  WRITE: '書く',
  EAT: '食べる',
  ERASE: '消す',
  EXCLUDE: '除く',
  BASICS: '基本',
  EDIT: '編集',
  KANJI_WORD: '漢字',
  EMPTY_WORD: '空語',
  DELETE: '削除',
  TOMORROW: '明日',
  BRIGHT_LIGHT: '光明',
  JAPAN: '日本',
  HEAVY_RAIN: '大雨',
} as const;

/**
 * Kanji characters linked to vocab entries in vocab-detail tests.
 */
export const VOCAB_KANJI_CHARS = {
  BRIGHT: '明',
  LIGHT: '光',
  SUN: '日',
  BOOK: '本',
  RAIN: '雨',
} as const;
