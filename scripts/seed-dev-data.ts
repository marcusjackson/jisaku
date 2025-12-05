/**
 * Development Seed Data Script
 *
 * Seeds the database with sample kanji data for development and testing.
 * This script can be imported and called from the app or run directly.
 *
 * Usage in app:
 *   import { seedDevData } from '@/scripts/seed-dev-data'
 *   await seedDevData(db)
 *
 * The seed data includes common kanji at various JLPT levels.
 */

import type { Database } from 'sql.js'

interface SeedKanji {
  character: string
  strokeCount: number
  jlptLevel: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | null
  joyoLevel:
    | 'elementary1'
    | 'elementary2'
    | 'elementary3'
    | 'elementary4'
    | 'elementary5'
    | 'elementary6'
    | 'secondary'
    | null
  notesPersonal: string | null
}

/**
 * Sample kanji data for seeding
 */
const SEED_KANJI: SeedKanji[] = [
  // N5 Kanji (elementary)
  {
    character: '日',
    strokeCount: 4,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Sun, day. One of the most fundamental kanji.'
  },
  {
    character: '月',
    strokeCount: 4,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Moon, month. Pictograph of a crescent moon.'
  },
  {
    character: '水',
    strokeCount: 4,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Water. Pictograph of flowing water.'
  },
  {
    character: '火',
    strokeCount: 4,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Fire. Pictograph of flames.'
  },
  {
    character: '木',
    strokeCount: 4,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Tree, wood. Pictograph of a tree.'
  },
  {
    character: '金',
    strokeCount: 8,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Gold, metal, money.'
  },
  {
    character: '土',
    strokeCount: 3,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Earth, soil, ground.'
  },
  {
    character: '山',
    strokeCount: 3,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Mountain. Pictograph of three peaks.'
  },
  {
    character: '川',
    strokeCount: 3,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'River. Pictograph of flowing water between banks.'
  },
  {
    character: '人',
    strokeCount: 2,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    notesPersonal: 'Person. Pictograph of a standing person.'
  },

  // N4 Kanji
  {
    character: '空',
    strokeCount: 8,
    jlptLevel: 'N4',
    joyoLevel: 'elementary1',
    notesPersonal: 'Sky, empty. Represents openness above.'
  },
  {
    character: '海',
    strokeCount: 9,
    jlptLevel: 'N4',
    joyoLevel: 'elementary2',
    notesPersonal: 'Sea, ocean. Contains the water radical.'
  },
  {
    character: '花',
    strokeCount: 7,
    jlptLevel: 'N4',
    joyoLevel: 'elementary1',
    notesPersonal: 'Flower. Contains the grass radical.'
  },
  {
    character: '愛',
    strokeCount: 13,
    jlptLevel: 'N3',
    joyoLevel: 'elementary4',
    notesPersonal: 'Love, affection. Contains the heart radical.'
  },

  // N2 Kanji
  {
    character: '夢',
    strokeCount: 13,
    jlptLevel: 'N2',
    joyoLevel: 'elementary5',
    notesPersonal: 'Dream.'
  },
  {
    character: '桜',
    strokeCount: 10,
    jlptLevel: 'N2',
    joyoLevel: 'elementary5',
    notesPersonal: 'Cherry blossom. Iconic symbol of Japan.'
  },

  // N1 Kanji
  {
    character: '鬱',
    strokeCount: 29,
    jlptLevel: 'N1',
    joyoLevel: 'secondary',
    notesPersonal:
      'Depression, melancholy. One of the most complex common kanji.'
  },
  {
    character: '薔',
    strokeCount: 16,
    jlptLevel: 'N1',
    joyoLevel: null,
    notesPersonal: 'Rose (part of 薔薇 - bara).'
  }
]

/**
 * Seed the database with development data
 */
export function seedDevData(db: Database): void {
  // Check if data already exists
  const countResult = db.exec('SELECT COUNT(*) as count FROM kanjis')
  const count = countResult[0]?.values[0]?.[0] as number
  if (count > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `Database already has ${String(count)} kanji entries. Skipping seed.`
    )
    return
  }

  // eslint-disable-next-line no-console
  console.log('Seeding development data...')

  for (const kanji of SEED_KANJI) {
    db.run(
      `INSERT INTO kanjis (character, stroke_count, jlpt_level, joyo_level, notes_personal)
       VALUES (?, ?, ?, ?, ?)`,
      [
        kanji.character,
        kanji.strokeCount,
        kanji.jlptLevel,
        kanji.joyoLevel,
        kanji.notesPersonal
      ]
    )
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${String(SEED_KANJI.length)} kanji entries.`)
}

/**
 * Clear all kanji data from the database
 */
export function clearKanjiData(db: Database): void {
  db.run('DELETE FROM kanji_components')
  db.run('DELETE FROM kanjis')
  // eslint-disable-next-line no-console
  console.log('Cleared all kanji data.')
}

// =============================================================================
// Radical Seed Data
// =============================================================================

interface SeedRadical {
  character: string
  strokeCount: number
  number: number // Kangxi radical number (1-214)
  meaning: string | null
  japaneseName: string | null
}

/**
 * Sample Kangxi radical data for seeding
 * Selected common radicals that appear in N5-N3 kanji
 */
const SEED_RADICALS: SeedRadical[] = [
  {
    character: '一',
    strokeCount: 1,
    number: 1,
    meaning: 'one',
    japaneseName: 'いち'
  },
  {
    character: '人',
    strokeCount: 2,
    number: 9,
    meaning: 'person',
    japaneseName: 'ひと'
  },
  {
    character: '口',
    strokeCount: 3,
    number: 30,
    meaning: 'mouth',
    japaneseName: 'くち'
  },
  {
    character: '土',
    strokeCount: 3,
    number: 32,
    meaning: 'earth',
    japaneseName: 'つち'
  },
  {
    character: '大',
    strokeCount: 3,
    number: 37,
    meaning: 'big',
    japaneseName: 'だい'
  },
  {
    character: '女',
    strokeCount: 3,
    number: 38,
    meaning: 'woman',
    japaneseName: 'おんな'
  },
  {
    character: '子',
    strokeCount: 3,
    number: 39,
    meaning: 'child',
    japaneseName: 'こ'
  },
  {
    character: '山',
    strokeCount: 3,
    number: 46,
    meaning: 'mountain',
    japaneseName: 'やま'
  },
  {
    character: '川',
    strokeCount: 3,
    number: 47,
    meaning: 'river',
    japaneseName: 'かわ'
  },
  {
    character: '心',
    strokeCount: 4,
    number: 61,
    meaning: 'heart',
    japaneseName: 'こころ'
  },
  {
    character: '手',
    strokeCount: 4,
    number: 64,
    meaning: 'hand',
    japaneseName: 'て'
  },
  {
    character: '日',
    strokeCount: 4,
    number: 72,
    meaning: 'sun/day',
    japaneseName: 'ひ'
  },
  {
    character: '月',
    strokeCount: 4,
    number: 74,
    meaning: 'moon/month',
    japaneseName: 'つき'
  },
  {
    character: '木',
    strokeCount: 4,
    number: 75,
    meaning: 'tree',
    japaneseName: 'き'
  },
  {
    character: '水',
    strokeCount: 4,
    number: 85,
    meaning: 'water',
    japaneseName: 'みず'
  },
  {
    character: '火',
    strokeCount: 4,
    number: 86,
    meaning: 'fire',
    japaneseName: 'ひ'
  },
  {
    character: '田',
    strokeCount: 5,
    number: 102,
    meaning: 'rice field',
    japaneseName: 'た'
  },
  {
    character: '目',
    strokeCount: 5,
    number: 109,
    meaning: 'eye',
    japaneseName: 'め'
  },
  {
    character: '糸',
    strokeCount: 6,
    number: 120,
    meaning: 'thread',
    japaneseName: 'いと'
  },
  {
    character: '言',
    strokeCount: 7,
    number: 149,
    meaning: 'speech',
    japaneseName: 'ごん'
  },
  {
    character: '車',
    strokeCount: 7,
    number: 159,
    meaning: 'cart/vehicle',
    japaneseName: 'くるま'
  },
  {
    character: '金',
    strokeCount: 8,
    number: 167,
    meaning: 'gold/metal',
    japaneseName: 'かね'
  },
  {
    character: '門',
    strokeCount: 8,
    number: 169,
    meaning: 'gate',
    japaneseName: 'もん'
  },
  {
    character: '食',
    strokeCount: 9,
    number: 184,
    meaning: 'food/eat',
    japaneseName: 'しょく'
  }
]

/**
 * Seed the database with radical development data
 */
export function seedRadicalData(db: Database): void {
  // Check if data already exists
  const countResult = db.exec('SELECT COUNT(*) as count FROM radicals')
  const count = countResult[0]?.values[0]?.[0] as number
  if (count > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `Database already has ${String(count)} radical entries. Skipping seed.`
    )
    return
  }

  // eslint-disable-next-line no-console
  console.log('Seeding radical development data...')

  for (const radical of SEED_RADICALS) {
    db.run(
      `INSERT INTO radicals (character, stroke_count, number, meaning, japanese_name)
       VALUES (?, ?, ?, ?, ?)`,
      [
        radical.character,
        radical.strokeCount,
        radical.number,
        radical.meaning,
        radical.japaneseName
      ]
    )
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${String(SEED_RADICALS.length)} radical entries.`)
}

/**
 * Clear all radical data from the database
 */
export function clearRadicalData(db: Database): void {
  db.run('DELETE FROM radicals')
  // eslint-disable-next-line no-console
  console.log('Cleared all radical data.')
}

// =============================================================================
// Component Seed Data
// =============================================================================

interface SeedComponent {
  character: string
  strokeCount: number
  descriptionShort: string | null
  japaneseName: string | null
  description: string | null
  sourceKanjiCharacter?: string | null
}

/**
 * Sample component data for seeding
 */
const SEED_COMPONENTS: SeedComponent[] = [
  {
    character: '亻',
    strokeCount: 2,
    descriptionShort: 'person',
    japaneseName: 'にんべん',
    description: 'Person/human radical. Derived from 人.',
    sourceKanjiCharacter: '人'
  },
  {
    character: '氵',
    strokeCount: 3,
    descriptionShort: 'water',
    japaneseName: 'さんずい',
    description: 'Water radical. Derived from 水.',
    sourceKanjiCharacter: '水'
  },
  {
    character: '扌',
    strokeCount: 3,
    descriptionShort: 'hand',
    japaneseName: 'てへん',
    description: 'Hand radical. Derived from 手.'
  },
  {
    character: '口',
    strokeCount: 3,
    descriptionShort: 'mouth',
    japaneseName: 'くち',
    description: 'Mouth radical. Also means opening or entrance.'
  },
  {
    character: '女',
    strokeCount: 3,
    descriptionShort: 'woman',
    japaneseName: 'おんな',
    description: 'Woman/female radical.'
  },
  {
    character: '艹',
    strokeCount: 3,
    descriptionShort: 'grass',
    japaneseName: 'くさかんむり',
    description: 'Grass/plant radical. Appears at top of characters.'
  },
  {
    character: '宀',
    strokeCount: 3,
    descriptionShort: 'roof',
    japaneseName: 'うかんむり',
    description: 'Roof/house radical. Indicates shelter or building.'
  },
  {
    character: '心',
    strokeCount: 4,
    descriptionShort: 'heart',
    japaneseName: 'こころ',
    description: 'Heart/mind radical. Indicates emotions or thoughts.'
  },
  {
    character: '忄',
    strokeCount: 3,
    descriptionShort: 'heart (left)',
    japaneseName: 'りっしんべん',
    description: 'Heart radical variant. Used on the left side of characters.'
  },
  {
    character: '木',
    strokeCount: 4,
    descriptionShort: 'tree',
    japaneseName: 'き',
    description: 'Tree/wood radical. Indicates plants or wooden objects.'
  },
  {
    character: '言',
    strokeCount: 7,
    descriptionShort: 'speech',
    japaneseName: 'ごんべん',
    description: 'Speech/words radical. Indicates language or communication.'
  },
  {
    character: '金',
    strokeCount: 8,
    descriptionShort: 'metal',
    japaneseName: 'かね',
    description: 'Metal/gold radical. Indicates metals or money.'
  }
]

/**
 * Seed the database with component development data
 */
export function seedComponentData(db: Database): void {
  // Check if data already exists
  const countResult = db.exec('SELECT COUNT(*) as count FROM components')
  const count = countResult[0]?.values[0]?.[0] as number
  if (count > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `Database already has ${String(count)} component entries. Skipping seed.`
    )
    return
  }

  // eslint-disable-next-line no-console
  console.log('Seeding component development data...')

  for (const component of SEED_COMPONENTS) {
    // Look up source kanji ID if specified
    let sourceKanjiId: number | null = null
    if (component.sourceKanjiCharacter) {
      const result = db.exec('SELECT id FROM kanjis WHERE character = ?', [
        component.sourceKanjiCharacter
      ])
      sourceKanjiId = (result[0]?.values[0]?.[0] as number | undefined) ?? null
    }

    db.run(
      `INSERT INTO components (character, stroke_count, description_short, japanese_name, description, source_kanji_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        component.character,
        component.strokeCount,
        component.descriptionShort,
        component.japaneseName,
        component.description,
        sourceKanjiId
      ]
    )
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${String(SEED_COMPONENTS.length)} component entries.`)

  // Seed kanji_components links
  seedKanjiComponentLinks(db)
}

/**
 * Seed links between kanji and their components
 */
function seedKanjiComponentLinks(db: Database): void {
  // Define which kanji use which components
  // Format: [kanjiCharacter, componentCharacter]
  const links: [string, string][] = [
    // 海 (sea) contains 氵 (water radical)
    ['海', '氵'],
    // 花 (flower) contains 艹 (grass radical)
    ['花', '艹'],
    // 空 (sky/empty) contains 宀 (roof radical)
    ['空', '宀'],
    // 愛 (love) contains 心 (heart)
    ['愛', '心']
  ]

  let linkedCount = 0
  for (const [kanjiChar, componentChar] of links) {
    // Look up kanji ID
    const kanjiResult = db.exec('SELECT id FROM kanjis WHERE character = ?', [
      kanjiChar
    ])
    const kanjiId = kanjiResult[0]?.values[0]?.[0] as number | undefined

    // Look up component ID
    const componentResult = db.exec(
      'SELECT id FROM components WHERE character = ?',
      [componentChar]
    )
    const componentId = componentResult[0]?.values[0]?.[0] as number | undefined

    if (kanjiId && componentId) {
      db.run(
        'INSERT INTO kanji_components (kanji_id, component_id) VALUES (?, ?)',
        [kanjiId, componentId]
      )
      linkedCount++
    }
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${String(linkedCount)} kanji-component links.`)
}

/**
 * Clear all component data from the database
 */
export function clearComponentData(db: Database): void {
  db.run('DELETE FROM kanji_components')
  db.run('DELETE FROM components')
  // eslint-disable-next-line no-console
  console.log('Cleared all component data.')
}
