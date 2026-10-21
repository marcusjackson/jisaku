/**
 * Database Test Seeders - Functions for inserting test data into the database.
 */
import type { CreateKanjiClassificationInput } from '@/api/classification/classification-types';
import type {
  Component,
  CreateComponentInput,
  CreateComponentOccurrenceInput,
} from '@/api/component/component-types';
import type { CreateGroupMemberInput } from '@/api/kanji/group-member-types';
import type { CreateKanjiInput, Kanji } from '@/api/kanji/kanji-types';
import type { CreateKanjiMeaningInput } from '@/api/kanji/meaning-types';
import type { CreateReadingGroupInput } from '@/api/kanji/reading-group-types';
import type { CreateKunReadingInput, CreateOnReadingInput } from '@/api/kanji/reading-types';
import type {
  CreateVocabKanjiInput,
  CreateVocabularyInput,
} from '@/api/vocabulary/vocabulary-types';
import type { Database } from 'sql.js';

// =============================================================================
// Row Converters
// =============================================================================

/** Read a column by name, so the converters survive column reordering. */
function reader(result: { columns: string[]; values: unknown[][] }): (name: string) => unknown {
  const row = result.values[0] ?? [];
  return (name) => {
    const index = result.columns.indexOf(name);
    if (index === -1) throw new Error(`Seeder expected column ${name}`);
    return row[index];
  };
}

/** Convert the first row of a query result to a typed Kanji object. */
function rowToKanji(result: { columns: string[]; values: unknown[][] }): Kanji {
  const get = reader(result);
  return {
    id: get('id') as number,
    character: get('character') as string,
    strokeCount: get('stroke_count') as number | null,
    shortMeaning: get('short_meaning') as string | null,
    searchKeywords: get('search_keywords') as string | null,
    radicalId: get('radical_id') as number | null,
    jlptLevel: get('jlpt_level') as Kanji['jlptLevel'],
    joyoLevel: get('joyo_level') as Kanji['joyoLevel'],
    kanjiKenteiLevel: get('kanji_kentei_level') as Kanji['kanjiKenteiLevel'],
    strokeDiagramImage: get('stroke_diagram_image') as Uint8Array | null,
    strokeGifImage: get('stroke_gif_image') as Uint8Array | null,
    notesEtymology: get('notes_etymology') as string | null,
    notesSemantic: get('notes_semantic') as string | null,
    notesEducationMnemonics: get('notes_education_mnemonics') as string | null,
    notesPersonal: get('notes_personal') as string | null,
    identifier: get('identifier') as number | null,
    radicalStrokeCount: get('radical_stroke_count') as number | null,
    createdAt: get('created_at') as string,
    updatedAt: get('updated_at') as string,
  };
}

/** Convert the first row of a query result to a typed Component object. */
function rowToComponent(result: { columns: string[]; values: unknown[][] }): Component {
  const get = reader(result);
  return {
    id: get('id') as number,
    character: get('character') as string,
    strokeCount: get('stroke_count') as number | null,
    shortMeaning: get('short_meaning') as string | null,
    sourceKanjiId: get('source_kanji_id') as number | null,
    searchKeywords: get('search_keywords') as string | null,
    description: get('description') as string | null,
    canBeRadical: Boolean(get('can_be_radical')),
    kangxiNumber: get('kangxi_number') as number | null,
    kangxiMeaning: get('kangxi_meaning') as string | null,
    radicalNameJapanese: get('radical_name_japanese') as string | null,
    createdAt: get('created_at') as string,
    updatedAt: get('updated_at') as string,
  };
}

// =============================================================================
// Seed Functions
// =============================================================================

/**
 * Seed a kanji into the test database
 */
export function seedKanji(db: Database, data: CreateKanjiInput): Kanji {
  const {
    character,
    identifier = null,
    jlptLevel = null,
    joyoLevel = null,
    kanjiKenteiLevel = null,
    notesEducationMnemonics = null,
    notesEtymology = null,
    notesPersonal = null,
    notesSemantic = null,
    radicalId = null,
    radicalStrokeCount = null,
    shortMeaning = null,
    strokeCount,
  } = data;

  db.run(
    `INSERT INTO kanjis (character, stroke_count, short_meaning, radical_id, jlpt_level, joyo_level, kanji_kentei_level, notes_etymology, notes_semantic, notes_education_mnemonics, notes_personal, identifier, radical_stroke_count)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      character,
      strokeCount,
      shortMeaning,
      radicalId,
      jlptLevel,
      joyoLevel,
      kanjiKenteiLevel,
      notesEtymology,
      notesSemantic,
      notesEducationMnemonics,
      notesPersonal,
      identifier,
      radicalStrokeCount,
    ]
  );

  const result = db.exec('SELECT * FROM kanjis WHERE id = last_insert_rowid()');
  const first = result[0];
  if (!first?.values[0]) {
    throw new Error('Failed to seed kanji');
  }

  return rowToKanji(first);
}

/**
 * Seed a component into the test database
 */
export function seedComponent(db: Database, data: CreateComponentInput): Component {
  const {
    canBeRadical = false,
    character,
    description = null,
    kangxiMeaning = null,
    kangxiNumber = null,
    radicalNameJapanese = null,
    searchKeywords = null,
    shortMeaning = null,
    sourceKanjiId = null,
    strokeCount = null,
  } = data;

  db.run(
    `INSERT INTO components (character, stroke_count, short_meaning, source_kanji_id, search_keywords, description, can_be_radical, kangxi_number, kangxi_meaning, radical_name_japanese)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      character,
      strokeCount,
      shortMeaning,
      sourceKanjiId,
      searchKeywords,
      description,
      canBeRadical ? 1 : 0,
      kangxiNumber,
      kangxiMeaning,
      radicalNameJapanese,
    ]
  );

  const result = db.exec('SELECT * FROM components WHERE id = last_insert_rowid()');
  const first = result[0];
  if (!first?.values[0]) {
    throw new Error('Failed to seed component');
  }

  return rowToComponent(first);
}

/**
 * Seed a component occurrence into the test database
 */
export function seedComponentOccurrence(
  db: Database,
  kanjiId: number,
  componentId: number,
  data: Omit<CreateComponentOccurrenceInput, 'kanjiId' | 'componentId'> = {}
): number {
  const {
    analysisNotes = null,
    componentFormId = null,
    displayOrder = 0,
    isRadical = false,
    positionTypeId = null,
  } = data;

  db.run(
    `INSERT INTO component_occurrences (kanji_id, component_id, component_form_id, position_type_id, is_radical, display_order, analysis_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      kanjiId,
      componentId,
      componentFormId,
      positionTypeId,
      isRadical ? 1 : 0,
      displayOrder,
      analysisNotes,
    ]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed an on-yomi reading into the test database
 */
export function seedOnReading(
  db: Database,
  kanjiId: number,
  data: Omit<CreateOnReadingInput, 'kanjiId'>
): number {
  const { displayOrder = 0, reading, readingLevel = '小' } = data;

  db.run(
    `INSERT INTO on_readings (kanji_id, reading, reading_level, display_order)
     VALUES (?, ?, ?, ?)`,
    [kanjiId, reading, readingLevel, displayOrder]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed a kun-yomi reading into the test database
 */
export function seedKunReading(
  db: Database,
  kanjiId: number,
  data: Omit<CreateKunReadingInput, 'kanjiId'>
): number {
  const { displayOrder = 0, okurigana = null, reading, readingLevel = '小' } = data;

  db.run(
    `INSERT INTO kun_readings (kanji_id, reading, okurigana, reading_level, display_order)
     VALUES (?, ?, ?, ?, ?)`,
    [kanjiId, reading, okurigana, readingLevel, displayOrder]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed a meaning into the test database
 */
export function seedMeaning(
  db: Database,
  kanjiId: number,
  data: Omit<CreateKanjiMeaningInput, 'kanjiId'>
): number {
  const { additionalInfo = null, displayOrder = 0, meaningText } = data;

  db.run(
    `INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order)
     VALUES (?, ?, ?, ?)`,
    [kanjiId, meaningText, additionalInfo, displayOrder]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed a reading group into the test database
 */
export function seedReadingGroup(
  db: Database,
  kanjiId: number,
  data: Omit<CreateReadingGroupInput, 'kanjiId'>
): number {
  const { displayOrder = 0, readingText } = data;

  db.run(
    `INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order)
     VALUES (?, ?, ?)`,
    [kanjiId, readingText, displayOrder]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed a group member (assign meaning to group) into the test database
 */
export function seedGroupMember(
  db: Database,
  readingGroupId: number,
  meaningId: number,
  displayOrder: CreateGroupMemberInput['displayOrder'] = 0
): number {
  db.run(
    `INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order)
     VALUES (?, ?, ?)`,
    [readingGroupId, meaningId, displayOrder]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed a classification into the test database
 */
export function seedClassification(
  db: Database,
  kanjiId: number,
  data: Omit<CreateKanjiClassificationInput, 'kanjiId'>
): number {
  const { classificationTypeId, displayOrder = 0 } = data;

  db.run(
    `INSERT INTO kanji_classifications (kanji_id, classification_type_id, display_order)
     VALUES (?, ?, ?)`,
    [kanjiId, classificationTypeId, displayOrder]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed a vocabulary entry into the test database.
 *
 * Note: kana is optional here (nullable) so tests can create vocabulary without
 * kana, unlike CreateVocabularyInput which requires kana as non-nullable.
 */
export function seedVocabulary(
  db: Database,
  data: Omit<CreateVocabularyInput, 'kana'> & { kana?: string | null }
): number {
  const {
    description = null,
    isCommon = false,
    jlptLevel = null,
    kana = null,
    searchKeywords = null,
    shortMeaning = null,
    word,
  } = data;

  db.run(
    `INSERT INTO vocabulary (word, kana, short_meaning, search_keywords,
                             jlpt_level, is_common, description)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [word, kana, shortMeaning, searchKeywords, jlptLevel, isCommon ? 1 : 0, description]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}

/**
 * Seed a vocab-kanji junction entry into the test database
 */
export function seedVocabKanji(
  db: Database,
  vocabId: number,
  kanjiId: number,
  data: Omit<CreateVocabKanjiInput, 'vocabId' | 'kanjiId'> = {}
): number {
  const { analysisNotes = null, displayOrder = 0 } = data;

  db.run(
    `INSERT INTO vocab_kanji (vocab_id, kanji_id, analysis_notes, display_order)
     VALUES (?, ?, ?, ?)`,
    [vocabId, kanjiId, analysisNotes, displayOrder]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  return result[0]?.values[0]?.[0] as number;
}
