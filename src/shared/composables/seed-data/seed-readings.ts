/**
 * Readings Seed Data
 *
 * Sample on-yomi and kun-yomi readings for development and testing.
 */

export interface SeedOnReadingData {
  kanjiCharacter: string
  reading: string
  readingLevel: '小' | '中' | '高' | '外'
}

export interface SeedKunReadingData {
  kanjiCharacter: string
  reading: string
  okurigana: string | null
  readingLevel: '小' | '中' | '高' | '外'
}

export const SEED_ON_READINGS: SeedOnReadingData[] = [
  { kanjiCharacter: '日', reading: 'ニチ', readingLevel: '小' },
  { kanjiCharacter: '日', reading: 'ジツ', readingLevel: '小' },
  { kanjiCharacter: '月', reading: 'ゲツ', readingLevel: '小' },
  { kanjiCharacter: '月', reading: 'ガツ', readingLevel: '小' },
  { kanjiCharacter: '水', reading: 'スイ', readingLevel: '小' },
  { kanjiCharacter: '火', reading: 'カ', readingLevel: '小' },
  { kanjiCharacter: '木', reading: 'モク', readingLevel: '小' },
  { kanjiCharacter: '金', reading: 'キン', readingLevel: '小' },
  { kanjiCharacter: '土', reading: 'ド', readingLevel: '小' },
  { kanjiCharacter: '山', reading: 'サン', readingLevel: '小' },
  { kanjiCharacter: '川', reading: 'セン', readingLevel: '小' },
  { kanjiCharacter: '人', reading: 'ジン', readingLevel: '小' },
  { kanjiCharacter: '空', reading: 'クウ', readingLevel: '小' },
  { kanjiCharacter: '海', reading: 'カイ', readingLevel: '小' },
  { kanjiCharacter: '花', reading: 'カ', readingLevel: '小' },
  { kanjiCharacter: '愛', reading: 'アイ', readingLevel: '小' }
]

export const SEED_KUN_READINGS: SeedKunReadingData[] = [
  { kanjiCharacter: '日', reading: 'ひ', okurigana: null, readingLevel: '小' },
  {
    kanjiCharacter: '月',
    reading: 'つき',
    okurigana: null,
    readingLevel: '小'
  },
  {
    kanjiCharacter: '水',
    reading: 'みず',
    okurigana: null,
    readingLevel: '小'
  },
  { kanjiCharacter: '火', reading: 'ひ', okurigana: null, readingLevel: '小' },
  { kanjiCharacter: '木', reading: 'き', okurigana: null, readingLevel: '小' },
  {
    kanjiCharacter: '金',
    reading: 'かね',
    okurigana: null,
    readingLevel: '小'
  },
  {
    kanjiCharacter: '土',
    reading: 'つち',
    okurigana: null,
    readingLevel: '小'
  },
  {
    kanjiCharacter: '山',
    reading: 'やま',
    okurigana: null,
    readingLevel: '小'
  },
  {
    kanjiCharacter: '川',
    reading: 'かわ',
    okurigana: null,
    readingLevel: '小'
  },
  {
    kanjiCharacter: '人',
    reading: 'ひと',
    okurigana: null,
    readingLevel: '小'
  },
  {
    kanjiCharacter: '空',
    reading: 'そら',
    okurigana: null,
    readingLevel: '小'
  },
  {
    kanjiCharacter: '海',
    reading: 'うみ',
    okurigana: null,
    readingLevel: '小'
  },
  { kanjiCharacter: '花', reading: 'はな', okurigana: null, readingLevel: '小' }
]

/**
 * Seeds on-yomi readings into the database
 */
export function seedOnReadings(
  run: (sql: string, params?: unknown[]) => void,
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[]
): number {
  let count = 0
  for (const reading of SEED_ON_READINGS) {
    const result = exec('SELECT id FROM kanjis WHERE character = ?', [
      reading.kanjiCharacter
    ])
    const kanjiId = result[0]?.values[0]?.[0] as number | undefined

    if (kanjiId) {
      const maxResult = exec(
        'SELECT MAX(display_order) FROM on_readings WHERE kanji_id = ?',
        [kanjiId]
      )
      const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1

      run(
        `INSERT INTO on_readings (kanji_id, reading, reading_level, display_order)
         VALUES (?, ?, ?, ?)`,
        [kanjiId, reading.reading, reading.readingLevel, maxOrder + 1]
      )
      count++
    }
  }
  return count
}

/**
 * Seeds kun-yomi readings into the database
 */
export function seedKunReadings(
  run: (sql: string, params?: unknown[]) => void,
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[]
): number {
  let count = 0
  for (const reading of SEED_KUN_READINGS) {
    const result = exec('SELECT id FROM kanjis WHERE character = ?', [
      reading.kanjiCharacter
    ])
    const kanjiId = result[0]?.values[0]?.[0] as number | undefined

    if (kanjiId) {
      const maxResult = exec(
        'SELECT MAX(display_order) FROM kun_readings WHERE kanji_id = ?',
        [kanjiId]
      )
      const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1

      run(
        `INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order)
         VALUES (?, ?, ?, ?, ?)`,
        [
          kanjiId,
          reading.reading,
          reading.okurigana,
          reading.readingLevel,
          maxOrder + 1
        ]
      )
      count++
    }
  }
  return count
}
