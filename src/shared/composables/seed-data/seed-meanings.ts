/**
 * Meanings Seed Data
 *
 * Sample meanings for development and testing.
 */

export interface SeedMeaningData {
  kanjiCharacter: string
  meaningText: string
  additionalInfo: string | null
}

export interface SeedReadingGroupData {
  kanjiCharacter: string
  readingText: string
  meanings: string[]
}

export const SEED_MEANINGS: SeedMeaningData[] = [
  { kanjiCharacter: '日', meaningText: 'sun', additionalInfo: null },
  { kanjiCharacter: '日', meaningText: 'day', additionalInfo: null },
  { kanjiCharacter: '月', meaningText: 'moon', additionalInfo: null },
  { kanjiCharacter: '月', meaningText: 'month', additionalInfo: null },
  { kanjiCharacter: '水', meaningText: 'water', additionalInfo: null },
  { kanjiCharacter: '火', meaningText: 'fire', additionalInfo: null },
  { kanjiCharacter: '木', meaningText: 'tree', additionalInfo: null },
  { kanjiCharacter: '木', meaningText: 'wood', additionalInfo: null },
  { kanjiCharacter: '金', meaningText: 'gold', additionalInfo: null },
  { kanjiCharacter: '金', meaningText: 'metal', additionalInfo: null },
  { kanjiCharacter: '土', meaningText: 'earth', additionalInfo: null },
  { kanjiCharacter: '土', meaningText: 'soil', additionalInfo: null },
  { kanjiCharacter: '山', meaningText: 'mountain', additionalInfo: null },
  { kanjiCharacter: '川', meaningText: 'river', additionalInfo: null },
  { kanjiCharacter: '人', meaningText: 'person', additionalInfo: null },
  { kanjiCharacter: '空', meaningText: 'sky', additionalInfo: null },
  { kanjiCharacter: '空', meaningText: 'empty', additionalInfo: null },
  { kanjiCharacter: '海', meaningText: 'sea', additionalInfo: null },
  { kanjiCharacter: '花', meaningText: 'flower', additionalInfo: null },
  { kanjiCharacter: '愛', meaningText: 'love', additionalInfo: null }
]

export const SEED_READING_GROUPS: SeedReadingGroupData[] = [
  {
    kanjiCharacter: '日',
    readingText: 'ニチ・ジツ',
    meanings: ['sun', 'day']
  }
]

/**
 * Seeds meanings into the database
 */
export function seedMeanings(
  run: (sql: string, params?: unknown[]) => void,
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[]
): number {
  let count = 0
  for (const meaning of SEED_MEANINGS) {
    const result = exec('SELECT id FROM kanjis WHERE character = ?', [
      meaning.kanjiCharacter
    ])
    const kanjiId = result[0]?.values[0]?.[0] as number | undefined

    if (kanjiId) {
      const maxResult = exec(
        'SELECT MAX(display_order) FROM kanji_meanings WHERE kanji_id = ?',
        [kanjiId]
      )
      const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1

      run(
        `INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order)
         VALUES (?, ?, ?, ?)`,
        [kanjiId, meaning.meaningText, meaning.additionalInfo, maxOrder + 1]
      )
      count++
    }
  }
  return count
}

/**
 * Seeds reading groups and assigns meanings to them
 */
export function seedReadingGroups(
  run: (sql: string, params?: unknown[]) => void,
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[]
): number {
  let count = 0
  for (const group of SEED_READING_GROUPS) {
    const kanjiResult = exec('SELECT id FROM kanjis WHERE character = ?', [
      group.kanjiCharacter
    ])
    const kanjiId = kanjiResult[0]?.values[0]?.[0] as number | undefined

    if (!kanjiId) continue

    const maxResult = exec(
      'SELECT MAX(display_order) FROM kanji_meaning_reading_groups WHERE kanji_id = ?',
      [kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1

    run(
      `INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order)
       VALUES (?, ?, ?)`,
      [kanjiId, group.readingText, maxOrder + 1]
    )

    const groupIdResult = exec('SELECT last_insert_rowid() as id')
    const groupId = groupIdResult[0]?.values[0]?.[0] as number | undefined

    if (!groupId) continue

    let memberOrder = 0
    for (const meaningText of group.meanings) {
      const meaningResult = exec(
        'SELECT id FROM kanji_meanings WHERE kanji_id = ? AND meaning_text = ?',
        [kanjiId, meaningText]
      )
      const meaningId = meaningResult[0]?.values[0]?.[0] as number | undefined

      if (meaningId) {
        run(
          `INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order)
           VALUES (?, ?, ?)`,
          [groupId, meaningId, memberOrder]
        )
        memberOrder++
      }
    }

    count++
  }
  return count
}
