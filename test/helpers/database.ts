/**
 * Database Test Helpers
 *
 * Utilities for creating and seeding test databases.
 */

import initSqlJs from 'sql.js'

import type {
  Component,
  CreateComponentInput,
  CreateKanjiInput,
  Kanji
} from '@/shared/types/database-types'
import type { Database } from 'sql.js'

// SQL for creating the schema (matches migration 003 schema)
const SCHEMA_SQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS kanjis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL UNIQUE,
    stroke_count INTEGER DEFAULT NULL,
    short_meaning TEXT,
    search_keywords TEXT,
    radical_id INTEGER,
    jlpt_level TEXT CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt')),
    joyo_level TEXT CHECK (joyo_level IN (
      'elementary1', 'elementary2', 'elementary3',
      'elementary4', 'elementary5', 'elementary6',
      'secondary', 'non-joyo'
    )),
    kanji_kentei_level TEXT,
    stroke_diagram_image BLOB,
    stroke_gif_image BLOB,
    notes_etymology TEXT,
    notes_semantic TEXT,
    notes_education_mnemonics TEXT,
    notes_personal TEXT,
    identifier INTEGER,
    radical_stroke_count INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (radical_id) REFERENCES components(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    stroke_count INTEGER DEFAULT NULL,
    short_meaning TEXT,
    source_kanji_id INTEGER,
    search_keywords TEXT,
    description TEXT,
    can_be_radical BOOLEAN DEFAULT 0,
    kangxi_number INTEGER CHECK (kangxi_number >= 1 AND kangxi_number <= 214),
    kangxi_meaning TEXT,
    radical_name_japanese TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (source_kanji_id) REFERENCES kanjis(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS classification_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT NOT NULL UNIQUE,
    name_japanese TEXT,
    name_english TEXT,
    description TEXT,
    description_short TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS position_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    position_name TEXT NOT NULL UNIQUE,
    name_japanese TEXT,
    name_english TEXT,
    description TEXT,
    description_short TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS component_forms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL,
    form_character TEXT NOT NULL,
    form_name TEXT,
    description TEXT,
    is_primary BOOLEAN DEFAULT 0,
    stroke_count INTEGER,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS component_occurrences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    component_id INTEGER NOT NULL,
    component_form_id INTEGER,
    position_type_id INTEGER,
    is_radical BOOLEAN DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    analysis_notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    FOREIGN KEY (component_form_id) REFERENCES component_forms(id) ON DELETE SET NULL,
    FOREIGN KEY (position_type_id) REFERENCES position_types(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS component_groupings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    component_id INTEGER NOT NULL,
    component_form_id INTEGER,
    name TEXT NOT NULL,
    analysis_notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    FOREIGN KEY (component_form_id) REFERENCES component_forms(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS component_grouping_members (
    grouping_id INTEGER NOT NULL,
    occurrence_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (grouping_id, occurrence_id),
    FOREIGN KEY (grouping_id) REFERENCES component_groupings(id) ON DELETE CASCADE,
    FOREIGN KEY (occurrence_id) REFERENCES component_occurrences(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS kanji_classifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    classification_type_id INTEGER NOT NULL,
    is_primary BOOLEAN DEFAULT 0,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (classification_type_id) REFERENCES classification_types(id) ON DELETE CASCADE
  );

  -- Prepopulate reference tables
  INSERT INTO classification_types (type_name, name_japanese, name_english, description_short, display_order) VALUES
  ('pictograph', '象形文字', 'Pictograph', 'Pictures of physical objects', 1),
  ('ideograph', '指事文字', 'Ideograph', 'Abstract concepts shown graphically', 2),
  ('compound_ideograph', '会意文字', 'Compound Ideograph', 'Combining meanings of components', 3),
  ('phono_semantic', '形声文字', 'Phono-semantic', 'Meaning component + sound component', 4);

  INSERT INTO position_types (position_name, name_japanese, name_english, description_short, display_order) VALUES
  ('hen', '偏', 'Left side', 'Component on left side of kanji', 1),
  ('tsukuri', '旁', 'Right side', 'Component on right side of kanji', 2),
  ('kanmuri', '冠', 'Crown/Top', 'Component on top of kanji', 3),
  ('ashi', '脚', 'Legs/Bottom', 'Component on bottom of kanji', 4),
  ('tare', '垂', 'Hanging', 'Component hanging from top-left', 5),
  ('nyou', '繞', 'Enclosure (bottom-left)', 'Component wrapping from bottom-left', 6),
  ('kamae', '構', 'Enclosure (full)', 'Component fully enclosing kanji', 7),
  ('other', 'その他', 'Other', 'Does not fit standard positions', 8);
`

/**
 * Create a fresh in-memory test database with schema applied
 */
export async function createTestDatabase(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()
  db.run(SCHEMA_SQL)
  return db
}

/**
 * Seed a kanji into the test database
 */
export function seedKanji(db: Database, data: CreateKanjiInput): Kanji {
  const {
    character,
    identifier = null,
    jlptLevel = null,
    joyoLevel = null,
    kenteiLevel = null,
    notesEducationMnemonics = null,
    notesEtymology = null,
    notesPersonal = null,
    notesSemantic = null,
    radicalId = null,
    radicalStrokeCount = null,
    shortMeaning = null,
    strokeCount
  } = data

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
      kenteiLevel,
      notesEtymology,
      notesSemantic,
      notesEducationMnemonics,
      notesPersonal,
      identifier,
      radicalStrokeCount
    ]
  )

  const result = db.exec('SELECT * FROM kanjis WHERE id = last_insert_rowid()')
  const row = result[0]?.values[0]
  if (!row) {
    throw new Error('Failed to seed kanji')
  }

  return rowToKanji(row)
}

/**
 * Seed a component into the test database
 */
export function seedComponent(
  db: Database,
  data: CreateComponentInput
): Component {
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
    strokeCount = null
  } = data

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
      radicalNameJapanese
    ]
  )

  const result = db.exec(
    'SELECT * FROM components WHERE id = last_insert_rowid()'
  )
  const row = result[0]?.values[0]
  if (!row) {
    throw new Error('Failed to seed component')
  }

  return rowToComponent(row)
}

/**
 * Seed a component occurrence into the test database
 */
export function seedComponentOccurrence(
  db: Database,
  kanjiId: number,
  componentId: number,
  data: {
    componentFormId?: number | null
    positionTypeId?: number | null
    isRadical?: boolean
    displayOrder?: number
    analysisNotes?: string | null
  } = {}
): number {
  const {
    analysisNotes = null,
    componentFormId = null,
    displayOrder = 0,
    isRadical = false,
    positionTypeId = null
  } = data

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
      analysisNotes
    ]
  )

  const result = db.exec('SELECT last_insert_rowid() as id')
  return result[0]?.values[0]?.[0] as number
}

// Helper to convert SQL row to Kanji object
function rowToKanji(row: unknown[]): Kanji {
  return {
    id: row[0] as number,
    character: row[1] as string,
    strokeCount: row[2] as number | null,
    shortMeaning: row[3] as string | null,
    searchKeywords: row[4] as string | null,
    radicalId: row[5] as number | null,
    jlptLevel: row[6] as Kanji['jlptLevel'],
    joyoLevel: row[7] as Kanji['joyoLevel'],
    kenteiLevel: row[8] as string | null,
    strokeDiagramImage: row[9] as Uint8Array | null,
    strokeGifImage: row[10] as Uint8Array | null,
    notesEtymology: row[11] as string | null,
    notesSemantic: row[12] as string | null,
    notesEducationMnemonics: row[13] as string | null,
    notesPersonal: row[14] as string | null,
    identifier: row[15] as number | null,
    radicalStrokeCount: row[16] as number | null,
    createdAt: row[17] as string,
    updatedAt: row[18] as string
  }
}

// Helper to convert SQL row to Component object
function rowToComponent(row: unknown[]): Component {
  return {
    id: row[0] as number,
    character: row[1] as string,
    strokeCount: row[2] as number | null,
    shortMeaning: row[3] as string | null,
    sourceKanjiId: row[4] as number | null,
    searchKeywords: row[5] as string | null,
    description: row[6] as string | null,
    canBeRadical: Boolean(row[7]),
    kangxiNumber: row[8] as number | null,
    kangxiMeaning: row[9] as string | null,
    radicalNameJapanese: row[10] as string | null,
    createdAt: row[11] as string,
    updatedAt: row[12] as string
  }
}
