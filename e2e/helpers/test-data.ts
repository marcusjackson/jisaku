/**
 * E2E Test Data Constants
 *
 * Centralized test data for E2E tests.
 * Provides consistent, reusable test content across all test files.
 */

/**
 * Kanji characters used as unique test identifiers in kanji-detail tests.
 * Each character is distinct to avoid DB collisions across test runs.
 */
export const KANJI_TEST_CHARS = {
  MEANING_INTENT: '意',
  MEANING_TASTE: '味',
  MEANING_CHASE: '追',
  MEANING_ORDER: '番',
  MEANING_GROUP: '群',
  MEANING_COMBINE: '組',
  MEANING_EMPTY: '空',
  MEANING_DELETE: '削',
  MEANING_ERASE: '消',
  MEANING_MOVE: '移',
  READING_READ: '読',
  READING_WRITE: '書',
  READING_SOUND: '音',
  READING_TRAIN: '訓',
  READING_REMOVE: '除',
  READING_HIDE: '隠',
  READING_MOVE: '動',
  STROKE_DRAW: '画',
  STROKE_PICTURE: '絵',
  NOTES_ANNOTATE: '注',
  NOTES_EDIT: '編'
} as const

/**
 * Component (kanji radical) characters used as unique test identifiers
 * in component-detail tests.
 */
export const COMPONENT_TEST_CHARS = {
  WATER_RADICAL: '氵',
  PERSON_RADICAL: '亻',
  HAND_RADICAL: '扌',
  TREE: '木',
  FIRE: '火',
  EARTH: '土',
  GOLD: '金',
  MOON: '月',
  STONE: '石',
  FIELD: '田',
  MOUTH: '口',
  WATER: '水',
  SUN: '日',
  HAND: '手'
} as const

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
  HEAVY_RAIN: '大雨'
} as const

/**
 * Kanji characters linked to vocab entries in vocab-detail tests.
 */
export const VOCAB_KANJI_CHARS = {
  BRIGHT: '明',
  LIGHT: '光',
  SUN: '日',
  BOOK: '本',
  RAIN: '雨'
} as const

export const TEST_ENTRY_CONTENT = {
  SIMPLE: 'Test entry content',
  WALK: 'Went for a walk in the park today. Beautiful weather!',
  LONG: 'A longer test entry with more detailed information about the day',
  TODAY: 'Entry for today',
  YESTERDAY: 'Yesterday entry unique',
  TOMORROW: 'Tomorrow entry for testing',
  FIRST: 'First entry of the day',
  SECOND: 'Second entry with more details',
  THIRD: 'Third entry to test ordering',
  ORIGINAL: 'Original entry content before editing',
  UPDATED: 'This content has been EDITED and updated!',
  DISCARDED: 'This content should be discarded',
  TIMESTAMP_TEST: 'Testing timestamp display',
  ESCAPE_TEST: 'Content that should remain after Escape',
  REFERENCE: 'Reference entry for today'
} as const
