/**
 * Database initialization and setup
 *
 * Handles:
 * - Loading sql.js library
 * - Loading existing database from IndexedDB or creating new
 * - Running migrations to bring schema up to date
 * - Attaching lifecycle listeners for persistence
 */

import {
  loadFromIndexedDB,
  saveToIndexedDB,
  setDatabaseRef,
  setOnPersistError
} from './indexeddb'
import { attachLifecycleListeners } from './lifecycle'
import { runMigrations } from './migrations'

import type { Database } from 'sql.js'

/**
 * Initialize the database
 *
 * @param onPersistError - Optional callback invoked if the background persist
 *   triggered by visibility-change events fails. Allows callers to show a
 *   user-visible notification without the db layer depending on Vue.
 * @returns Initialized sql.js Database instance
 */
export async function initializeDatabase(
  onPersistError?: (err: Error) => void
): Promise<Database> {
  // Dynamic import for sql.js to ensure proper ESM loading
  const { default: initSqlJs } = await import('sql.js')

  // Initialize sql.js
  const SQL = await initSqlJs({
    // Load WASM from public directory (self-hosted for reliability)
    // Use BASE_URL to ensure correct path on GitHub Pages with /jisaku/ base
    locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`
  })

  // Try to load existing database from IndexedDB
  const existingData = await loadFromIndexedDB()

  let db: Database
  if (existingData) {
    // Load existing database
    db = new SQL.Database(existingData)
  } else {
    // Create new database
    db = new SQL.Database()
  }

  // Enable foreign key enforcement (disabled by default in SQLite per-connection)
  db.run('PRAGMA foreign_keys = ON')

  // Run any pending migrations
  runMigrations(db)

  // Set database reference for persistence operations
  setDatabaseRef(db)

  // Register error callback for debounced persist operations
  if (onPersistError) {
    setOnPersistError(onPersistError)
  }

  // Persist after migrations
  await saveToIndexedDB(db.export())

  // Attach lifecycle listeners for automatic persistence
  attachLifecycleListeners(onPersistError)

  return db
}

/**
 * Replace database with imported data
 *
 * Used for database import functionality.
 *
 * @param data - Binary database data to import
 * @returns New database instance
 */
export async function replaceDatabaseWithImported(
  data: Uint8Array
): Promise<Database> {
  // Dynamic import for sql.js to ensure proper ESM loading
  const { default: initSqlJs } = await import('sql.js')

  // Initialize sql.js
  const SQL = await initSqlJs({
    // Use BASE_URL to ensure correct path on GitHub Pages with /jisaku/ base
    locateFile: (file: string) => `${import.meta.env.BASE_URL}${file}`
  })

  // Create new database from imported data
  const newDb = new SQL.Database(data)

  // Enable foreign key enforcement (disabled by default in SQLite per-connection)
  newDb.run('PRAGMA foreign_keys = ON')

  // Run migrations to ensure schema is up to date
  runMigrations(newDb)

  // Update database reference for persistence
  setDatabaseRef(newDb)

  // Persist to IndexedDB
  await saveToIndexedDB(newDb.export())

  return newDb
}
