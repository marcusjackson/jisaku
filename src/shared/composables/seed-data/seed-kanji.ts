/**
 * Kanji Seed Data
 *
 * Sample kanji data for development and testing.
 * Each kanji includes character, stroke count, meanings, and classifications.
 */

export interface SeedKanjiData {
  character: string
  strokeCount: number
  shortMeaning: string
  searchKeywords: string
  jlptLevel: string
  joyoLevel: string | null
  kenteiLevel: string
  notesPersonal: string
}

export const SEED_KANJI: SeedKanjiData[] = [
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

/**
 * Seeds kanji data into the database
 * @param run - function to execute SQL statements
 * @returns number of kanji seeded
 */
export function seedKanji(
  run: (sql: string, params?: unknown[]) => void
): number {
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
  return SEED_KANJI.length
}
