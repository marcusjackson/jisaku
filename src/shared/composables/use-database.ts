/**
 * Database access composable
 *
 * Thin wrapper exposing initialized database state.
 * Core database logic has been split into focused modules:
 * - src/db/init.ts - Database initialization
 * - src/db/indexeddb.ts - IndexedDB persistence
 * - src/db/lifecycle.ts - Page lifecycle handlers
 * - src/db/migrations/ - Migration runner and SQL files
 *
 * Persistence strategy (debounce, hide and unload saves) lives in
 * src/db/lifecycle.ts and src/db/indexeddb.ts; see the header of lifecycle.ts.
 */

import { markRaw, readonly, ref, shallowRef } from 'vue';

import { useToast } from '@/shared/composables/use-toast';

import { persistImmediately, schedulePersist, setDatabaseRef } from '@/db/indexeddb';
import { initializeDatabase, replaceDatabaseWithImported } from '@/db/init';
import { inTransaction } from '@/db/transaction';

import type { Database } from 'sql.js';
import type { Ref, ShallowRef } from 'vue';

// =============================================================================
// Singleton State
// =============================================================================

const database = shallowRef<Database | null>(null);
const isInitialized = ref(false);
const isInitializing = ref(false);
const initError = ref<Error | null>(null);

let initPromise: Promise<void> | null = null;

// =============================================================================
// Composable Interface
// =============================================================================

export interface UseDatabaseReturn {
  /** The sql.js database instance. Null until initialized. Read-only — do not mutate directly. */
  database: Readonly<ShallowRef<Database | null>>;
  /** Whether the database has been initialized */
  isInitialized: Readonly<Ref<boolean>>;
  /** Whether initialization is in progress */
  isInitializing: Readonly<Ref<boolean>>;
  /** Error that occurred during initialization, if any */
  initError: Readonly<Ref<Error | null>>;
  /** Initialize the database. Safe to call multiple times. */
  initialize: () => Promise<void>;
  /** Persist current database state to IndexedDB */
  persist: () => Promise<void>;
  /** Execute a SQL query and return results */
  exec: (sql: string, params?: unknown[]) => ReturnType<Database['exec']>;
  /** Execute a SQL statement (no results) */
  run: (sql: string, params?: unknown[]) => void;
  /** Run `fn` in one transaction: commit on success, roll back and rethrow on error. A call inside an open transaction joins it. */
  transaction: <T>(fn: () => T) => T;
  /** Replace the current database with imported data */
  replaceDatabase: (data: Uint8Array) => Promise<void>;
}

// =============================================================================
// Database Operations (module-level, operate on singleton state)
// =============================================================================

async function initialize(): Promise<void> {
  if (isInitialized.value) return;
  if (initPromise) return initPromise;

  isInitializing.value = true;
  initError.value = null;

  initPromise = (async () => {
    try {
      const toast = useToast();
      database.value = markRaw(
        await initializeDatabase((err) => {
          toast.error(`Failed to save database: ${err.message}`);
        })
      );
      isInitialized.value = true;
    } catch (err) {
      initError.value = err instanceof Error ? err : new Error(String(err));
      // Let a later initialize() retry instead of replaying this rejection
      initPromise = null;
      throw initError.value;
    } finally {
      isInitializing.value = false;
    }
  })();

  return initPromise;
}

async function persist(): Promise<void> {
  if (!database.value) throw new Error('Database not initialized');
  // persistImmediately records the save, so the lifecycle handlers see it as saved
  await persistImmediately();
}

function exec(sql: string, params?: unknown[]): ReturnType<Database['exec']> {
  if (!database.value) throw new Error('Database not initialized');
  return database.value.exec(sql, params);
}

function run(sql: string, params?: unknown[]): void {
  if (!database.value) throw new Error('Database not initialized');
  database.value.run(sql, params);
  // Auto-persist to IndexedDB after write operations (debounced)
  schedulePersist();
}

function transaction<T>(fn: () => T): T {
  return inTransaction(run, fn);
}

/**
 * Swap in an imported database. The new database is built and migrated first,
 * so a failure there leaves the live one untouched. The persistence ref and
 * `database.value` then move together with no `await` between them, so no
 * save can export the old database after the import.
 */
async function replaceDatabase(data: Uint8Array): Promise<void> {
  const imported = await replaceDatabaseWithImported(data);
  const previous = database.value;
  setDatabaseRef(imported);
  database.value = markRaw(imported);
  isInitialized.value = true;
  previous?.close();

  try {
    await persistImmediately();
  } catch (err) {
    // The app is live on the imported data, but a reload would restore the old.
    const reason = err instanceof Error ? err.message : String(err);
    throw new Error(`Imported, but saving failed: ${reason}`, { cause: err });
  }
}

// =============================================================================
// Composable
// =============================================================================

/**
 * Composable providing access to the shared sql.js database instance.
 *
 * Exposes a singleton database with reactive state for initialization
 * status, error handling, and persistence. The database instance is
 * read-only — use `exec` and `run` for queries and mutations.
 *
 * @example
 * const { database, isInitialized, initialize } = useDatabase()
 */
export function useDatabase(): UseDatabaseReturn {
  return {
    database: readonly(database),
    isInitialized: readonly(isInitialized),
    isInitializing: readonly(isInitializing),
    initError: readonly(initError),
    initialize,
    persist,
    exec,
    run,
    transaction,
    replaceDatabase,
  };
}
