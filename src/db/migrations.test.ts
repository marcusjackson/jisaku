/**
 * Database migration infrastructure tests.
 *
 * Verifies that running all migrations against an empty SQLite database
 * produces the expected schema — ensuring the migration runner stays in sync
 * with the schema used by repositories and test helpers.
 */

import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';

import { LATEST_VERSION, runMigrations } from './migrations';
import migration001 from './migrations/001-initial.sql?raw';

async function createMigratedDb() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON');
  runMigrations(db);
  return db;
}

describe('Database migrations', () => {
  it('keeps LATEST_VERSION equal to the highest migration file number', () => {
    const numbers = Object.keys(import.meta.glob('./migrations/*.sql')).map((path) =>
      Number(/\/(\d+)-[^/]*\.sql$/.exec(path)?.[1])
    );
    expect(LATEST_VERSION).toBe(Math.max(...numbers));
  });

  it('applies all migrations without throwing', async () => {
    await expect(createMigratedDb()).resolves.toBeDefined();
  });

  it('creates all expected top-level tables', async () => {
    const db = await createMigratedDb();

    const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    const tables = (result[0]?.values ?? []).map((r) => r[0] as string);

    // Core entity tables that all repositories depend on
    const expected = [
      'classification_types',
      'component_forms',
      'component_groupings',
      'component_grouping_members',
      'component_occurrences',
      'components',
      'kanji_classifications',
      'kanji_meanings',
      'kanjis',
      'kun_readings',
      'on_readings',
      'position_types',
      'vocabulary',
      'vocab_kanji',
    ];

    for (const table of expected) {
      expect(tables).toContain(table);
    }
  });

  it('sets a non-zero user_version after migrations', async () => {
    const db = await createMigratedDb();

    const result = db.exec('PRAGMA user_version');
    const version = result[0]?.values[0]?.[0] as number;

    expect(version).toBeGreaterThan(0);
  });

  it('enables foreign_keys pragma', async () => {
    const db = await createMigratedDb();

    const result = db.exec('PRAGMA foreign_keys');
    const foreignKeysEnabled = result[0]?.values[0]?.[0];

    expect(foreignKeysEnabled).toBe(1);
  });

  it('can apply migrations idempotently (running twice does not throw)', async () => {
    const db = await createMigratedDb();

    // Running migrations again on an already-migrated DB should be a no-op
    expect(() => {
      runMigrations(db);
    }).not.toThrow();
  });

  it('keeps kanji_components rows through the version 3 table rebuild', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run(migration001);
    for (const column of ['etymology', 'cultural', 'personal']) {
      db.run(`ALTER TABLE kanjis ADD COLUMN notes_${column} TEXT`);
    }
    db.run('PRAGMA user_version = 2');
    db.run('PRAGMA foreign_keys = ON');
    db.run("INSERT INTO kanjis (character, stroke_count) VALUES ('明', 8)");
    db.run("INSERT INTO components (character, stroke_count) VALUES ('日', 4)");
    db.run('INSERT INTO kanji_components (kanji_id, component_id) VALUES (1, 1)');

    runMigrations(db);

    const rows = db.exec('SELECT kanji_id, component_id FROM component_occurrences');
    expect(rows[0]?.values).toEqual([[1, 1]]);
  });

  it('rejects a database newer than the latest known version', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run(`PRAGMA user_version = ${String(LATEST_VERSION + 80)}`);

    expect(() => {
      runMigrations(db);
    }).toThrow('newer than this app supports');
    expect(db.exec('PRAGMA user_version')[0]?.values[0]?.[0]).toBe(LATEST_VERSION + 80);
  });

  it('restores the foreign_keys setting it found', async () => {
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run('PRAGMA foreign_keys = OFF');
    runMigrations(db);

    expect(db.exec('PRAGMA foreign_keys')[0]?.values[0]?.[0]).toBe(0);
  });
});
