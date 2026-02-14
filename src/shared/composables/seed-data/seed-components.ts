/**
 * Component Seed Data
 *
 * Sample component data for development and testing.
 * Includes radical information for components that can serve as radicals.
 */

export interface SeedComponentData {
  character: string
  strokeCount: number
  shortMeaning: string
  searchKeywords: string
  description: string
  sourceKanjiCharacter?: string
  canBeRadical: boolean
  kangxiNumber?: number
  kangxiMeaning?: string
  radicalNameJapanese?: string
}

export const SEED_COMPONENTS: SeedComponentData[] = [
  {
    character: '亻',
    strokeCount: 2,
    shortMeaning: 'person',
    searchKeywords: 'にんべん, person radical',
    description: 'Person/human radical. Derived from 人.',
    sourceKanjiCharacter: '人',
    canBeRadical: true,
    kangxiNumber: 9,
    kangxiMeaning: 'person',
    radicalNameJapanese: 'にんべん'
  },
  {
    character: '氵',
    strokeCount: 3,
    shortMeaning: 'water',
    searchKeywords: 'さんずい, water radical',
    description: 'Water radical. Derived from 水.',
    sourceKanjiCharacter: '水',
    canBeRadical: true,
    kangxiNumber: 85,
    kangxiMeaning: 'water',
    radicalNameJapanese: 'さんずい'
  },
  {
    character: '口',
    strokeCount: 3,
    shortMeaning: 'mouth',
    searchKeywords: 'くち, mouth radical',
    description: 'Mouth radical. Also means opening or entrance.',
    canBeRadical: true,
    kangxiNumber: 30,
    kangxiMeaning: 'mouth',
    radicalNameJapanese: 'くち'
  },
  {
    character: '女',
    strokeCount: 3,
    shortMeaning: 'woman',
    searchKeywords: 'おんな, woman radical',
    description: 'Woman/female radical.',
    canBeRadical: true,
    kangxiNumber: 38,
    kangxiMeaning: 'woman',
    radicalNameJapanese: 'おんな'
  },
  {
    character: '艹',
    strokeCount: 3,
    shortMeaning: 'grass',
    searchKeywords: 'くさかんむり, grass radical',
    description: 'Grass/plant radical. Appears at top of characters.',
    canBeRadical: true,
    kangxiNumber: 140,
    kangxiMeaning: 'grass',
    radicalNameJapanese: 'くさかんむり'
  },
  {
    character: '宀',
    strokeCount: 3,
    shortMeaning: 'roof',
    searchKeywords: 'うかんむり, roof radical',
    description: 'Roof/house radical. Indicates shelter or building.',
    canBeRadical: true,
    kangxiNumber: 40,
    kangxiMeaning: 'roof',
    radicalNameJapanese: 'うかんむり'
  },
  {
    character: '心',
    strokeCount: 4,
    shortMeaning: 'heart',
    searchKeywords: 'こころ, heart radical',
    description: 'Heart/mind radical. Indicates emotions or thoughts.',
    canBeRadical: true,
    kangxiNumber: 61,
    kangxiMeaning: 'heart',
    radicalNameJapanese: 'こころ'
  },
  {
    character: '木',
    strokeCount: 4,
    shortMeaning: 'tree',
    searchKeywords: 'き, tree radical',
    description: 'Tree/wood radical.',
    canBeRadical: true,
    kangxiNumber: 75,
    kangxiMeaning: 'tree',
    radicalNameJapanese: 'き'
  }
]

/**
 * Seeds component data into the database
 * @param exec - function to execute SQL queries that return results
 * @param run - function to execute SQL statements
 * @returns number of components seeded
 */
export function seedComponents(
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[],
  run: (sql: string, params?: unknown[]) => void
): number {
  for (const component of SEED_COMPONENTS) {
    let sourceKanjiId: number | null = null
    if (component.sourceKanjiCharacter) {
      const result = exec('SELECT id FROM kanjis WHERE character = ?', [
        component.sourceKanjiCharacter
      ])
      sourceKanjiId = (result[0]?.values[0]?.[0] as number | undefined) ?? null
    }

    run(
      `INSERT INTO components (character, stroke_count, short_meaning, search_keywords, description, source_kanji_id, can_be_radical, kangxi_number, kangxi_meaning, radical_name_japanese)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        component.character,
        component.strokeCount,
        component.shortMeaning,
        component.searchKeywords,
        component.description,
        sourceKanjiId,
        component.canBeRadical ? 1 : 0,
        component.kangxiNumber ?? null,
        component.kangxiMeaning ?? null,
        component.radicalNameJapanese ?? null
      ]
    )
  }
  return SEED_COMPONENTS.length
}

/**
 * Seeds kanji-component relationships into the database
 * @param exec - function to execute SQL queries that return results
 * @param run - function to execute SQL statements
 */
export function seedComponentOccurrences(
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[],
  run: (sql: string, params?: unknown[]) => void
): void {
  const links: [string, string][] = [
    ['海', '氵'],
    ['花', '艹'],
    ['空', '宀'],
    ['愛', '心']
  ]

  for (const [kanjiChar, componentChar] of links) {
    const kanjiResult = exec('SELECT id FROM kanjis WHERE character = ?', [
      kanjiChar
    ])
    const kanjiId = kanjiResult[0]?.values[0]?.[0] as number | undefined

    const componentResult = exec(
      'SELECT id FROM components WHERE character = ?',
      [componentChar]
    )
    const compId = componentResult[0]?.values[0]?.[0] as number | undefined

    if (kanjiId && compId) {
      run(
        'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
        [kanjiId, compId, 0]
      )
    }
  }
}
