/**
 * Database migration runner
 *
 * Reads SQL migration files from this directory and applies them in order.
 * Each migration file should set PRAGMA user_version at the end.
 *
 * Migration files use Vite's ?raw import to load SQL as strings.
 */

// Import SQL migration files as strings
import migration001 from './001-initial.sql?raw'
import migration003 from './003-component-overhaul.sql?raw'

import type { Database } from 'sql.js'

/**
 * Helper to get column names from a table
 */
function getTableColumns(db: Database, tableName: string): string[] {
  const tableInfo = db.exec(`PRAGMA table_info(${tableName})`)
  return tableInfo[0]?.values.map((row) => row[1] as string) ?? []
}

/**
 * Run migration 002 with conditional logic
 * Handles databases that may already have the new schema
 */
function runMigration002(db: Database): void {
  // Check if old notes column exists (for existing databases)
  const tableInfo = db.exec('PRAGMA table_info(kanjis)')
  const columns = tableInfo[0]?.values.map((row) => row[1]) ?? []
  const hasOldNotesColumn = columns.includes('notes')
  const hasNewNotesColumns = columns.includes('notes_etymology')

  if (hasOldNotesColumn && !hasNewNotesColumns) {
    // Add new columns
    db.run('ALTER TABLE kanjis ADD COLUMN notes_etymology TEXT')
    db.run('ALTER TABLE kanjis ADD COLUMN notes_cultural TEXT')
    db.run('ALTER TABLE kanjis ADD COLUMN notes_personal TEXT')
    // Migrate existing notes to personal notes
    db.run('UPDATE kanjis SET notes_personal = notes WHERE notes IS NOT NULL')
    // Drop old column - SQLite 3.35.0+ only
    try {
      db.run('ALTER TABLE kanjis DROP COLUMN notes')
    } catch {
      // If DROP COLUMN fails (older SQLite), keep the old column
      // It won't cause issues, just redundant data
    }
  }
  db.run('PRAGMA user_version = 2')
}

/**
 * Run migration 003 with conditional logic
 * Handles complex component system overhaul
 */
function runMigration003(db: Database): void {
  // Check if migration already partially applied
  const tablesResult = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='component_occurrences'"
  )
  const hasComponentOccurrences = (tablesResult[0]?.values.length ?? 0) > 0

  if (hasComponentOccurrences) {
    // Migration already applied
    db.run('PRAGMA user_version = 3')
    return
  }

  // Run the full migration SQL
  db.run(migration003)
}

/**
 * Run migration 004 with conditional logic
 * Checks if column already exists before adding
 */
function runMigration004(db: Database): void {
  // Check if column already exists
  const columns = getTableColumns(db, 'kanjis')

  if (!columns.includes('kanji_kentei_level')) {
    db.run('ALTER TABLE kanjis ADD COLUMN kanji_kentei_level TEXT')
    db.run(
      'CREATE INDEX IF NOT EXISTS idx_kanjis_kentei_level ON kanjis(kanji_kentei_level)'
    )
  }

  db.run('PRAGMA user_version = 4')
}

/**
 * Run migration 005 with conditional logic
 * Checks if short_meaning columns already exist before adding
 */
function runMigration005(db: Database): void {
  // Check if columns already exist
  const kanjiColumns = getTableColumns(db, 'kanjis')
  const componentColumns = getTableColumns(db, 'components')

  if (!kanjiColumns.includes('short_meaning')) {
    db.run('ALTER TABLE kanjis ADD COLUMN short_meaning TEXT')
  }

  if (!componentColumns.includes('short_meaning')) {
    db.run('ALTER TABLE components ADD COLUMN short_meaning TEXT')
  }

  db.run('PRAGMA user_version = 5')
}

/**
 * Run all pending migrations on the database
 */
export function runMigrations(db: Database): void {
  // Check current schema version
  const versionResult = db.exec('PRAGMA user_version')
  const versionValue = versionResult[0]?.values[0]?.[0]
  const currentVersion = typeof versionValue === 'number' ? versionValue : 0

  // Migration 001: Initial schema
  if (currentVersion < 1) {
    db.run(migration001)
    // Version set by SQL file
  }

  // Migration 002: Split notes into categories
  if (currentVersion < 2) {
    runMigration002(db)
  }

  // Migration 003: Component system overhaul
  if (currentVersion < 3) {
    runMigration003(db)
  }

  // Migration 004: Add Kanji Kentei level
  if (currentVersion < 4) {
    runMigration004(db)
  }

  // Migration 005: Add short_meaning field
  if (currentVersion < 5) {
    runMigration005(db)
  }
}
