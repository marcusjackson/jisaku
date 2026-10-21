import initSqlJs from 'sql.js';
import { describe, expect, it } from 'vitest';

import { exportDatabase } from './export-database';

import type { Database } from 'sql.js';

function scalar(db: Database, sql: string): unknown {
  return db.exec(sql)[0]?.values[0]?.[0];
}

function foreignKeys(db: Database): unknown {
  return scalar(db, 'PRAGMA foreign_keys');
}

async function createParentChildDb(): Promise<Database> {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run('PRAGMA foreign_keys = ON');
  db.run('CREATE TABLE parent (id INTEGER PRIMARY KEY)');
  db.run(
    `CREATE TABLE child (
      id INTEGER PRIMARY KEY,
      parent_id INTEGER REFERENCES parent(id) ON DELETE CASCADE
    )`
  );
  db.run('INSERT INTO parent (id) VALUES (1)');
  db.run('INSERT INTO child (id, parent_id) VALUES (1, 1)');
  return db;
}

describe('exportDatabase', () => {
  it('shows that a raw export() turns foreign keys off', async () => {
    const db = await createParentChildDb();
    expect(foreignKeys(db)).toBe(1);
    db.export();
    expect(foreignKeys(db)).toBe(0);
  });

  it('keeps foreign keys on after exporting', async () => {
    const db = await createParentChildDb();
    exportDatabase(db);
    expect(foreignKeys(db)).toBe(1);
  });

  it('cascades a parent delete after exporting', async () => {
    const db = await createParentChildDb();
    exportDatabase(db);
    db.run('DELETE FROM parent WHERE id = 1');
    expect(scalar(db, 'SELECT COUNT(*) FROM child')).toBe(0);
  });

  it('returns the serialised database', async () => {
    const SQL = await initSqlJs();
    const db = await createParentChildDb();
    const copy = new SQL.Database(exportDatabase(db));
    expect(scalar(copy, 'SELECT COUNT(*) FROM parent')).toBe(1);
  });
});
