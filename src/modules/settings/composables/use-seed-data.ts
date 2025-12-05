/**
 * useSeedData
 *
 * Composable for seeding and clearing development data.
 * Used in settings page for developer tools.
 */

import { ref } from 'vue'

import { useDatabase } from '@/shared/composables/use-database'
import { useToast } from '@/shared/composables/use-toast'

// Sample kanji data for seeding
const SEED_KANJI = [
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

// Sample component data for seeding
const SEED_COMPONENTS = [
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
  }
]

// Sample Kangxi radicals for seeding
const SEED_RADICALS = [
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
    character: '女',
    strokeCount: 3,
    number: 38,
    meaning: 'woman',
    japaneseName: 'おんな'
  },
  {
    character: '山',
    strokeCount: 3,
    number: 46,
    meaning: 'mountain',
    japaneseName: 'やま'
  },
  {
    character: '心',
    strokeCount: 4,
    number: 61,
    meaning: 'heart',
    japaneseName: 'こころ'
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
    character: '金',
    strokeCount: 8,
    number: 167,
    meaning: 'gold/metal',
    japaneseName: 'かね'
  }
]

export function useSeedData() {
  const { exec, persist, run } = useDatabase()
  const { error: showError, success: showSuccess } = useToast()

  const isSeeding = ref(false)
  const isClearing = ref(false)

  async function seed() {
    if (isSeeding.value) return

    isSeeding.value = true
    try {
      let seededKanji = 0
      let seededComponents = 0
      let seededRadicals = 0

      // Seed radicals first (they are referenced by kanji)
      const radicalCountResult = exec('SELECT COUNT(*) as count FROM radicals')
      const radicalCount = radicalCountResult[0]?.values[0]?.[0]
      if (typeof radicalCount === 'number' && radicalCount === 0) {
        for (const radical of SEED_RADICALS) {
          run(
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
        seededRadicals = SEED_RADICALS.length
      }

      // Seed kanji
      const kanjiCountResult = exec('SELECT COUNT(*) as count FROM kanjis')
      const kanjiCount = kanjiCountResult[0]?.values[0]?.[0]
      if (typeof kanjiCount === 'number' && kanjiCount === 0) {
        for (const kanji of SEED_KANJI) {
          run(
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
        seededKanji = SEED_KANJI.length
      }

      // Seed components
      const componentCountResult = exec(
        'SELECT COUNT(*) as count FROM components'
      )
      const componentCount = componentCountResult[0]?.values[0]?.[0]
      if (typeof componentCount === 'number' && componentCount === 0) {
        for (const component of SEED_COMPONENTS) {
          // Look up source kanji ID if specified
          let sourceKanjiId: number | null = null
          if (component.sourceKanjiCharacter) {
            const result = exec('SELECT id FROM kanjis WHERE character = ?', [
              component.sourceKanjiCharacter
            ])
            sourceKanjiId =
              (result[0]?.values[0]?.[0] as number | undefined) ?? null
          }

          run(
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
        seededComponents = SEED_COMPONENTS.length

        // Seed kanji-component links
        const links: [string, string][] = [
          ['海', '氵'], // sea contains water radical
          ['花', '艹'], // flower contains grass radical
          ['空', '宀'], // sky contains roof radical
          ['愛', '心'] // love contains heart radical
        ]

        for (const [kanjiChar, componentChar] of links) {
          const kanjiResult = exec(
            'SELECT id FROM kanjis WHERE character = ?',
            [kanjiChar]
          )
          const kanjiId = kanjiResult[0]?.values[0]?.[0] as number | undefined

          const componentResult = exec(
            'SELECT id FROM components WHERE character = ?',
            [componentChar]
          )
          const compId = componentResult[0]?.values[0]?.[0] as
            | number
            | undefined

          if (kanjiId && compId) {
            run(
              'INSERT INTO kanji_components (kanji_id, component_id) VALUES (?, ?)',
              [kanjiId, compId]
            )
          }
        }
      }

      if (seededKanji === 0 && seededComponents === 0 && seededRadicals === 0) {
        showError('Database already has data')
        return
      }

      await persist()
      const messages: string[] = []
      if (seededRadicals > 0) {
        messages.push(`${String(seededRadicals)} radicals`)
      }
      if (seededKanji > 0) {
        messages.push(`${String(seededKanji)} kanji`)
      }
      if (seededComponents > 0) {
        messages.push(`${String(seededComponents)} components`)
      }
      showSuccess(`Seeded ${messages.join(', ')}`)
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to seed data')
    } finally {
      isSeeding.value = false
    }
  }

  async function clear() {
    if (isClearing.value) return

    isClearing.value = true
    try {
      run('DELETE FROM kanji_components')
      run('DELETE FROM kanjis')
      run('DELETE FROM components')
      run('DELETE FROM radicals')
      await persist()
      showSuccess('All data cleared')
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to clear data')
    } finally {
      isClearing.value = false
    }
  }

  return {
    clear,
    isClearing,
    isSeeding,
    seed
  }
}
