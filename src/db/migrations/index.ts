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
import migration011 from './011-readings.sql?raw'
import migration012 from './012-meanings.sql?raw'
import migration014 from './014-component-forms.sql?raw'
import migration015 from './015-component-groupings.sql?raw'
import migration016 from './016-vocabulary-system.sql?raw'
import migration017 from './017-fix-kentei-level-format.sql?raw'
import migration018 from './018-fix-updated-at-triggers.sql?raw'
import migration019 from './019-drop-notes-cultural.sql?raw'

import type { Database } from 'sql.js'

// ============================================================================
// Transaction Helper
// ============================================================================

/**
 * Run a migration function inside a BEGIN / COMMIT transaction.
 *
 * If the migration throws, the transaction is rolled back and the error
 * is re-thrown. This ensures a failed migration never leaves the database
 * in a partially-applied state.
 */
function runWithTransaction(db: Database, fn: () => void): void {
  db.run('BEGIN')
  try {
    fn()
    db.run('COMMIT')
  } catch (err) {
    db.run('ROLLBACK')
    throw err
  }
}

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
  // SQL constants for readability
  const SQL_ADD_ETYMOLOGY = 'ALTER TABLE kanjis ADD COLUMN notes_etymology TEXT'
  const SQL_ADD_CULTURAL = 'ALTER TABLE kanjis ADD COLUMN notes_cultural TEXT'
  const SQL_ADD_PERSONAL = 'ALTER TABLE kanjis ADD COLUMN notes_personal TEXT'
  const SQL_MIGRATE_NOTES =
    'UPDATE kanjis SET notes_personal = notes WHERE notes IS NOT NULL'
  const SQL_DROP_OLD_NOTES = 'ALTER TABLE kanjis DROP COLUMN notes'

  // Check if old notes column exists (for existing databases)
  const tableInfo = db.exec('PRAGMA table_info(kanjis)')
  const columns = tableInfo[0]?.values.map((row) => row[1]) ?? []
  const hasOldNotesColumn = columns.includes('notes')
  const hasNewNotesColumns = columns.includes('notes_etymology')

  if (hasOldNotesColumn && !hasNewNotesColumns) {
    // Add new columns
    db.run(SQL_ADD_ETYMOLOGY)
    db.run(SQL_ADD_CULTURAL)
    db.run(SQL_ADD_PERSONAL)
    // Migrate existing notes to personal notes
    db.run(SQL_MIGRATE_NOTES)
    // Drop old column - SQLite 3.35.0+ only
    try {
      db.run(SQL_DROP_OLD_NOTES)
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
  // SQL constants for readability
  const SQL_ADD_KENTEI_LEVEL =
    'ALTER TABLE kanjis ADD COLUMN kanji_kentei_level TEXT'
  const SQL_CREATE_KENTEI_INDEX =
    'CREATE INDEX IF NOT EXISTS idx_kanjis_kentei_level ON kanjis(kanji_kentei_level)'

  // Check if column already exists
  const columns = getTableColumns(db, 'kanjis')

  if (!columns.includes('kanji_kentei_level')) {
    db.run(SQL_ADD_KENTEI_LEVEL)
    db.run(SQL_CREATE_KENTEI_INDEX)
  }

  db.run('PRAGMA user_version = 4')
}

/**
 * Run migration 005 with conditional logic
 * Checks if short_meaning columns already exist before adding
 */
function runMigration005(db: Database): void {
  // SQL constants for readability
  const SQL_ADD_KANJI_SHORT_MEANING =
    'ALTER TABLE kanjis ADD COLUMN short_meaning TEXT'
  const SQL_ADD_COMPONENT_SHORT_MEANING =
    'ALTER TABLE components ADD COLUMN short_meaning TEXT'

  // Check if columns already exist
  const kanjiColumns = getTableColumns(db, 'kanjis')
  const componentColumns = getTableColumns(db, 'components')

  if (!kanjiColumns.includes('short_meaning')) {
    db.run(SQL_ADD_KANJI_SHORT_MEANING)
  }

  if (!componentColumns.includes('short_meaning')) {
    db.run(SQL_ADD_COMPONENT_SHORT_MEANING)
  }

  db.run('PRAGMA user_version = 5')
}

/**
 * Run migration 006 with conditional logic
 * Migrates japanese_name to search_keywords and drops japanese_name column
 */
function runMigration006(db: Database): void {
  // SQL constants for readability
  const SQL_ADD_SEARCH_KEYWORDS =
    'ALTER TABLE components ADD COLUMN search_keywords TEXT'
  const SQL_MIGRATE_KEYWORDS =
    'UPDATE components SET search_keywords = japanese_name WHERE japanese_name IS NOT NULL'
  const SQL_DROP_JAPANESE_NAME =
    'ALTER TABLE components DROP COLUMN japanese_name'

  // Check if migration already applied
  const componentColumns = getTableColumns(db, 'components')

  // If japanese_name exists and search_keywords doesn't, do migration
  if (
    componentColumns.includes('japanese_name') &&
    !componentColumns.includes('search_keywords')
  ) {
    db.run(SQL_ADD_SEARCH_KEYWORDS)
    db.run(SQL_MIGRATE_KEYWORDS)
    // Try to drop old column (SQLite 3.35.0+)
    try {
      db.run(SQL_DROP_JAPANESE_NAME)
    } catch {
      // If DROP COLUMN fails, column remains but won't be used
    }
  } else if (
    !componentColumns.includes('japanese_name') &&
    !componentColumns.includes('search_keywords')
  ) {
    // Neither exists, just add search_keywords
    db.run(SQL_ADD_SEARCH_KEYWORDS)
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
 * Run migration 011 with conditional logic
 * Adds on_readings and kun_readings tables for the readings system
 */
function runMigration011(db: Database): void {
  // Check if tables already exist
  const tablesResult = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='on_readings'"
  )
  const hasOnReadings = (tablesResult[0]?.values.length ?? 0) > 0

  if (hasOnReadings) {
    // Tables already exist, just set version
    db.run('PRAGMA user_version = 11')
  } else {
    db.run(migration011)
  }
}

/**
 * Run migration 012 with conditional logic
 * Adds meanings tables: kanji_meanings, kanji_meaning_reading_groups, kanji_meaning_group_members
 */
function runMigration012(db: Database): void {
  // Check if tables already exist
  const tablesResult = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='kanji_meanings'"
  )
  const hasKanjiMeanings = (tablesResult[0]?.values.length ?? 0) > 0

  if (hasKanjiMeanings) {
    // Tables already exist, just set version
    db.run('PRAGMA user_version = 12')
  } else {
    db.run(migration012)
  }
}

/**
 * Run migration 013 with conditional logic
 * Adds display_order to kanji_classifications, adds phonetic_loan type
 */
function runMigration013(db: Database): void {
  // Check if display_order column already exists in kanji_classifications
  const columns = getTableColumns(db, 'kanji_classifications')

  if (!columns.includes('display_order')) {
    db.run(
      'ALTER TABLE kanji_classifications ADD COLUMN display_order INTEGER DEFAULT 0'
    )
    // Migrate existing is_primary data to display_order
    db.run(
      'UPDATE kanji_classifications SET display_order = CASE WHEN is_primary = 1 THEN 0 ELSE 1 END'
    )
  }

  // Add phonetic_loan type if not exists
  // NOTE: This inline seed INSERT is intentional — it is a one-time reference data
  // entry tightly coupled to the schema change in this migration. Extracting it
  // to a separate seed process would add complexity without practical benefit for
  // this single-user tool.
  const typeResult = db.exec(
    "SELECT id FROM classification_types WHERE type_name = 'phonetic_loan'"
  )
  if ((typeResult[0]?.values.length ?? 0) === 0) {
    db.run(
      `INSERT INTO classification_types (type_name, name_japanese, name_english, description, description_short, display_order) 
       VALUES ('phonetic_loan', '仮借字', 'Phonetic Loan', 'Borrowed character for sound alone, original meaning ignored', 'Borrowed for sound', 5)`
    )
  }

  db.run('PRAGMA user_version = 13')
}

/**
 * Run migration 014 with conditional logic
 * Adds component_forms table for visual variants of semantic components
 */
function runMigration014(db: Database): void {
  // Always run migration 014 - it handles dropping existing table and recreating with correct schema
  db.run(migration014)
}

/**
 * Run migration 015 with conditional logic
 * Adds component_groupings and component_grouping_members tables
 */
function runMigration015(db: Database): void {
  // Always run migration 015 - it handles dropping existing tables and recreating with correct schema
  db.run(migration015)
}

/**
 * Run migration 016 with conditional logic
 * Adds vocabulary and vocab_kanji tables for vocabulary management
 */
function runMigration016(db: Database): void {
  // Check if vocabulary table already exists
  const tablesResult = db.exec(
    "SELECT name FROM sqlite_master WHERE type='table' AND name='vocabulary'"
  )
  const hasVocabulary = (tablesResult[0]?.values.length ?? 0) > 0

  if (hasVocabulary) {
    // Table already exists, just set version
    db.run('PRAGMA user_version = 16')
  } else {
    db.run(migration016)
  }
}

/**
 * Run migration 017
 * Normalizes kanji kentei level format from full labels to type-safe keys
 */
function runMigration017(db: Database): void {
  db.run(migration017)
}

/**
 * Run migration 018
 * Adds missing updated_at triggers for tables created in migrations 014-016
 */
function runMigration018(db: Database): void {
  db.run(migration018)
}

/**
 * Run migration 019
 * Drops the unused notes_cultural column that was added in migration 002
 * but never used in TypeScript types, queries, or mutations.
 */
function runMigration019(db: Database): void {
  const columns = getTableColumns(db, 'kanjis')
  if (columns.includes('notes_cultural')) {
    // DROP COLUMN requires SQLite 3.35.0+; wrapped in try/catch for safety.
    try {
      db.run(migration019)
    } catch {
      // Older SQLite — skip; the column is harmlessly unused.
      db.run('PRAGMA user_version = 19')
    }
  } else {
    db.run('PRAGMA user_version = 19')
  }
}

/**
 * Execute early migrations (versions 1-8)
 */
function applyEarlyMigrations(db: Database, currentVersion: number): void {
  if (currentVersion < 1) {
    runWithTransaction(db, () => db.run(migration001))
  }
  if (currentVersion < 2) {
    runWithTransaction(db, () => {
      runMigration002(db)
    })
  }
  if (currentVersion < 3) {
    runWithTransaction(db, () => {
      runMigration003(db)
    })
  }
  if (currentVersion < 4) {
    runWithTransaction(db, () => {
      runMigration004(db)
    })
  }
  if (currentVersion < 5) {
    runWithTransaction(db, () => {
      runMigration005(db)
    })
  }
  if (currentVersion < 6) {
    runWithTransaction(db, () => {
      runMigration006(db)
    })
  }
  if (currentVersion < 7) {
    runWithTransaction(db, () => {
      runMigration007(db)
    })
  }
  if (currentVersion < 8) {
    runWithTransaction(db, () => {
      runMigration008(db)
    })
  }
}

/**
 * Execute middle migrations (versions 9-13)
 */
function applyMiddleMigrations(db: Database, currentVersion: number): void {
  if (currentVersion < 9) {
    runWithTransaction(db, () => {
      runMigration009(db)
    })
  }
  if (currentVersion < 10) {
    runWithTransaction(db, () => {
      runMigration010(db)
    })
  }
  if (currentVersion < 11) {
    runWithTransaction(db, () => {
      runMigration011(db)
    })
  }
  if (currentVersion < 12) {
    runWithTransaction(db, () => {
      runMigration012(db)
    })
  }
  if (currentVersion < 13) {
    runWithTransaction(db, () => {
      runMigration013(db)
    })
  }
}

/**
 * Execute late migrations (versions 14-18)
 */
function applyLateMigrations(db: Database, currentVersion: number): void {
  if (currentVersion < 14) {
    runWithTransaction(db, () => {
      runMigration014(db)
    })
  }
  if (currentVersion < 15) {
    runWithTransaction(db, () => {
      runMigration015(db)
    })
  }
  if (currentVersion < 16) {
    runWithTransaction(db, () => {
      runMigration016(db)
    })
  }
  if (currentVersion < 17) {
    runWithTransaction(db, () => {
      runMigration017(db)
    })
  }
  if (currentVersion < 18) {
    runWithTransaction(db, () => {
      runMigration018(db)
    })
  }
  if (currentVersion < 19) {
    runWithTransaction(db, () => {
      runMigration019(db)
    })
  }
}

/**
 * Execute all pending migrations based on current schema version
 */
function applyPendingMigrations(db: Database, currentVersion: number): void {
  applyEarlyMigrations(db, currentVersion)
  applyMiddleMigrations(db, currentVersion)
  applyLateMigrations(db, currentVersion)
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
    applyPendingMigrations(db, currentVersion)
  } catch (error) {
    // Re-throw with a more descriptive message. The error propagates to
    // App.vue which surfaces it to the user.
    throw new Error(
      `Database migration failed: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    )
  }
}
