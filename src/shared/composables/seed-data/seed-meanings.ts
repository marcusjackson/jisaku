/**
 * Meanings Seed Data
 *
 * Sample meanings for development and testing.
 * Includes both ungrouped meanings and grouped-by-reading examples.
 */

export interface SeedMeaningData {
  kanjiCharacter: string
  meaningText: string
  additionalInfo: string | null
}

export interface SeedReadingGroupData {
  kanjiCharacter: string
  readingText: string
  meanings: string[] // List of meaning texts to assign to this group
}

/**
 * Simple ungrouped meanings for most kanji
 */
export const SEED_MEANINGS: SeedMeaningData[] = [
  // 日 - sun, day (will be grouped)
  {
    kanjiCharacter: '日',
    meaningText: 'sun',
    additionalInfo: 'The star at the center of our solar system'
  },
  {
    kanjiCharacter: '日',
    meaningText: 'day',
    additionalInfo: 'A 24-hour period'
  },
  {
    kanjiCharacter: '日',
    meaningText: 'Japan',
    additionalInfo: 'Used in 日本 (Nihon/Nippon)'
  },
  // 月 - moon, month
  {
    kanjiCharacter: '月',
    meaningText: 'moon',
    additionalInfo: "Earth's natural satellite"
  },
  {
    kanjiCharacter: '月',
    meaningText: 'month',
    additionalInfo: 'Calendar month'
  },
  // 水 - water
  {
    kanjiCharacter: '水',
    meaningText: 'water',
    additionalInfo: 'H2O; liquid essential for life'
  },
  {
    kanjiCharacter: '水',
    meaningText: 'Wednesday',
    additionalInfo: '水曜日 (suiyōbi)'
  },
  // 火 - fire
  {
    kanjiCharacter: '火',
    meaningText: 'fire',
    additionalInfo: 'Combustion, flames'
  },
  {
    kanjiCharacter: '火',
    meaningText: 'Tuesday',
    additionalInfo: '火曜日 (kayōbi)'
  },
  // 木 - tree, wood
  {
    kanjiCharacter: '木',
    meaningText: 'tree',
    additionalInfo: 'Living plant with trunk and branches'
  },
  {
    kanjiCharacter: '木',
    meaningText: 'wood',
    additionalInfo: 'Material from trees'
  },
  {
    kanjiCharacter: '木',
    meaningText: 'Thursday',
    additionalInfo: '木曜日 (mokuyōbi)'
  },
  // 金 - gold, metal, money
  {
    kanjiCharacter: '金',
    meaningText: 'gold',
    additionalInfo: 'Precious metal, Au'
  },
  {
    kanjiCharacter: '金',
    meaningText: 'metal',
    additionalInfo: 'General metallic element'
  },
  {
    kanjiCharacter: '金',
    meaningText: 'money',
    additionalInfo: 'Currency, cash'
  },
  {
    kanjiCharacter: '金',
    meaningText: 'Friday',
    additionalInfo: '金曜日 (kinyōbi)'
  },
  // 土 - earth, soil
  {
    kanjiCharacter: '土',
    meaningText: 'earth',
    additionalInfo: 'Ground, soil'
  },
  {
    kanjiCharacter: '土',
    meaningText: 'soil',
    additionalInfo: 'Dirt, ground material'
  },
  {
    kanjiCharacter: '土',
    meaningText: 'Saturday',
    additionalInfo: '土曜日 (doyōbi)'
  },
  // 山 - mountain
  {
    kanjiCharacter: '山',
    meaningText: 'mountain',
    additionalInfo: 'Large natural elevation'
  },
  // 川 - river
  {
    kanjiCharacter: '川',
    meaningText: 'river',
    additionalInfo: 'Flowing body of water'
  },
  // 人 - person
  {
    kanjiCharacter: '人',
    meaningText: 'person',
    additionalInfo: 'Human being'
  },
  {
    kanjiCharacter: '人',
    meaningText: 'people',
    additionalInfo: 'Human beings collectively'
  },
  // 空 - sky, empty
  {
    kanjiCharacter: '空',
    meaningText: 'sky',
    additionalInfo: 'The atmosphere above'
  },
  {
    kanjiCharacter: '空',
    meaningText: 'empty',
    additionalInfo: 'Containing nothing, void'
  },
  {
    kanjiCharacter: '空',
    meaningText: 'vacant',
    additionalInfo: 'Not occupied'
  },
  // 海 - sea
  {
    kanjiCharacter: '海',
    meaningText: 'sea',
    additionalInfo: 'Large body of salt water'
  },
  {
    kanjiCharacter: '海',
    meaningText: 'ocean',
    additionalInfo: 'Vast expanse of salt water'
  },
  // 花 - flower
  {
    kanjiCharacter: '花',
    meaningText: 'flower',
    additionalInfo: 'Bloom, blossom'
  },
  {
    kanjiCharacter: '花',
    meaningText: 'blossom',
    additionalInfo: 'The flowering part of a plant'
  },
  // 愛 - love
  {
    kanjiCharacter: '愛',
    meaningText: 'love',
    additionalInfo: 'Deep affection'
  },
  {
    kanjiCharacter: '愛',
    meaningText: 'affection',
    additionalInfo: 'Tender attachment'
  }
]

/**
 * Grouped meanings example - 日 kanji grouped by reading
 * This demonstrates the reading group feature
 */
export const SEED_READING_GROUPS: SeedReadingGroupData[] = [
  {
    kanjiCharacter: '日',
    readingText: 'ニチ・ジツ',
    meanings: ['sun', 'day']
  },
  {
    kanjiCharacter: '日',
    readingText: 'ひ・か',
    meanings: ['Japan']
  }
]

/**
 * Seeds meanings into the database
 * @param run - function to execute SQL statements
 * @param exec - function to execute SQL queries
 * @returns number of meanings seeded
 */
export function seedMeanings(
  run: (sql: string, params?: unknown[]) => void,
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[]
): number {
  let count = 0
  for (const meaning of SEED_MEANINGS) {
    // Get kanji ID by character
    const result = exec('SELECT id FROM kanjis WHERE character = ?', [
      meaning.kanjiCharacter
    ])
    const kanjiId = result[0]?.values[0]?.[0] as number | undefined

    if (kanjiId) {
      // Get current max display_order for this kanji
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
 * @param run - function to execute SQL statements
 * @param exec - function to execute SQL queries
 * @returns number of groups seeded
 */
export function seedReadingGroups(
  run: (sql: string, params?: unknown[]) => void,
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[]
): number {
  let count = 0
  for (const group of SEED_READING_GROUPS) {
    // Get kanji ID by character
    const kanjiResult = exec('SELECT id FROM kanjis WHERE character = ?', [
      group.kanjiCharacter
    ])
    const kanjiId = kanjiResult[0]?.values[0]?.[0] as number | undefined

    if (!kanjiId) continue

    // Get current max display_order for groups for this kanji
    const maxResult = exec(
      'SELECT MAX(display_order) FROM kanji_meaning_reading_groups WHERE kanji_id = ?',
      [kanjiId]
    )
    const maxOrder = (maxResult[0]?.values[0]?.[0] as number | null) ?? -1

    // Create reading group
    run(
      `INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order)
       VALUES (?, ?, ?)`,
      [kanjiId, group.readingText, maxOrder + 1]
    )

    // Get newly created group ID
    const groupIdResult = exec('SELECT last_insert_rowid() as id')
    const groupId = groupIdResult[0]?.values[0]?.[0] as number | undefined

    if (!groupId) continue

    // Assign meanings to group
    let memberOrder = 0
    for (const meaningText of group.meanings) {
      // Find meaning by text for this kanji
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
