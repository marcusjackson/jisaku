/**
 * Classification Seed Data
 *
 * Sample classification assignments for kanji.
 * Maps kanji characters to their rikusho classifications.
 */

export interface SeedClassificationData {
  kanjiCharacter: string
  classificationTypeName: string
  displayOrder: number
}

// Classifications for seed kanji
// Most seed kanji are pictographs since they're elementary-level
export const SEED_CLASSIFICATIONS: SeedClassificationData[] = [
  // 日 (sun) - pictograph
  {
    kanjiCharacter: '日',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 月 (moon) - pictograph
  {
    kanjiCharacter: '月',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 水 (water) - pictograph
  {
    kanjiCharacter: '水',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 火 (fire) - pictograph
  {
    kanjiCharacter: '火',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 木 (tree) - pictograph
  {
    kanjiCharacter: '木',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 金 (gold/metal) - compound ideograph (person + cover + earth + dots = hidden treasure)
  {
    kanjiCharacter: '金',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 土 (earth) - pictograph (mound of earth)
  {
    kanjiCharacter: '土',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 山 (mountain) - pictograph
  {
    kanjiCharacter: '山',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 川 (river) - pictograph
  {
    kanjiCharacter: '川',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 人 (person) - pictograph
  {
    kanjiCharacter: '人',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 空 (sky) - phono-semantic (穴 hole for meaning + 工 for sound)
  {
    kanjiCharacter: '空',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },

  // 海 (sea) - phono-semantic (水 water for meaning + 毎 for sound)
  {
    kanjiCharacter: '海',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },

  // 花 (flower) - phono-semantic (草冠 grass for meaning + 化 for sound)
  {
    kanjiCharacter: '花',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },

  // 愛 (love) - compound ideograph
  {
    kanjiCharacter: '愛',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 夢 (dream) - phono-semantic
  {
    kanjiCharacter: '夢',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },

  // 桜 (cherry blossom) - phono-semantic (木 tree for meaning + 英 for sound)
  {
    kanjiCharacter: '桜',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },

  // 鬱 (depression) - compound ideograph
  {
    kanjiCharacter: '鬱',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 薔 (rose) - phono-semantic
  {
    kanjiCharacter: '薔',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },

  // 森 (forest) - compound ideograph (three trees)
  {
    kanjiCharacter: '森',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 林 (woods) - compound ideograph (two trees)
  {
    kanjiCharacter: '林',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 明 (bright) - compound ideograph (sun + moon)
  {
    kanjiCharacter: '明',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 休 (rest) - compound ideograph (person + tree)
  {
    kanjiCharacter: '休',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 好 (like) - compound ideograph (woman + child)
  {
    kanjiCharacter: '好',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 安 (peaceful) - compound ideograph (woman under roof)
  {
    kanjiCharacter: '安',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },

  // 学 (study) - phono-semantic
  {
    kanjiCharacter: '学',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },

  // 生 (life/birth) - pictograph (plant sprouting from ground)
  {
    kanjiCharacter: '生',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 大 (big) - pictograph (person with arms outstretched)
  {
    kanjiCharacter: '大',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },

  // 小 (small) - pictograph (small grains)
  {
    kanjiCharacter: '小',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  }
]

/**
 * Seeds classification data into the database
 * @param run - function to execute SQL statements
 * @param exec - function to query SQL statements
 * @returns number of classifications seeded
 */
export function seedClassifications(
  run: (sql: string, params?: unknown[]) => void,
  exec: (
    sql: string,
    params?: unknown[]
  ) => { columns: string[]; values: unknown[][] }[]
): number {
  let count = 0

  for (const classification of SEED_CLASSIFICATIONS) {
    // Get kanji ID
    const kanjiResult = exec('SELECT id FROM kanjis WHERE character = ?', [
      classification.kanjiCharacter
    ])
    if (!kanjiResult[0]?.values[0]?.[0]) continue
    const kanjiId = kanjiResult[0].values[0][0] as number

    // Get classification type ID
    const typeResult = exec(
      'SELECT id FROM classification_types WHERE type_name = ?',
      [classification.classificationTypeName]
    )
    if (!typeResult[0]?.values[0]?.[0]) continue
    const typeId = typeResult[0].values[0][0] as number

    run(
      `INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order)
       VALUES (?, ?, ?)`,
      [kanjiId, typeId, classification.displayOrder]
    )
    count++
  }

  return count
}
