import initSqlJs from 'sql.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { initializeDatabase, replaceDatabaseWithImported } from './init';

import type { Database } from 'sql.js';

let sqlPromise: ReturnType<typeof initSqlJs> | undefined;

// Node resolves the wasm itself; ignore the browser-only locateFile option
vi.mock('sql.js', async (importOriginal) => {
  const actual = await importOriginal<{ default: typeof initSqlJs }>();
  return {
    ...actual,
    default: () => (sqlPromise ??= actual.default()),
  };
});

vi.mock('./lifecycle', () => ({
  attachLifecycleListeners: vi.fn(),
}));

vi.mock('./indexeddb', () => ({
  saveToIndexedDB: vi.fn(),
  setDatabaseRef: vi.fn(),
  setOnPersistError: vi.fn(),
  loadFromIndexedDB: vi.fn(),
}));

import { loadFromIndexedDB, saveToIndexedDB, setDatabaseRef, setOnPersistError } from './indexeddb';
import { attachLifecycleListeners } from './lifecycle';

async function bytesOf(setup: (db: Database) => void): Promise<Uint8Array> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  setup(db);
  const data = db.export();
  db.close();
  return data;
}

describe('replaceDatabaseWithImported', () => {
  it('closes the new connection and rethrows when a migration fails', async () => {
    // Passes import validation (a kanjis table) but lacks the columns the
    // migrations alter.
    const data = await bytesOf((db) => {
      db.run('CREATE TABLE kanjis (id INTEGER PRIMARY KEY)');
    });

    const SQL = await initSqlJs();
    const close = vi.spyOn(SQL.Database.prototype, 'close');

    await expect(replaceDatabaseWithImported(data)).rejects.toThrow();

    expect(close).toHaveBeenCalledTimes(1);

    expect(setDatabaseRef).not.toHaveBeenCalled();
    expect(saveToIndexedDB).not.toHaveBeenCalled();
  });
});

function scalar(db: Database, sql: string): unknown {
  return db.exec(sql)[0]?.values[0]?.[0];
}

describe('initializeDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(loadFromIndexedDB).mockResolvedValue(null);
  });

  it('creates a migrated database with foreign keys on when nothing is stored', async () => {
    const db = await initializeDatabase();

    expect(scalar(db, 'PRAGMA foreign_keys')).toBe(1);
    expect(scalar(db, "SELECT name FROM sqlite_master WHERE name = 'kanjis'")).toBe('kanjis');
  });

  it('opens the stored bytes instead of creating a new database', async () => {
    const stored = await bytesOf((db) => {
      db.run('CREATE TABLE marker (id INTEGER)');
      db.run('INSERT INTO marker VALUES (42)');
    });
    vi.mocked(loadFromIndexedDB).mockResolvedValue(stored);

    const db = await initializeDatabase();

    expect(scalar(db, 'SELECT id FROM marker')).toBe(42);
    expect(scalar(db, 'PRAGMA foreign_keys')).toBe(1);
  });

  it('points persistence at the database, then saves once after migrating', async () => {
    const db = await initializeDatabase();

    expect(setDatabaseRef).toHaveBeenCalledWith(db);
    expect(saveToIndexedDB).toHaveBeenCalledTimes(1);
    expect(vi.mocked(setDatabaseRef).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(saveToIndexedDB).mock.invocationCallOrder[0] ?? 0
    );
    const saved = vi.mocked(saveToIndexedDB).mock.calls[0]?.[0] ?? new Uint8Array();
    const SQL = await initSqlJs();
    const reopened = new SQL.Database(saved);
    expect(scalar(reopened, "SELECT name FROM sqlite_master WHERE name = 'kanjis'")).toBe('kanjis');
  });

  it('registers the persist-error callback and attaches the lifecycle listeners', async () => {
    const onPersistError = vi.fn();

    await initializeDatabase(onPersistError);

    expect(setOnPersistError).toHaveBeenCalledWith(onPersistError);
    expect(attachLifecycleListeners).toHaveBeenCalledWith(onPersistError);
  });

  it('registers no persist-error callback when none is given', async () => {
    await initializeDatabase();

    expect(setOnPersistError).not.toHaveBeenCalled();
    expect(attachLifecycleListeners).toHaveBeenCalledWith(undefined);
  });
});
