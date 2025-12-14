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
import migration007 from './007-kanji-search-keywords.sql?raw'
import migration008 from './008-nullable-stroke-count.sql?raw'
import migration009 from './009-component-nullable-stroke-count.sql?raw'
import migration010 from './010-non-jlpt-joyo.sql?raw'

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
 * Run migration 006 with conditional logic
 * Migrates japanese_name to search_keywords and drops japanese_name column
 */
function runMigration006(db: Database): void {
  // Check if migration already applied
  const componentColumns = getTableColumns(db, 'components')

  // If japanese_name exists and search_keywords doesn't, do migration
  if (
    componentColumns.includes('japanese_name') &&
    !componentColumns.includes('search_keywords')
  ) {
    db.run('ALTER TABLE components ADD COLUMN search_keywords TEXT')
    db.run(
      'UPDATE components SET search_keywords = japanese_name WHERE japanese_name IS NOT NULL'
    )
    // Try to drop old column (SQLite 3.35.0+)
    try {
      db.run('ALTER TABLE components DROP COLUMN japanese_name')
    } catch {
      // If DROP COLUMN fails, column remains but won't be used
    }
  } else if (
    !componentColumns.includes('japanese_name') &&
    !componentColumns.includes('search_keywords')
  ) {
    // Neither exists, just add search_keywords
    db.run('ALTER TABLE components ADD COLUMN search_keywords TEXT')
  }

  db.run('PRAGMA user_version = 6')
}

/**
 * Run migration 007 with conditional logic
 * Adds search_keywords to kanjis table for consistent search across all entities
 */
function runMigration007(db: Database): void {
  // Check if column already exists
  const kanjiColumns = getTableColumns(db, 'kanjis')

  if (!kanjiColumns.includes('search_keywords')) {
    db.run(migration007)
  }

  db.run('PRAGMA user_version = 7')
}

/**
 * Run migration 008 with conditional logic
 * Makes stroke_count nullable in kanji table
 */
function runMigration008(db: Database): void {
  db.run(migration008)
  // Version is now set by the SQL file itself
}

/**
 * Run migration 009 with conditional logic
 * Makes stroke_count nullable in components table
 */
function runMigration009(db: Database): void {
  db.run(migration009)
  // Version is now set by the SQL file itself
}

/**
 * Run migration 010 with conditional logic
 * Adds non-jlpt and non-joyo values to check constraints
 */
function runMigration010(db: Database): void {
  db.run(migration010)
  // Version is now set by the SQL file itself
}

/**
 * Run all pending migrations on the database
 */
export function runMigrations(db: Database): void {
  // Check current schema version
  const versionResult = db.exec('PRAGMA user_version')
  const versionValue = versionResult[0]?.values[0]?.[0]
  const currentVersion = typeof versionValue === 'number' ? versionValue : 0

  try {
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

    // Migration 006: Add search_keywords and remove japanese_name
    if (currentVersion < 6) {
      runMigration006(db)
    }

    // Migration 007: Add search_keywords to kanjis table
    if (currentVersion < 7) {
      runMigration007(db)
    }

    // Migration 008: Make stroke_count nullable in kanjis
    if (currentVersion < 8) {
      runMigration008(db)
    }

    // Migration 009: Make stroke_count nullable in components
    if (currentVersion < 9) {
      runMigration009(db)
    }

    // Migration 010: Add non-jlpt and non-joyo to check constraints
    if (currentVersion < 10) {
      runMigration010(db)
    }
  } catch (error) {
    // If migration fails, log error but don't crash the app
    // The database will be in an inconsistent state, but the app can still function
    // In production, this should trigger a database reset or recovery mechanism
    console.error('Migration failed:', error)
    throw new Error(
      `Database migration failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
