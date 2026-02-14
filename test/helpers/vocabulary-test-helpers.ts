/**
 * Vocabulary Test Helpers
 *
 * Factory functions for creating test data for vocabulary and vocab-kanji entities.
 */

import type {
  VocabKanji,
  VocabKanjiWithVocabulary,
  Vocabulary
} from '@/api/vocabulary'

/**
 * Create a test Vocabulary entity
 */
export function createTestVocabulary(
  overrides: Partial<Vocabulary> = {}
): Vocabulary {
  const now = new Date().toISOString()

  return {
    id: 1,
    word: '明日',
    kana: 'あした',
    shortMeaning: 'tomorrow',
    searchKeywords: null,
    jlptLevel: 'N5',
    isCommon: true,
    description: null,
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}

/**
 * Create a test VocabKanji junction entity
 */
export function createTestVocabKanji(
  overrides: Partial<VocabKanji> = {}
): VocabKanji {
  const now = new Date().toISOString()

  return {
    id: 1,
    vocabId: 1,
    kanjiId: 1,
    analysisNotes: null,
    displayOrder: 0,
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}

/**
 * Create a test VocabKanjiWithVocabulary joined entity
 */
export function createTestVocabKanjiWithVocabulary(
  overrides: Partial<VocabKanjiWithVocabulary> = {}
): VocabKanjiWithVocabulary {
  return {
    vocabKanji: createTestVocabKanji(),
    vocabulary: createTestVocabulary(),
    ...overrides
  }
}

/**
 * Create multiple test vocabulary entries
 */
export function createTestVocabularyList(
  count: number,
  baseOverrides: Partial<Vocabulary> = {}
): Vocabulary[] {
  return Array.from({ length: count }, (_, i) =>
    createTestVocabulary({
      id: i + 1,
      word: `word${String(i + 1)}`,
      kana: `kana${String(i + 1)}`,
      shortMeaning: `meaning ${String(i + 1)}`,
      ...baseOverrides
    })
  )
}

/**
 * Create multiple test VocabKanjiWithVocabulary entries
 */
export function createTestVocabKanjiWithVocabularyList(
  count: number,
  kanjiId = 1
): VocabKanjiWithVocabulary[] {
  return Array.from({ length: count }, (_, i) => ({
    vocabKanji: createTestVocabKanji({
      id: i + 1,
      vocabId: i + 1,
      kanjiId,
      displayOrder: i
    }),
    vocabulary: createTestVocabulary({
      id: i + 1,
      word: `word${String(i + 1)}`,
      kana: `kana${String(i + 1)}`,
      shortMeaning: `meaning ${String(i + 1)}`
    })
  }))
}
