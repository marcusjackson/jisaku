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
  CreateRadicalInput,
  Kanji,
  Radical
} from '@/shared/types/database-types'
import type { Database } from 'sql.js'

// SQL for creating the schema (matches 001-initial.sql)
const SCHEMA_SQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS radicals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0),
    number INTEGER NOT NULL UNIQUE CHECK (number >= 1 AND number <= 214),
    meaning TEXT,
    japanese_name TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS kanjis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL UNIQUE,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0 AND stroke_count <= 64),
    radical_id INTEGER,
    jlpt_level TEXT CHECK (jlpt_level IN ('N5', 'N4', 'N3', 'N2', 'N1')),
    joyo_level TEXT CHECK (joyo_level IN (
      'elementary1', 'elementary2', 'elementary3',
      'elementary4', 'elementary5', 'elementary6',
      'secondary'
    )),
    stroke_diagram_image BLOB,
    stroke_gif_image BLOB,
    notes_etymology TEXT,
    notes_cultural TEXT,
    notes_personal TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (radical_id) REFERENCES radicals(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS components (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    character TEXT NOT NULL,
    stroke_count INTEGER NOT NULL CHECK (stroke_count > 0),
    source_kanji_id INTEGER,
    description_short TEXT,
    japanese_name TEXT,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (source_kanji_id) REFERENCES kanjis(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS kanji_components (
    kanji_id INTEGER NOT NULL,
    component_id INTEGER NOT NULL,
    position INTEGER,
    PRIMARY KEY (kanji_id, component_id),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
  );
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
    jlptLevel = null,
    joyoLevel = null,
    notesCultural = null,
    notesEtymology = null,
    notesPersonal = null,
    radicalId = null,
    strokeCount
  } = data

  db.run(
    `INSERT INTO kanjis (character, stroke_count, radical_id, jlpt_level, joyo_level, notes_etymology, notes_cultural, notes_personal)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      character,
      strokeCount,
      radicalId,
      jlptLevel,
      joyoLevel,
      notesEtymology,
      notesCultural,
      notesPersonal
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
    character,
    description = null,
    descriptionShort = null,
    japaneseName = null,
    sourceKanjiId = null,
    strokeCount
  } = data

  db.run(
    `INSERT INTO components (character, stroke_count, source_kanji_id, description_short, japanese_name, description)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      character,
      strokeCount,
      sourceKanjiId,
      descriptionShort,
      japaneseName,
      description
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

// Helper to convert SQL row to Kanji object
function rowToKanji(row: unknown[]): Kanji {
  return {
    id: row[0] as number,
    character: row[1] as string,
    strokeCount: row[2] as number,
    radicalId: row[3] as number | null,
    jlptLevel: row[4] as Kanji['jlptLevel'],
    joyoLevel: row[5] as Kanji['joyoLevel'],
    strokeDiagramImage: row[6] as Uint8Array | null,
    strokeGifImage: row[7] as Uint8Array | null,
    notesEtymology: row[8] as string | null,
    notesCultural: row[9] as string | null,
    notesPersonal: row[10] as string | null,
    createdAt: row[11] as string,
    updatedAt: row[12] as string
  }
}

// Helper to convert SQL row to Component object
function rowToComponent(row: unknown[]): Component {
  return {
    id: row[0] as number,
    character: row[1] as string,
    strokeCount: row[2] as number,
    sourceKanjiId: row[3] as number | null,
    descriptionShort: row[4] as string | null,
    japaneseName: row[5] as string | null,
    description: row[6] as string | null,
    createdAt: row[7] as string,
    updatedAt: row[8] as string
  }
}

// Helper to convert SQL row to Radical object
function rowToRadical(row: unknown[]): Radical {
  return {
    id: row[0] as number,
    character: row[1] as string,
    strokeCount: row[2] as number,
    number: row[3] as number,
    meaning: row[4] as string | null,
    japaneseName: row[5] as string | null,
    createdAt: row[6] as string,
    updatedAt: row[7] as string
  }
}

/**
 * Seed a radical into the test database
 */
export function seedRadical(db: Database, data: CreateRadicalInput): Radical {
  const {
    character,
    japaneseName = null,
    meaning = null,
    number,
    strokeCount
  } = data

  db.run(
    `INSERT INTO radicals (character, stroke_count, number, meaning, japanese_name)
     VALUES (?, ?, ?, ?, ?)`,
    [character, strokeCount, number, meaning, japaneseName]
  )

  const result = db.exec(
    'SELECT * FROM radicals WHERE id = last_insert_rowid()'
  )
  const row = result[0]?.values[0]
  if (!row) {
    throw new Error('Failed to seed radical')
  }

  return rowToRadical(row)
}
