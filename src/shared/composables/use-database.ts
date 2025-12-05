/**
 * Database Composable
 *
 * Initializes sql.js, runs migrations, and persists to IndexedDB.
 * Provides a reactive database instance for queries across the app.
 *
 * Persistence Strategy:
 * - Auto-persist after write operations (debounced to avoid excessive saves)
 * - Immediate persist on visibility change (when app goes to background)
 * - Sync persist attempt on beforeunload (last chance before page unload)
 * - This ensures data survives Android PWA session kills
 */

import { readonly, ref, shallowRef } from 'vue'

import type { Database } from 'sql.js'

// =============================================================================
// Constants
// =============================================================================

const INDEXEDDB_NAME = 'kanji-dictionary'
const INDEXEDDB_STORE = 'database'
const INDEXEDDB_KEY = 'db'

/** Debounce delay for auto-persist after writes (ms) */
const PERSIST_DEBOUNCE_MS = 100

// =============================================================================
// IndexedDB Helpers
// =============================================================================

function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXEDDB_NAME, 1)

    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'Failed to open IndexedDB'))
    }
    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(INDEXEDDB_STORE)) {
        db.createObjectStore(INDEXEDDB_STORE)
      }
    }
  })
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  const idb = await openIndexedDB()

  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(INDEXEDDB_STORE, 'readonly')
    const store = transaction.objectStore(INDEXEDDB_STORE)
    const request = store.get(INDEXEDDB_KEY)

    request.onerror = () => {
      reject(
        new Error(request.error?.message ?? 'Failed to load from IndexedDB')
      )
    }
    request.onsuccess = () => {
      const result = request.result as Uint8Array | undefined
      resolve(result ?? null)
    }
  })
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIndexedDB()

  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(INDEXEDDB_STORE, 'readwrite')
    const store = transaction.objectStore(INDEXEDDB_STORE)
    const request = store.put(data, INDEXEDDB_KEY)

    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'Failed to save to IndexedDB'))
    }
    request.onsuccess = () => {
      resolve()
    }
  })
}

/**
 * Synchronous save to IndexedDB - used in beforeunload where async is unreliable.
 * Returns immediately after starting the transaction.
 */
function saveToIndexedDBSync(data: Uint8Array): void {
  // Open IndexedDB synchronously using cached connection if possible
  const request = indexedDB.open(INDEXEDDB_NAME, 1)

  request.onsuccess = () => {
    const idb = request.result
    const transaction = idb.transaction(INDEXEDDB_STORE, 'readwrite')
    const store = transaction.objectStore(INDEXEDDB_STORE)
    store.put(data, INDEXEDDB_KEY)
  }
}

// =============================================================================
// Debounced Persist Manager
// =============================================================================

/** Pending debounce timer for auto-persist */
let persistDebounceTimer: ReturnType<typeof setTimeout> | null = null

/** Whether a persist operation is currently in progress */
let isPersisting = false

/** Queue the next persist after current one completes */
let persistQueuedWhileBusy = false

/**
 * Schedule a debounced persist operation.
 * Groups rapid writes into a single IndexedDB save.
 */
function schedulePersist(): void {
  if (!database.value) return

  // Clear any pending debounce timer
  if (persistDebounceTimer) {
    clearTimeout(persistDebounceTimer)
  }

  // Schedule persist after debounce delay
  persistDebounceTimer = setTimeout(() => {
    persistDebounceTimer = null
    void executePersist()
  }, PERSIST_DEBOUNCE_MS)
}

/**
 * Execute a persist operation, handling concurrency.
 */
async function executePersist(): Promise<void> {
  if (!database.value) return

  // If already persisting, queue for later
  if (isPersisting) {
    persistQueuedWhileBusy = true
    return
  }

  isPersisting = true

  try {
    await saveToIndexedDB(database.value.export())
  } catch (err) {
    // Log error but don't throw - persistence failure shouldn't crash the app
    console.error('Failed to persist database:', err)
  } finally {
    isPersisting = false

    // If writes occurred during persist, do another persist
    if (persistQueuedWhileBusy) {
      persistQueuedWhileBusy = false
      void executePersist()
    }
  }
}

/**
 * Immediately persist database (bypassing debounce).
 * Used when app is about to be suspended/hidden.
 */
async function persistImmediately(): Promise<void> {
  // Cancel any pending debounced persist
  if (persistDebounceTimer) {
    clearTimeout(persistDebounceTimer)
    persistDebounceTimer = null
  }

  if (!database.value) return

  // Wait for any in-progress persist to complete, then do final persist
  // This ensures we have the latest data saved
  if (isPersisting) {
    // Wait a bit for current persist to finish
    await new Promise((resolve) => setTimeout(resolve, 50))
  }

  await saveToIndexedDB(database.value.export())
}

/**
 * Synchronously persist database - last resort for beforeunload.
 */
function persistSync(): void {
  if (!database.value) return
  saveToIndexedDBSync(database.value.export())
}

// =============================================================================
// Lifecycle Event Handlers
// =============================================================================

let lifecycleListenersAttached = false

/**
 * Handle visibility change - save when app goes to background.
 * Critical for Android PWA where the WebView may be killed while backgrounded.
 */
function handleVisibilityChange(): void {
  if (document.visibilityState === 'hidden' && database.value) {
    // Use async persist but don't await - we want to start it immediately
    void persistImmediately()
  }
}

/**
 * Handle page hide - more reliable than beforeunload on mobile.
 */
function handlePageHide(): void {
  if (database.value) {
    // On page hide, use sync persist as async may not complete
    persistSync()
  }
}

/**
 * Handle before unload - last chance to save.
 */
function handleBeforeUnload(): void {
  if (database.value) {
    persistSync()
  }
}

/**
 * Attach lifecycle listeners for persistence.
 * Called once during first database initialization.
 */
function attachLifecycleListeners(): void {
  if (lifecycleListenersAttached) return

  // visibilitychange is the most reliable for mobile PWAs
  document.addEventListener('visibilitychange', handleVisibilityChange)

  // pagehide is more reliable than beforeunload on some browsers
  window.addEventListener('pagehide', handlePageHide)

  // beforeunload as a fallback
  window.addEventListener('beforeunload', handleBeforeUnload)

  lifecycleListenersAttached = true
}

// =============================================================================
// Migration Runner
// =============================================================================

/**
 * Initial schema migration SQL
 * Matches src/db/migrations/001-initial.sql
 */
const MIGRATION_001 = `
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

  CREATE INDEX IF NOT EXISTS idx_radicals_character ON radicals(character);
  CREATE INDEX IF NOT EXISTS idx_radicals_number ON radicals(number);

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

  CREATE INDEX IF NOT EXISTS idx_kanjis_character ON kanjis(character);
  CREATE INDEX IF NOT EXISTS idx_kanjis_stroke_count ON kanjis(stroke_count);
  CREATE INDEX IF NOT EXISTS idx_kanjis_jlpt_level ON kanjis(jlpt_level);
  CREATE INDEX IF NOT EXISTS idx_kanjis_joyo_level ON kanjis(joyo_level);

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

  CREATE INDEX IF NOT EXISTS idx_components_character ON components(character);
  CREATE INDEX IF NOT EXISTS idx_components_source_kanji_id ON components(source_kanji_id);

  CREATE TABLE IF NOT EXISTS kanji_components (
    kanji_id INTEGER NOT NULL,
    component_id INTEGER NOT NULL,
    position INTEGER,
    PRIMARY KEY (kanji_id, component_id),
    FOREIGN KEY (kanji_id) REFERENCES kanjis(id) ON DELETE CASCADE,
    FOREIGN KEY (component_id) REFERENCES components(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_kanji_components_kanji_id ON kanji_components(kanji_id);
  CREATE INDEX IF NOT EXISTS idx_kanji_components_component_id ON kanji_components(component_id);

  CREATE TRIGGER IF NOT EXISTS update_kanjis_updated_at
    AFTER UPDATE ON kanjis
    FOR EACH ROW
  BEGIN
    UPDATE kanjis SET updated_at = datetime('now') WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_components_updated_at
    AFTER UPDATE ON components
    FOR EACH ROW
  BEGIN
    UPDATE components SET updated_at = datetime('now') WHERE id = OLD.id;
  END;

  CREATE TRIGGER IF NOT EXISTS update_radicals_updated_at
    AFTER UPDATE ON radicals
    FOR EACH ROW
  BEGIN
    UPDATE radicals SET updated_at = datetime('now') WHERE id = OLD.id;
  END;
`

function runMigrations(db: Database): void {
  // Check current schema version
  const versionResult = db.exec('PRAGMA user_version')
  const versionValue = versionResult[0]?.values[0]?.[0]
  const currentVersion = typeof versionValue === 'number' ? versionValue : 0

  // Run migrations in order
  if (currentVersion < 1) {
    db.run(MIGRATION_001)
    db.run('PRAGMA user_version = 1')
  }

  // Migration 002: Split notes into categories
  if (currentVersion < 2) {
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
      // Drop old column
      db.run('ALTER TABLE kanjis DROP COLUMN notes')
    }
    db.run('PRAGMA user_version = 2')
  }
}

// =============================================================================
// Singleton State
// =============================================================================

const database = shallowRef<Database | null>(null)
const isInitialized = ref(false)
const isInitializing = ref(false)
const initError = ref<Error | null>(null)

let initPromise: Promise<void> | null = null

// =============================================================================
// Composable
// =============================================================================

export interface UseDatabase {
  /** The sql.js database instance. Null until initialized. */
  database: Readonly<typeof database>
  /** Whether the database has been initialized */
  isInitialized: Readonly<typeof isInitialized>
  /** Whether initialization is in progress */
  isInitializing: Readonly<typeof isInitializing>
  /** Error that occurred during initialization, if any */
  initError: Readonly<typeof initError>
  /** Initialize the database. Safe to call multiple times. */
  initialize: () => Promise<void>
  /** Persist current database state to IndexedDB */
  persist: () => Promise<void>
  /** Execute a SQL query and return results */
  exec: (sql: string, params?: unknown[]) => ReturnType<Database['exec']>
  /** Execute a SQL statement (no results) */
  run: (sql: string, params?: unknown[]) => void
  /** Replace the current database with imported data */
  replaceDatabase: (data: Uint8Array) => Promise<void>
}

export function useDatabase(): UseDatabase {
  async function initialize(): Promise<void> {
    // If already initialized, return immediately
    if (isInitialized.value) {
      return
    }

    // If initialization is in progress, wait for it
    if (initPromise) {
      return initPromise
    }

    // Start initialization
    isInitializing.value = true
    initError.value = null

    initPromise = (async () => {
      try {
        // Dynamic import for sql.js to ensure proper ESM loading
        const { default: initSqlJs } = await import('sql.js')

        // Initialize sql.js
        const SQL = await initSqlJs({
          // Load WASM from CDN - in production this could be self-hosted
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        })

        // Try to load existing database from IndexedDB
        const existingData = await loadFromIndexedDB()

        if (existingData) {
          // Load existing database
          database.value = new SQL.Database(existingData)
        } else {
          // Create new database
          database.value = new SQL.Database()
        }

        // Run any pending migrations
        runMigrations(database.value)

        // Persist after migrations
        await saveToIndexedDB(database.value.export())

        // Attach lifecycle listeners for automatic persistence
        attachLifecycleListeners()

        isInitialized.value = true
      } catch (err) {
        initError.value = err instanceof Error ? err : new Error(String(err))
        throw initError.value
      } finally {
        isInitializing.value = false
      }
    })()

    return initPromise
  }

  async function persist(): Promise<void> {
    if (!database.value) {
      throw new Error('Database not initialized')
    }
    await saveToIndexedDB(database.value.export())
  }

  function exec(sql: string, params?: unknown[]): ReturnType<Database['exec']> {
    if (!database.value) {
      throw new Error('Database not initialized')
    }
    return database.value.exec(sql, params)
  }

  function run(sql: string, params?: unknown[]): void {
    if (!database.value) {
      throw new Error('Database not initialized')
    }
    database.value.run(sql, params)
    // Auto-persist to IndexedDB after write operations (debounced)
    // This groups rapid writes into a single save operation
    schedulePersist()
  }

  async function replaceDatabase(data: Uint8Array): Promise<void> {
    // Dynamic import for sql.js to ensure proper ESM loading
    const { default: initSqlJs } = await import('sql.js')

    // Initialize sql.js
    const SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    })

    // Create new database from imported data
    const newDb = new SQL.Database(data)

    // Run migrations to ensure schema is up to date
    runMigrations(newDb)

    // Close old database if it exists
    if (database.value) {
      database.value.close()
    }

    // Replace the singleton database instance
    database.value = newDb

    // Persist to IndexedDB
    await saveToIndexedDB(newDb.export())

    // Ensure initialized state is set
    isInitialized.value = true
  }

  return {
    database: readonly(database),
    isInitialized: readonly(isInitialized),
    isInitializing: readonly(isInitializing),
    initError: readonly(initError),
    initialize,
    persist,
    exec,
    run,
    replaceDatabase
  }
}
