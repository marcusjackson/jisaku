/**
 * Vocabulary Seed Data
 *
 * Sample vocabulary data for development and testing.
 */

export interface SeedVocabularyData {
  word: string
  kana: string | null
  shortMeaning: string
  searchKeywords: string
  jlptLevel: string
  isCommon: boolean
  description: string
}

export const SEED_VOCABULARY: SeedVocabularyData[] = [
  {
    word: '日本',
    kana: 'にほん',
    shortMeaning: 'Japan',
    searchKeywords: 'nippon, japan, country',
    jlptLevel: 'N5',
    isCommon: true,
    description: 'The country name of Japan.'
  },
  {
    word: '火山',
    kana: 'かざん',
    shortMeaning: 'volcano',
    searchKeywords: 'mountain, eruption, lava',
    jlptLevel: 'N3',
    isCommon: true,
    description: 'A volcano. Literally "fire mountain".'
  },
  {
    word: '金曜日',
    kana: 'きんようび',
    shortMeaning: 'Friday',
    searchKeywords: 'day, week, weekend',
    jlptLevel: 'N5',
    isCommon: true,
    description: 'Friday. The day of gold/metal.'
  },
  {
    word: '人々',
    kana: 'ひとびと',
    shortMeaning: 'people',
    searchKeywords: 'person, humans, crowd',
    jlptLevel: 'N4',
    isCommon: true,
    description: 'People (plural).'
  },
  {
    word: '海水',
    kana: 'かいすい',
    shortMeaning: 'seawater',
    searchKeywords: 'ocean, salt, marine',
    jlptLevel: 'N3',
    isCommon: true,
    description: 'Seawater. Salt water from the sea.'
  }
]

export interface SeedVocabKanjiData {
  vocabWord: string
  kanjiCharacters: string[]
  analysisNotes?: (string | null)[]
}

export const SEED_VOCAB_KANJI: SeedVocabKanjiData[] = [
  {
    vocabWord: '日本',
    kanjiCharacters: ['日'],
    analysisNotes: ['日 (sun/day) represents the rising sun of Japan']
  },
  {
    vocabWord: '火山',
    kanjiCharacters: ['火', '山'],
    analysisNotes: ['火 (fire) represents volcanic activity', '山 (mountain)']
  },
  {
    vocabWord: '金曜日',
    kanjiCharacters: ['金', '日'],
    analysisNotes: ['金 (gold/metal) represents Friday', '日 (day)']
  },
  {
    vocabWord: '人々',
    kanjiCharacters: ['人'],
    analysisNotes: ['人 (person) is doubled using 々']
  },
  {
    vocabWord: '海水',
    kanjiCharacters: ['海', '水'],
    analysisNotes: ['海 (sea)', '水 (water)']
  }
]

/**
 * Seeds vocabulary data into the database
 */
export function seedVocabulary(
  run: (sql: string, params?: unknown[]) => void
): number {
  for (const vocab of SEED_VOCABULARY) {
    run(
      `INSERT INTO vocabulary (word, kana, short_meaning, search_keywords, jlpt_level, is_common, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        vocab.word,
        vocab.kana,
        vocab.shortMeaning,
        vocab.searchKeywords,
        vocab.jlptLevel,
        vocab.isCommon ? 1 : 0,
        vocab.description
      ]
    )
  }
  return SEED_VOCABULARY.length
}

/**
 * Seeds vocab-kanji junction data into the database
 */
export function seedVocabKanji(
  exec: (
    sql: string,
    params?: unknown[]
  ) => { columns: string[]; values: unknown[][] }[],
  run: (sql: string, params?: unknown[]) => void
): number {
  let count = 0

  for (const vocabKanji of SEED_VOCAB_KANJI) {
    const vocabResult = exec('SELECT id FROM vocabulary WHERE word = ?', [
      vocabKanji.vocabWord
    ])
    const vocabId = vocabResult[0]?.values[0]?.[0] as number | undefined
    if (!vocabId) continue

    vocabKanji.kanjiCharacters.forEach((kanjiChar, index) => {
      const kanjiResult = exec('SELECT id FROM kanjis WHERE character = ?', [
        kanjiChar
      ])
      const kanjiId = kanjiResult[0]?.values[0]?.[0] as number | undefined
      if (!kanjiId) return

      const analysisNotes = vocabKanji.analysisNotes?.[index] ?? null

      run(
        `INSERT INTO vocab_kanji (vocab_id, kanji_id, analysis_notes, display_order)
         VALUES (?, ?, ?, ?)`,
        [vocabId, kanjiId, analysisNotes, index]
      )
      count++
    })
  }

  return count
}
