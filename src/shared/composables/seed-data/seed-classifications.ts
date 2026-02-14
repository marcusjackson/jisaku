/**
 * Classification Seed Data
 *
 * Sample classification assignments for kanji.
 */

export interface SeedClassificationData {
  kanjiCharacter: string
  classificationTypeName: string
  displayOrder: number
}

export const SEED_CLASSIFICATIONS: SeedClassificationData[] = [
  {
    kanjiCharacter: '日',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '月',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '水',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '火',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '木',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '金',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '土',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '山',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '川',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '人',
    classificationTypeName: 'pictograph',
    displayOrder: 0
  },
  {
    kanjiCharacter: '空',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },
  {
    kanjiCharacter: '海',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },
  {
    kanjiCharacter: '花',
    classificationTypeName: 'phono_semantic',
    displayOrder: 0
  },
  {
    kanjiCharacter: '愛',
    classificationTypeName: 'compound_ideograph',
    displayOrder: 0
  }
]

/**
 * Seeds classification data into the database
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
    const kanjiResult = exec('SELECT id FROM kanjis WHERE character = ?', [
      classification.kanjiCharacter
    ])
    if (!kanjiResult[0]?.values[0]?.[0]) continue
    const kanjiId = kanjiResult[0].values[0][0] as number

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
