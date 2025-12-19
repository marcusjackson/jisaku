/**
 * Position Types Seed Data
 *
 * Reference data for component position types.
 * These describe where components appear within kanji characters.
 */

export interface SeedPositionTypeData {
  positionName: string
  nameJapanese: string
  nameEnglish: string
  description: string
  descriptionShort: string
}

export const SEED_POSITION_TYPES: SeedPositionTypeData[] = [
  {
    positionName: 'hen',
    nameJapanese: 'へん',
    nameEnglish: 'left side',
    description: 'Component appears on the left side of the kanji character',
    descriptionShort: 'Left side'
  },
  {
    positionName: 'tsukuri',
    nameJapanese: 'つくり',
    nameEnglish: 'right side',
    description: 'Component appears on the right side of the kanji character',
    descriptionShort: 'Right side'
  },
  {
    positionName: 'kanmuri',
    nameJapanese: 'かんむり',
    nameEnglish: 'top',
    description:
      'Component appears at the top of the kanji character, covering it like a crown',
    descriptionShort: 'Top'
  },
  {
    positionName: 'ashi',
    nameJapanese: 'あし',
    nameEnglish: 'bottom',
    description:
      'Component appears at the bottom of the kanji character, supporting it like legs',
    descriptionShort: 'Bottom'
  },
  {
    positionName: 'tare',
    nameJapanese: 'たれ',
    nameEnglish: 'hanging',
    description: 'Component hangs from the top and wraps around the left side',
    descriptionShort: 'Hanging from top-left'
  },
  {
    positionName: 'nyou',
    nameJapanese: 'にょう',
    nameEnglish: 'enclosure',
    description: 'Component wraps around the bottom and left side of the kanji',
    descriptionShort: 'Bottom-left enclosure'
  },
  {
    positionName: 'kamae',
    nameJapanese: 'かまえ',
    nameEnglish: 'enclosure',
    description: 'Component completely or partially encloses the kanji',
    descriptionShort: 'Enclosure'
  },
  {
    positionName: 'other',
    nameJapanese: 'その他',
    nameEnglish: 'other',
    description:
      'Component appears in an unusual or mixed position that does not fit standard categories',
    descriptionShort: 'Other position'
  }
]

/**
 * Seeds position types into the database
 * @param run - function to execute SQL statements
 * @returns number of position types seeded
 */
export function seedPositionTypes(
  run: (sql: string, params?: unknown[]) => void
): number {
  SEED_POSITION_TYPES.forEach((pt, i) => {
    run(
      `INSERT INTO position_types (position_name, name_japanese, name_english, description, description_short, display_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        pt.positionName,
        pt.nameJapanese,
        pt.nameEnglish,
        pt.description,
        pt.descriptionShort,
        i + 1
      ]
    )
  })
  return SEED_POSITION_TYPES.length
}
