/**
 * Database Test Setup - Schema definition and database initialisation.
 */
import initSqlJs from 'sql.js'

import type { Database } from 'sql.js'

/** Full SQLite schema used by in-memory test databases. */
export const SCHEMA_SQL = `
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
    stroke_count INTEGER,
    usage_notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE,
    UNIQUE(component_id, form_character)
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
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS component_grouping_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    grouping_id INTEGER NOT NULL,
    occurrence_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (grouping_id) REFERENCES component_groupings(id) ON DELETE CASCADE,
    FOREIGN KEY (occurrence_id) REFERENCES component_occurrences(id) ON DELETE CASCADE,
    UNIQUE(grouping_id, occurrence_id)
  );

  CREATE TABLE IF NOT EXISTS kanji_classifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    classification_type_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (classification_type_id) REFERENCES classification_types(id) ON DELETE CASCADE
  );

  -- Readings tables (migration 011)
  CREATE TABLE IF NOT EXISTS on_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    reading TEXT NOT NULL,
    reading_level TEXT NOT NULL DEFAULT '小' CHECK (reading_level IN ('小', '中', '高', '外')),
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS kun_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    reading TEXT NOT NULL,
    okurigana TEXT,
    reading_level TEXT NOT NULL DEFAULT '小' CHECK (reading_level IN ('小', '中', '高', '外')),
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
  );

  -- Meanings tables (migration 012)
  CREATE TABLE IF NOT EXISTS kanji_meanings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    meaning_text TEXT NOT NULL,
    additional_info TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS kanji_meaning_reading_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kanji_id INTEGER NOT NULL,
    reading_text TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS kanji_meaning_group_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reading_group_id INTEGER NOT NULL,
    meaning_id INTEGER NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (reading_group_id) REFERENCES kanji_meaning_reading_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (meaning_id) REFERENCES kanji_meanings(id) ON DELETE CASCADE,
    UNIQUE(reading_group_id, meaning_id)
  );

  -- Vocabulary tables (migration 016)
  CREATE TABLE IF NOT EXISTS vocabulary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL UNIQUE,
    kana TEXT,
    short_meaning TEXT,
    search_keywords TEXT,
    jlpt_level TEXT CHECK(jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt') OR jlpt_level IS NULL),
    is_common INTEGER DEFAULT 0 CHECK(is_common IN (0, 1)),
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS vocab_kanji (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vocab_id INTEGER NOT NULL,
    kanji_id INTEGER NOT NULL,
    analysis_notes TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (vocab_id) REFERENCES vocabulary(id) ON DELETE CASCADE,
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    UNIQUE(vocab_id, kanji_id)
  );

  -- Prepopulate reference tables
  INSERT INTO classification_types (type_name, name_japanese, name_english, description_short, display_order) VALUES
  ('pictograph', '象形文字', 'Pictograph', 'Pictures of physical objects', 1),
  ('ideograph', '指事文字', 'Ideograph', 'Abstract concepts shown graphically', 2),
  ('compound_ideograph', '会意文字', 'Compound Ideograph', 'Combining meanings of components', 3),
  ('phono_semantic', '形声文字', 'Phono-semantic', 'Meaning component + sound component', 4),
  ('phonetic_loan', '仮借字', 'Phonetic Loan', 'Borrowed for sound', 5);

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
 * Create a fresh in-memory test database with schema applied.
 */
export async function createTestDatabase(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()
  db.run(SCHEMA_SQL)
  return db
}
