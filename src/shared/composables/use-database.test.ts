/**
 * Tests for useDatabase composable
 *
 * These tests verify the database composable's core functionality.
 * Note: Since this composable uses IndexedDB (not available in jsdom),
 * we test the synchronous parts and mock the persistence layer.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Database } from 'sql.js';

// Mock IndexedDB since it's not available in jsdom
const mockIDBStore = new Map<string, Uint8Array>();

const mockIndexedDB = {
  open: vi.fn(() => {
    const request = {
      result: {
        objectStoreNames: { contains: () => true },
        createObjectStore: vi.fn(),
        transaction: () => ({
          objectStore: () => ({
            get: (key: string) => {
              const req = {
                result: mockIDBStore.get(key),
                onerror: null as (() => void) | null,
                onsuccess: null as (() => void) | null,
              };
              setTimeout(() => req.onsuccess?.(), 0);
              return req;
            },
            put: (data: Uint8Array, key: string) => {
              mockIDBStore.set(key, data);
              const req = {
                onerror: null as (() => void) | null,
                onsuccess: null as (() => void) | null,
              };
              setTimeout(() => req.onsuccess?.(), 0);
              return req;
            },
          }),
        }),
      },
      onerror: null as (() => void) | null,
      onsuccess: null as (() => void) | null,
      onupgradeneeded: null as (() => void) | null,
    };
    setTimeout(() => request.onsuccess?.(), 0);
    return request;
  }),
};

vi.stubGlobal('indexedDB', mockIndexedDB);

// Mock the database modules
let mockDb: Database;

vi.mock('@/db/init', () => ({
  initializeDatabase: vi.fn(function () {
    return Promise.resolve(mockDb);
  }),
  replaceDatabaseWithImported: vi.fn(function () {
    return Promise.resolve(mockDb);
  }),
}));

vi.mock('@/db/indexeddb', () => ({
  saveToIndexedDB: vi.fn(function () {
    return Promise.resolve();
  }),
  schedulePersist: vi.fn(),
  setDatabaseRef: vi.fn(),
  persistImmediately: vi.fn(function () {
    return Promise.resolve();
  }),
}));

// Import after mocking
import {
  persistImmediately,
  saveToIndexedDB,
  schedulePersist,
  setDatabaseRef,
} from '@/db/indexeddb';
import { initializeDatabase, replaceDatabaseWithImported } from '@/db/init';

import { useDatabase } from './use-database';

describe('useDatabase', function () {
  beforeEach(() => {
    // Create a fresh mock database instance
    mockDb = {
      exec: vi.fn(() => []),
      run: vi.fn(),
      export: vi.fn(() => new Uint8Array([1, 2, 3])),
      close: vi.fn(),
    };

    vi.clearAllMocks();
    mockIDBStore.clear();
  });

  it('returns the expected interface', () => {
    const db = useDatabase();

    expect(db).toHaveProperty('database');
    expect(db).toHaveProperty('initialize');
    expect(db).toHaveProperty('exec');
    expect(db).toHaveProperty('run');
    expect(db).toHaveProperty('persist');
    expect(db).toHaveProperty('replaceDatabase');
    expect(db).toHaveProperty('isInitialized');
    expect(db).toHaveProperty('isInitializing');
    expect(db).toHaveProperty('initError');
  });

  it('provides full database functionality', async () => {
    const db = useDatabase();
    const mockResults = [{ columns: ['id'], values: [[1]] }];

    // Initialize
    await db.initialize();
    expect(initializeDatabase).toHaveBeenCalled();
    expect(db.isInitialized.value).toBe(true);

    // Execute queries
    vi.mocked(mockDb.exec).mockReturnValue(mockResults);
    const results = db.exec('SELECT * FROM kanji WHERE id = ?', [1]);
    expect(mockDb.exec).toHaveBeenCalledWith('SELECT * FROM kanji WHERE id = ?', [1]);
    expect(results).toBe(mockResults);

    // Execute statements
    db.run('INSERT INTO kanji (character) VALUES (?)', ['水']);
    expect(mockDb.run).toHaveBeenCalledWith('INSERT INTO kanji (character) VALUES (?)', ['水']);
    expect(schedulePersist).toHaveBeenCalled();

    // Persist goes through persistImmediately so the save is recorded as saved
    await db.persist();
    expect(persistImmediately).toHaveBeenCalledTimes(1);
    expect(saveToIndexedDB).not.toHaveBeenCalled();
  });

  it('retries initialization after a failed attempt', async () => {
    // The composable keeps module-level state, so load a fresh copy
    vi.resetModules();
    const init = await import('@/db/init');
    const fresh = await import('./use-database');
    const db = fresh.useDatabase();
    vi.mocked(init.initializeDatabase).mockRejectedValueOnce(new Error('boot failed'));

    await expect(db.initialize()).rejects.toThrow('boot failed');
    expect(db.isInitialized.value).toBe(false);

    await db.initialize();
    expect(init.initializeDatabase).toHaveBeenCalledTimes(2);
    expect(db.isInitialized.value).toBe(true);
    expect(db.initError.value).toBeNull();
  });

  it('replaces database with new data', async () => {
    const db = useDatabase();
    const newData = new Uint8Array([4, 5, 6]);

    await db.replaceDatabase(newData);

    expect(replaceDatabaseWithImported).toHaveBeenCalledWith(newData);
    expect(db.isInitialized.value).toBe(true);
  });

  it('keeps the live database when the import fails to build', async () => {
    const db = useDatabase();
    await db.initialize();
    const live = db.database.value!;
    vi.mocked(replaceDatabaseWithImported).mockRejectedValueOnce(new Error('migration failed'));

    await expect(db.replaceDatabase(new Uint8Array([1]))).rejects.toThrow('migration failed');

    expect(live.close).not.toHaveBeenCalled();
    expect(setDatabaseRef).not.toHaveBeenCalledWith(expect.anything());
    expect(db.database.value).toBe(live);
  });

  it('swaps the ref, closes the old database, then persists', async () => {
    const db = useDatabase();
    await db.initialize();
    const live = db.database.value!;
    const imported = { ...mockDb, close: vi.fn() } as unknown as Database;
    vi.mocked(replaceDatabaseWithImported).mockResolvedValueOnce(imported);

    await db.replaceDatabase(new Uint8Array([1]));

    expect(setDatabaseRef).toHaveBeenCalledWith(imported);
    expect(db.database.value).toBe(imported);
    expect(live.close).toHaveBeenCalled();
    expect(persistImmediately).toHaveBeenCalled();

    const order = (fn: unknown) => vi.mocked(fn as () => void).mock.invocationCallOrder[0] ?? 0;
    expect(order(setDatabaseRef)).toBeLessThan(order(live.close));
    expect(order(live.close)).toBeLessThan(order(persistImmediately));
  });

  it('reports a failed save after the swap as a save failure', async () => {
    const db = useDatabase();
    await db.initialize();
    const imported = { ...mockDb, close: vi.fn() } as unknown as Database;
    vi.mocked(replaceDatabaseWithImported).mockResolvedValueOnce(imported);
    vi.mocked(persistImmediately).mockRejectedValueOnce(new Error('quota'));

    await expect(db.replaceDatabase(new Uint8Array([1]))).rejects.toThrow(
      'Imported, but saving failed: quota'
    );
    expect(db.database.value).toBe(imported);
  });
});

describe('useDatabase on a fresh module', () => {
  async function loadFresh() {
    // The composable keeps module-level state, so load a fresh copy
    vi.resetModules();
    const init = await import('@/db/init');
    const fresh = await import('./use-database');
    return { db: fresh.useDatabase(), init };
  }

  beforeEach(() => {
    mockDb = {
      exec: vi.fn(() => []),
      run: vi.fn(),
      export: vi.fn(() => new Uint8Array([1, 2, 3])),
      close: vi.fn(),
    };
    vi.clearAllMocks();
  });

  it('records the error and clears the initializing flag when init rejects', async () => {
    const { db, init } = await loadFresh();
    vi.mocked(init.initializeDatabase).mockRejectedValueOnce(new Error('boot failed'));

    await expect(db.initialize()).rejects.toThrow('boot failed');

    expect(db.initError.value?.message).toBe('boot failed');
    expect(db.isInitializing.value).toBe(false);
    expect(db.isInitialized.value).toBe(false);
  });

  it('wraps a non-Error rejection in an Error', async () => {
    const { db, init } = await loadFresh();
    vi.mocked(init.initializeDatabase).mockRejectedValueOnce('plain string');

    await expect(db.initialize()).rejects.toThrow('plain string');
    expect(db.initError.value).toBeInstanceOf(Error);
  });

  it('throws from exec, run and persist before initialization', async () => {
    const { db } = await loadFresh();

    expect(() => db.exec('SELECT 1')).toThrow('Database not initialized');
    expect(() => {
      db.run('DELETE FROM kanjis');
    }).toThrow('Database not initialized');
    await expect(db.persist()).rejects.toThrow('Database not initialized');
    expect(schedulePersist).not.toHaveBeenCalled();
  });

  it('wraps a transaction in BEGIN and COMMIT', async () => {
    const { db } = await loadFresh();
    await db.initialize();

    const result = db.transaction(() => {
      db.run('DELETE FROM kanjis');
      return 42;
    });

    expect(result).toBe(42);
    expect(vi.mocked(mockDb.run).mock.calls.map((c) => c[0])).toEqual([
      'BEGIN TRANSACTION',
      'DELETE FROM kanjis',
      'COMMIT',
    ]);
  });

  it('rolls back and rethrows when the transaction callback throws', async () => {
    const { db } = await loadFresh();
    await db.initialize();

    expect(() =>
      db.transaction(() => {
        throw new Error('step failed');
      })
    ).toThrow('step failed');

    expect(vi.mocked(mockDb.run).mock.calls.map((c) => c[0])).toEqual([
      'BEGIN TRANSACTION',
      'ROLLBACK',
    ]);
  });

  it('runs initialization once for concurrent and repeated calls', async () => {
    const { db, init } = await loadFresh();

    await Promise.all([db.initialize(), db.initialize()]);
    await db.initialize();

    expect(init.initializeDatabase).toHaveBeenCalledTimes(1);
    expect(db.isInitialized.value).toBe(true);
  });
});
