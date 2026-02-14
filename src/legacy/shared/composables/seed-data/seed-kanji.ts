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
    kenteiLevel: '10',
    notesPersonal: 'Sun, day. One of the most fundamental kanji.'
  },
  {
    character: '月',
    strokeCount: 4,
    shortMeaning: 'moon, month',
    searchKeywords: 'つき, げつ, tsuki, getsu, crescent',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Moon, month. Pictograph of a crescent moon.'
  },
  {
    character: '水',
    strokeCount: 4,
    shortMeaning: 'water',
    searchKeywords: 'みず, すい, mizu, sui, aqua',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Water. Pictograph of flowing water.'
  },
  {
    character: '火',
    strokeCount: 4,
    shortMeaning: 'fire',
    searchKeywords: 'ひ, か, hi, ka, flame',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Fire. Pictograph of flames.'
  },
  {
    character: '木',
    strokeCount: 4,
    shortMeaning: 'tree, wood',
    searchKeywords: 'き, もく, ki, moku, timber',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Tree, wood. Pictograph of a tree.'
  },
  {
    character: '金',
    strokeCount: 8,
    shortMeaning: 'gold, metal, money',
    searchKeywords: 'かね, きん, kane, kin, golden',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '9',
    notesPersonal: 'Gold, metal, money.'
  },
  {
    character: '土',
    strokeCount: 3,
    shortMeaning: 'earth, soil',
    searchKeywords: 'つち, ど, tsuchi, do, ground',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Earth, soil, ground.'
  },
  {
    character: '山',
    strokeCount: 3,
    shortMeaning: 'mountain',
    searchKeywords: 'やま, さん, yama, san, peak',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Mountain. Pictograph of three peaks.'
  },
  {
    character: '川',
    strokeCount: 3,
    shortMeaning: 'river',
    searchKeywords: 'かわ, せん, kawa, sen, stream',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'River. Pictograph of flowing water between banks.'
  },
  {
    character: '人',
    strokeCount: 2,
    shortMeaning: 'person, human',
    searchKeywords: 'ひと, じん, hito, jin, にん, nin',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Person. Pictograph of a standing person.'
  },
  {
    character: '空',
    strokeCount: 8,
    shortMeaning: 'sky, empty',
    searchKeywords: 'そら, くう, sora, kuu, あ, a, void',
    jlptLevel: 'N4',
    joyoLevel: 'elementary1',
    kenteiLevel: '9',
    notesPersonal: 'Sky, empty. Represents openness above.'
  },
  {
    character: '海',
    strokeCount: 9,
    shortMeaning: 'sea, ocean',
    searchKeywords: 'うみ, かい, umi, kai, marine',
    jlptLevel: 'N4',
    joyoLevel: 'elementary2',
    kenteiLevel: '8',
    notesPersonal: 'Sea, ocean. Contains the water radical.'
  },
  {
    character: '花',
    strokeCount: 7,
    shortMeaning: 'flower',
    searchKeywords: 'はな, か, hana, ka, blossom',
    jlptLevel: 'N4',
    joyoLevel: 'elementary1',
    kenteiLevel: '9',
    notesPersonal: 'Flower. Contains the grass radical.'
  },
  {
    character: '愛',
    strokeCount: 13,
    shortMeaning: 'love, affection',
    searchKeywords: 'あい, ai, beloved',
    jlptLevel: 'N3',
    joyoLevel: 'elementary4',
    kenteiLevel: '6',
    notesPersonal: 'Love, affection. Contains the heart radical.'
  },
  {
    character: '夢',
    strokeCount: 13,
    shortMeaning: 'dream',
    searchKeywords: 'ゆめ, む, yume, mu, vision',
    jlptLevel: 'N2',
    joyoLevel: 'elementary5',
    kenteiLevel: '5',
    notesPersonal: 'Dream.'
  },
  {
    character: '桜',
    strokeCount: 10,
    shortMeaning: 'cherry blossom',
    searchKeywords: 'さくら, おう, sakura, ou, hanami',
    jlptLevel: 'N2',
    joyoLevel: 'elementary5',
    kenteiLevel: '5',
    notesPersonal: 'Cherry blossom. Iconic symbol of Japan.'
  },
  {
    character: '鬱',
    strokeCount: 29,
    shortMeaning: 'depression, gloom',
    searchKeywords: 'うつ, utsu, melancholy',
    jlptLevel: 'N1',
    joyoLevel: 'secondary',
    kenteiLevel: 'pre1',
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
    kenteiLevel: '1',
    notesPersonal: 'Rose (part of 薔薇 - bara).'
  },
  {
    character: '森',
    strokeCount: 12,
    shortMeaning: 'forest',
    searchKeywords: 'もり, しん, mori, shin, woods',
    jlptLevel: 'N3',
    joyoLevel: 'elementary1',
    kenteiLevel: '8',
    notesPersonal:
      'Forest. Three trees together represent a forest.\n\nEtymology: This is a pictographic compound showing multiple trees densely packed together. The repetition emphasizes the abundance of trees in a forest.'
  },
  {
    character: '林',
    strokeCount: 8,
    shortMeaning: 'woods, grove',
    searchKeywords: 'はやし, りん, hayashi, rin, copse',
    jlptLevel: 'N3',
    joyoLevel: 'elementary1',
    kenteiLevel: '9',
    notesPersonal:
      'Woods, grove. Two trees side by side.\n\nSemantics: Unlike 森 (forest), 林 represents a smaller collection of trees. The semantic progression is: 木 (one tree) → 林 (woods/grove) → 森 (forest). This shows how kanji build on simpler forms to express related but distinct concepts.'
  },
  {
    character: '明',
    strokeCount: 8,
    shortMeaning: 'bright, clear',
    searchKeywords: 'あか, めい, aka, mei, light',
    jlptLevel: 'N4',
    joyoLevel: 'elementary2',
    kenteiLevel: '9',
    notesPersonal:
      'Bright, clear. Sun and moon together.\n\nEducational: A great mnemonic is that both the sun (日) and moon (月) provide light, making things bright and clear. This kanji is also used in words like 明日 (ashita - tomorrow) and 説明 (setsumei - explanation).'
  },
  {
    character: '休',
    strokeCount: 6,
    shortMeaning: 'rest',
    searchKeywords: 'やす, きゅう, yasu, kyuu, relax',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '9',
    notesPersonal:
      'Rest. Person leaning against a tree.\n\nEtymology: This kanji beautifully illustrates the concept of rest by showing a person (人) leaning against a tree (木). Ancient Chinese workers would rest in the shade of trees during breaks from labor.\n\nEducational: Remember this by visualizing yourself taking a nap under a tree on a hot summer day. The imagery makes it unforgettable!'
  },
  {
    character: '好',
    strokeCount: 6,
    shortMeaning: 'like, fond of',
    searchKeywords: 'す, こう, su, kou, favorite',
    jlptLevel: 'N4',
    joyoLevel: 'elementary4',
    kenteiLevel: '7級',
    notesPersonal: 'Like, fond of. Woman and child together.'
  },
  {
    character: '安',
    strokeCount: 6,
    shortMeaning: 'peaceful, cheap',
    searchKeywords: 'やす, あん, yasu, an, calm',
    jlptLevel: 'N4',
    joyoLevel: 'elementary3',
    kenteiLevel: '8',
    notesPersonal:
      'Peaceful, cheap. Woman under a roof.\n\nSemantics: The original meaning was "peaceful" or "tranquil", derived from a woman safely under a roof. Over time, it also came to mean "cheap" or "inexpensive", possibly because peace and stability lead to lower prices.'
  },
  {
    character: '学',
    strokeCount: 8,
    shortMeaning: 'study, learn',
    searchKeywords: 'まな, がく, mana, gaku, education',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: ''
  },
  {
    character: '生',
    strokeCount: 5,
    shortMeaning: 'life, birth',
    searchKeywords: 'い, せい, i, sei, しょう, shou, なま, nama, う, u, は, ha',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: 'Life, birth. Sprout growing from earth.'
  },
  {
    character: '大',
    strokeCount: 3,
    shortMeaning: 'big, large',
    searchKeywords: 'おお, だい, oo, dai, たい, tai, huge',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: ''
  },
  {
    character: '小',
    strokeCount: 3,
    shortMeaning: 'small, little',
    searchKeywords: 'ちい, しょう, chii, shou, こ, ko, tiny',
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: '10',
    notesPersonal: ''
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
