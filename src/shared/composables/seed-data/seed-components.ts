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
    character: '扌',
    strokeCount: 3,
    shortMeaning: 'hand',
    searchKeywords: 'てへん, hand radical',
    description: 'Hand radical. Derived from 手.',
    canBeRadical: false
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
    // Look up source kanji ID if specified
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
    ['海', '氵'], // sea contains water radical
    ['花', '艹'], // flower contains grass radical
    ['空', '宀'], // sky contains roof radical
    ['愛', '心'] // love contains heart radical
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

/**
 * Seed data for component forms (visual variants)
 */
export interface SeedComponentFormData {
  componentCharacter: string
  formCharacter: string
  formName: string | null
  strokeCount: number | null
  usageNotes: string | null
}

export const SEED_COMPONENT_FORMS: SeedComponentFormData[] = [
  {
    componentCharacter: '氵',
    formCharacter: '氵',
    formName: 'sanzui (left)',
    strokeCount: 3,
    usageNotes: 'Standard form used on the left side of kanji'
  },
  {
    componentCharacter: '氵',
    formCharacter: '水',
    formName: 'full water',
    strokeCount: 4,
    usageNotes: 'Full form used in standalone positions'
  },
  {
    componentCharacter: '心',
    formCharacter: '心',
    formName: 'kokoro (bottom)',
    strokeCount: 4,
    usageNotes: 'Standard form used at the bottom of kanji'
  },
  {
    componentCharacter: '心',
    formCharacter: '忄',
    formName: 'risshinben (left)',
    strokeCount: 3,
    usageNotes: 'Vertical form used on the left side of kanji'
  },
  {
    componentCharacter: '心',
    formCharacter: '⺗',
    formName: 'shitashinzoko (bottom)',
    strokeCount: 4,
    usageNotes: 'Alternate bottom form with dots'
  }
]

/**
 * Seeds component forms into the database
 */
export function seedComponentForms(
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[],
  run: (sql: string, params?: unknown[]) => void
): number {
  let seeded = 0
  for (let i = 0; i < SEED_COMPONENT_FORMS.length; i++) {
    const form = SEED_COMPONENT_FORMS[i]
    if (!form) continue

    const componentResult = exec(
      'SELECT id FROM components WHERE character = ?',
      [form.componentCharacter]
    )
    const componentId = componentResult[0]?.values[0]?.[0] as number | undefined

    if (componentId) {
      run(
        `INSERT INTO component_forms (component_id, form_character, form_name, stroke_count, usage_notes, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          componentId,
          form.formCharacter,
          form.formName,
          form.strokeCount,
          form.usageNotes,
          i
        ]
      )
      seeded++
    }
  }
  return seeded
}

/**
 * Seed data for component groupings (pattern analysis groups)
 */
export interface SeedComponentGroupingData {
  componentCharacter: string
  name: string
  description: string | null
  memberKanji: string[] // kanji characters whose occurrences should be added
}

export const SEED_COMPONENT_GROUPINGS: SeedComponentGroupingData[] = [
  {
    componentCharacter: '氵',
    name: 'Water-related meanings',
    description:
      'Kanji where the water radical indicates water/liquid semantics',
    memberKanji: ['海']
  }
]

/**
 * Seeds component groupings into the database
 */
export function seedComponentGroupings(
  exec: (sql: string, params?: unknown[]) => { values: unknown[][] }[],
  run: (sql: string, params?: unknown[]) => void
): number {
  let seeded = 0
  for (let i = 0; i < SEED_COMPONENT_GROUPINGS.length; i++) {
    const grouping = SEED_COMPONENT_GROUPINGS[i]
    if (!grouping) continue

    const componentResult = exec(
      'SELECT id FROM components WHERE character = ?',
      [grouping.componentCharacter]
    )
    const componentId = componentResult[0]?.values[0]?.[0] as number | undefined

    if (componentId) {
      run(
        `INSERT INTO component_groupings (component_id, name, description, display_order)
         VALUES (?, ?, ?, ?)`,
        [componentId, grouping.name, grouping.description, i]
      )

      // Get the new grouping ID
      const groupingIdResult = exec('SELECT last_insert_rowid() as id')
      const groupingId = groupingIdResult[0]?.values[0]?.[0] as
        | number
        | undefined

      if (groupingId) {
        // Add members
        for (let j = 0; j < grouping.memberKanji.length; j++) {
          const kanjiChar = grouping.memberKanji[j]
          if (!kanjiChar) continue

          // Find the occurrence ID for this kanji-component pair
          const occResult = exec(
            `SELECT co.id FROM component_occurrences co
             JOIN kanjis k ON k.id = co.kanji_id
             WHERE co.component_id = ? AND k.character = ?`,
            [componentId, kanjiChar]
          )
          const occurrenceId = occResult[0]?.values[0]?.[0] as
            | number
            | undefined

          if (occurrenceId) {
            run(
              `INSERT INTO component_grouping_members (grouping_id, occurrence_id, display_order)
               VALUES (?, ?, ?)`,
              [groupingId, occurrenceId, j]
            )
          }
        }
      }

      seeded++
    }
  }
  return seeded
}
