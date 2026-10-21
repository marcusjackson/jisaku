/**
 * IndexedDB persistence layer for SQLite database
 *
 * Handles saving and loading the SQLite database binary to/from IndexedDB.
 * Provides both async and sync save methods for different lifecycle events.
 */

import { exportDatabase } from './export-database';

import type { Database } from 'sql.js';

const INDEXEDDB_NAME = 'kanji-dictionary';
const INDEXEDDB_STORE = 'database';
const INDEXEDDB_KEY = 'db';

/** Debounce delay for auto-persist after writes (ms) */
const PERSIST_DEBOUNCE_MS = 100;

/** Pending debounce timer for auto-persist */
let persistDebounceTimer: ReturnType<typeof setTimeout> | null = null;

/** In-progress persist promise — used to await completion without busy-waiting */
let currentPersistPromise: Promise<void> | null = null;

/** Queue the next persist after current one completes */
let persistQueuedWhileBusy = false;

/**
 * Change counter: bumped when a write schedules a persist. A save records the
 * counter value its export saw, and the database is unsaved while the two differ,
 * so a write landing during an in-flight save leaves it unsaved.
 */
let changeVersion = 0;

/** Counter value of the newest state known to be saved */
let savedVersion = 0;

/** Reference to the database instance for persistence */
let databaseRef: Database | null = null;

/** Optional error callback — called when a persist operation fails */
let onPersistError: ((err: Error) => void) | null = null;

// =============================================================================
// IndexedDB Operations
// =============================================================================

/** Open connection kept for reuse, so the final save can start without awaiting an open */
let cachedConnection: IDBDatabase | null = null;

/** In-flight open, shared so concurrent callers don't open twice */
let pendingConnection: Promise<IDBDatabase> | null = null;

/**
 * Open IndexedDB connection
 */
export function openIndexedDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXEDDB_NAME, 1);

    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'Failed to open IndexedDB'));
    };
    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(INDEXEDDB_STORE)) {
        db.createObjectStore(INDEXEDDB_STORE);
      }
    };
  });
}

/**
 * Return the shared connection, opening it on first use. The browser can close
 * a connection under us (`onclose`) or ask us to release it (`onversionchange`);
 * either drops the cache so the next call reopens.
 */
function getConnection(): Promise<IDBDatabase> {
  if (cachedConnection) return Promise.resolve(cachedConnection);
  if (pendingConnection) return pendingConnection;

  pendingConnection = openIndexedDB()
    .then((idb) => {
      const forget = () => {
        if (cachedConnection === idb) cachedConnection = null;
      };
      idb.onclose = forget;
      idb.onversionchange = () => {
        idb.close();
        forget();
      };
      cachedConnection = idb;
      return idb;
    })
    .finally(() => {
      pendingConnection = null;
    });
  return pendingConnection;
}

/**
 * Load database from IndexedDB
 */
export async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  const idb = await getConnection();

  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(INDEXEDDB_STORE, 'readonly');
    const store = transaction.objectStore(INDEXEDDB_STORE);
    const request = store.get(INDEXEDDB_KEY);

    request.onerror = () => {
      reject(new Error(request.error?.message ?? 'Failed to load from IndexedDB'));
    };
    request.onsuccess = () => {
      const result = request.result as Uint8Array | undefined;
      resolve(result ?? null);
    };
  });
}

/**
 * Save database to IndexedDB (async)
 */
export async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await getConnection();

  return new Promise((resolve, reject) => {
    const transaction = idb.transaction(INDEXEDDB_STORE, 'readwrite');
    const store = transaction.objectStore(INDEXEDDB_STORE);
    store.put(data, INDEXEDDB_KEY);

    // A save is done when the transaction completes, not when the request
    // succeeds: a quota failure aborts the transaction after the request
    // has already reported success.
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onabort = () => {
      reject(new Error(transaction.error?.message ?? 'Failed to save to IndexedDB'));
    };
    transaction.onerror = () => {
      reject(new Error(transaction.error?.message ?? 'Failed to save to IndexedDB'));
    };
  });
}

/**
 * Final save for pagehide/beforeunload, where nothing async can be relied on.
 *
 * When a connection is already open, the write transaction starts before this
 * returns, which is the only thing a closing page can be counted on to finish.
 * Without one (never opened, or the browser closed it) it can only begin
 * opening a connection and write once that succeeds, which may be too late.
 */
export function saveToIndexedDBSync(data: Uint8Array): void {
  if (cachedConnection) {
    try {
      cachedConnection
        .transaction(INDEXEDDB_STORE, 'readwrite')
        .objectStore(INDEXEDDB_STORE)
        .put(data, INDEXEDDB_KEY);
      return;
    } catch {
      // Connection closed without telling us; drop it and fall through
      cachedConnection = null;
    }
  }

  void getConnection()
    .then((idb) => {
      idb
        .transaction(INDEXEDDB_STORE, 'readwrite')
        .objectStore(INDEXEDDB_STORE)
        .put(data, INDEXEDDB_KEY);
    })
    .catch(() => {
      // Nothing left to do on a closing page
    });
}

// =============================================================================
// Persistence Management
// =============================================================================

/**
 * Set the database reference for persistence operations
 */
export function setDatabaseRef(db: Database | null): void {
  databaseRef = db;
}

/**
 * Register a callback to be called when a persist operation fails.
 * Use this to surface errors to the user (e.g. via a toast notification).
 */
export function setOnPersistError(callback: (err: Error) => void): void {
  onPersistError = callback;
}

/**
 * Schedule a debounced persist operation.
 * Groups rapid writes into a single IndexedDB save.
 */
export function schedulePersist(): void {
  if (!databaseRef) return;

  changeVersion++;

  // Clear any pending debounce timer
  if (persistDebounceTimer) {
    clearTimeout(persistDebounceTimer);
  }

  // Schedule persist after debounce delay
  persistDebounceTimer = setTimeout(() => {
    persistDebounceTimer = null;
    void executePersist();
  }, PERSIST_DEBOUNCE_MS);
}

/**
 * Execute a persist operation, handling concurrency.
 */
function executePersist(): Promise<void> {
  if (!databaseRef) return Promise.resolve();

  // If already persisting, queue for later and return the in-progress promise
  if (currentPersistPromise) {
    persistQueuedWhileBusy = true;
    return currentPersistPromise;
  }

  const exportedVersion = changeVersion;
  const db = databaseRef;
  // Starting from a resolved promise sends a synchronous export throw to
  // the catch below, so it reaches onPersistError like a failed write.
  currentPersistPromise = Promise.resolve()
    .then(() => saveToIndexedDB(exportDatabase(db)))
    .then(() => {
      savedVersion = Math.max(savedVersion, exportedVersion);
    })
    .catch((err: unknown) => {
      // Don't throw — persistence failure shouldn't crash the app
      // Surface the error to the caller via the registered error callback
      onPersistError?.(err instanceof Error ? err : new Error(String(err)));
    })
    .finally(() => {
      currentPersistPromise = null;

      // If writes occurred during persist, do another persist
      if (persistQueuedWhileBusy) {
        persistQueuedWhileBusy = false;
        void executePersist();
      }
    });

  return currentPersistPromise;
}

/**
 * Immediately persist database (bypassing debounce).
 * Used when app is about to be suspended/hidden.
 */
export async function persistImmediately(): Promise<void> {
  // Cancel any pending debounced persist
  if (persistDebounceTimer) {
    clearTimeout(persistDebounceTimer);
    persistDebounceTimer = null;
  }

  if (!databaseRef) return;

  // Wait for any in-progress persist to complete before doing the final save.
  // This avoids the race condition of a concurrent persist overwriting newer data.
  if (currentPersistPromise) {
    await currentPersistPromise;
  }

  // An explicit save means the caller treats the current state as unsaved
  // (e.g. a swapped-in import), so it counts as a change until the write succeeds.
  const exportedVersion = ++changeVersion;
  await saveToIndexedDB(exportDatabase(databaseRef));
  savedVersion = Math.max(savedVersion, exportedVersion);
}

/**
 * True while this tab holds changes not yet confirmed saved, including a
 * debounced save still pending. The hide and close handlers save only then,
 * so a tab that merely sat in the background never overwrites a newer save.
 */
export function hasUnsavedChanges(): boolean {
  return changeVersion !== savedVersion;
}

/**
 * Synchronously persist database - last resort for beforeunload.
 */
export function persistSync(): void {
  if (!databaseRef) return;
  saveToIndexedDBSync(exportDatabase(databaseRef));
}
