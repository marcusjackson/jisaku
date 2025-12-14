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
    shortMeaning: 'sun, day',
    searchKeywords: 'ひ, にち, hi, nichi, sunshine',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Sun, day. One of the most fundamental kanji.'
  },
  {
    character: '月',
    strokeCount: 4,
    shortMeaning: 'moon, month',
    searchKeywords: 'つき, げつ, tsuki, getsu, crescent',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Moon, month. Pictograph of a crescent moon.'
  },
  {
    character: '水',
    strokeCount: 4,
    shortMeaning: 'water',
    searchKeywords: 'みず, すい, mizu, sui, aqua',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Water. Pictograph of flowing water.'
  },
  {
    character: '火',
    strokeCount: 4,
    shortMeaning: 'fire',
    searchKeywords: 'ひ, か, hi, ka, flame',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Fire. Pictograph of flames.'
  },
  {
    character: '木',
    strokeCount: 4,
    shortMeaning: 'tree, wood',
    searchKeywords: 'き, もく, ki, moku, timber',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Tree, wood. Pictograph of a tree.'
  },
  {
    character: '金',
    strokeCount: 8,
    shortMeaning: 'gold, metal, money',
    searchKeywords: 'かね, きん, kane, kin, golden',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '9級',
    notesPersonal: 'Gold, metal, money.'
  },
  {
    character: '土',
    strokeCount: 3,
    shortMeaning: 'earth, soil',
    searchKeywords: 'つち, ど, tsuchi, do, ground',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Earth, soil, ground.'
  },
  {
    character: '山',
    strokeCount: 3,
    shortMeaning: 'mountain',
    searchKeywords: 'やま, さん, yama, san, peak',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Mountain. Pictograph of three peaks.'
  },
  {
    character: '川',
    strokeCount: 3,
    shortMeaning: 'river',
    searchKeywords: 'かわ, せん, kawa, sen, stream',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'River. Pictograph of flowing water between banks.'
  },
  {
    character: '人',
    strokeCount: 2,
    shortMeaning: 'person, human',
    searchKeywords: 'ひと, じん, hito, jin, にん, nin',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10級',
    notesPersonal: 'Person. Pictograph of a standing person.'
  },
  {
    character: '空',
    strokeCount: 8,
    shortMeaning: 'sky, empty',
    searchKeywords: 'そら, くう, sora, kuu, あ, a, void',
    jlptLevel: 'N4',
    joyoLevel: 'elementary1',
    kenteiLevel: '9級',
    notesPersonal: 'Sky, empty. Represents openness above.'
  },
  {
    character: '海',
    strokeCount: 9,
    shortMeaning: 'sea, ocean',
    searchKeywords: 'うみ, かい, umi, kai, marine',
    jlptLevel: 'N4',
    joyoLevel: 'elementary2',
    kenteiLevel: '8級',
    notesPersonal: 'Sea, ocean. Contains the water radical.'
  },
  {
    character: '花',
    strokeCount: 7,
    shortMeaning: 'flower',
    searchKeywords: 'はな, か, hana, ka, blossom',
    jlptLevel: 'N4',
    joyoLevel: 'elementary1',
    kenteiLevel: '9級',
    notesPersonal: 'Flower. Contains the grass radical.'
  },
  {
    character: '愛',
    strokeCount: 13,
    shortMeaning: 'love, affection',
    searchKeywords: 'あい, ai, beloved',
    jlptLevel: 'N3',
    joyoLevel: 'elementary4',
    kenteiLevel: '6級',
    notesPersonal: 'Love, affection. Contains the heart radical.'
  },
  {
    character: '夢',
    strokeCount: 13,
    shortMeaning: 'dream',
    searchKeywords: 'ゆめ, む, yume, mu, vision',
    jlptLevel: 'N2',
    joyoLevel: 'elementary5',
    kenteiLevel: '5級',
    notesPersonal: 'Dream.'
  },
  {
    character: '桜',
    strokeCount: 10,
    shortMeaning: 'cherry blossom',
    searchKeywords: 'さくら, おう, sakura, ou, hanami',
    jlptLevel: 'N2',
    joyoLevel: 'elementary5',
    kenteiLevel: '5級',
    notesPersonal: 'Cherry blossom. Iconic symbol of Japan.'
  },
  {
    character: '鬱',
    strokeCount: 29,
    shortMeaning: 'depression, gloom',
    searchKeywords: 'うつ, utsu, melancholy',
    jlptLevel: 'N1',
    joyoLevel: 'secondary',
    kenteiLevel: '準1級',
    notesPersonal:
      'Depression, melancholy. One of the most complex common kanji.'
  },
  {
    character: '薔',
    strokeCount: 16,
    shortMeaning: 'rose',
    searchKeywords: 'しょう, shou, bara, 薔薇',
    jlptLevel: 'N1',
    joyoLevel: null,
    kenteiLevel: '1級',
    notesPersonal: 'Rose (part of 薔薇 - bara).'
  }
]

// Sample component data for seeding
const SEED_COMPONENTS = [
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
      let seededPositionTypes = 0

      // Seed position types (reference data)
      const positionTypeCountResult = exec(
        'SELECT COUNT(*) as count FROM position_types'
      )
      const positionTypeCount = positionTypeCountResult[0]?.values[0]?.[0]
      if (typeof positionTypeCount === 'number' && positionTypeCount === 0) {
        const positionTypes = [
          {
            positionName: 'hen',
            nameJapanese: 'へん',
            nameEnglish: 'left side',
            description:
              'Component appears on the left side of the kanji character',
            descriptionShort: 'Left side'
          },
          {
            positionName: 'tsukuri',
            nameJapanese: 'つくり',
            nameEnglish: 'right side',
            description:
              'Component appears on the right side of the kanji character',
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
            description:
              'Component hangs from the top and wraps around the left side',
            descriptionShort: 'Hanging from top-left'
          },
          {
            positionName: 'nyou',
            nameJapanese: 'にょう',
            nameEnglish: 'enclosure',
            description:
              'Component wraps around the bottom and left side of the kanji',
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

        positionTypes.forEach((pt, i) => {
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
        seededPositionTypes = positionTypes.length
      }

      // Seed kanji
      const kanjiCountResult = exec('SELECT COUNT(*) as count FROM kanjis')
      const kanjiCount = kanjiCountResult[0]?.values[0]?.[0]
      if (typeof kanjiCount === 'number' && kanjiCount === 0) {
        for (const kanji of SEED_KANJI) {
          run(
            `INSERT INTO kanjis (character, stroke_count, short_meaning, search_keywords, jlpt_level, joyo_level, kanji_kentei_level, notes_personal)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              kanji.character,
              kanji.strokeCount,
              kanji.shortMeaning,
              kanji.searchKeywords,
              kanji.jlptLevel,
              kanji.joyoLevel,
              kanji.kenteiLevel,
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
          if (
            'sourceKanjiCharacter' in component &&
            component.sourceKanjiCharacter
          ) {
            const result = exec('SELECT id FROM kanjis WHERE character = ?', [
              component.sourceKanjiCharacter
            ])
            sourceKanjiId =
              (result[0]?.values[0]?.[0] as number | undefined) ?? null
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
              'kangxiNumber' in component
                ? (component.kangxiNumber ?? null)
                : null,
              'kangxiMeaning' in component
                ? (component.kangxiMeaning ?? null)
                : null,
              'radicalNameJapanese' in component
                ? (component.radicalNameJapanese ?? null)
                : null
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
              'INSERT INTO component_occurrences (kanji_id, component_id, display_order) VALUES (?, ?, ?)',
              [kanjiId, compId, 0]
            )
          }
        }
      }

      if (
        seededKanji === 0 &&
        seededComponents === 0 &&
        seededPositionTypes === 0
      ) {
        showError('Database already has data')
        return
      }

      await persist()
      const messages: string[] = []
      if (seededPositionTypes > 0) {
        messages.push(`${String(seededPositionTypes)} position types`)
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
      // Delete from junction/dependent tables first
      run('DELETE FROM component_grouping_members')
      run('DELETE FROM component_groupings')
      run('DELETE FROM component_occurrences')
      run('DELETE FROM component_forms')
      run('DELETE FROM kanji_classifications')
      // Then main tables
      run('DELETE FROM kanjis')
      run('DELETE FROM components')
      // Note: classification_types and position_types are reference data, keep them
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
