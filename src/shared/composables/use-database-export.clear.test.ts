/**
 * Clear all data against a real sql.js database with foreign keys on.
 */

import { createTestDatabase } from '@test/helpers/database';
import {
  seedGroupMember,
  seedKanji,
  seedMeaning,
  seedReadingGroup,
} from '@test/helpers/database/seeders';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inTransaction } from '@/db/transaction';

import type { Database } from 'sql.js';

const { persist, toastError, toastSuccess } = vi.hoisted(() => ({
  persist: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

let testDb: Database;
const run = (sql: string): void => {
  testDb.run(sql);
};

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    database: { value: testDb },
    persist,
    replaceDatabase: vi.fn(),
    run,
    transaction: <T>(fn: () => T): T => inTransaction(run, fn),
  }),
}));

vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({ success: toastSuccess, error: toastError }),
}));

import { useDatabaseExport } from './use-database-export';

const KEPT = new Set(['classification_types', 'position_types', 'sqlite_sequence']);

function userTables(): string[] {
  const rows = testDb.exec("SELECT name FROM sqlite_master WHERE type = 'table'");
  return (rows[0]?.values ?? []).map((r) => r[0] as string).filter((name) => !KEPT.has(name));
}

function count(table: string): number {
  return testDb.exec(`SELECT COUNT(*) FROM ${table}`)[0]?.values[0]?.[0] as number;
}

describe('clearDatabase', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    persist.mockResolvedValue(undefined);
    testDb = await createTestDatabase();
    const kanji = seedKanji(testDb, { character: '水', strokeCount: 4 });
    const meaningId = seedMeaning(testDb, kanji.id, { meaningText: 'water' });
    const groupId = seedReadingGroup(testDb, kanji.id, { readingText: 'スイ' });
    seedGroupMember(testDb, groupId, meaningId);
  });

  it('empties every user table, including the reading-group tables', async () => {
    // An orphan the kanjis cascade cannot reach
    testDb.run('PRAGMA foreign_keys = OFF');
    testDb.run(
      "INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text) VALUES (999, 'x')"
    );
    testDb.run('PRAGMA foreign_keys = ON');

    await useDatabaseExport().clearDatabase();

    for (const table of userTables()) {
      expect({ table, rows: count(table) }).toEqual({ table, rows: 0 });
    }
  });

  it('leaves every table as it was when a statement fails part-way', async () => {
    const before = Object.fromEntries(
      userTables()
        .filter((t) => t !== 'vocab_kanji')
        .map((t) => [t, count(t)])
    );
    // Seeds don't touch this one, so dropping it makes the last-but-two delete throw
    testDb.run('DROP TABLE vocab_kanji');

    await useDatabaseExport().clearDatabase();

    const after = Object.fromEntries(userTables().map((t) => [t, count(t)]));
    expect(after).toEqual(before);
  });

  it('says the data was cleared when only the save fails', async () => {
    persist.mockRejectedValueOnce(new Error('quota'));

    await useDatabaseExport().clearDatabase();

    expect(count('kanjis')).toBe(0);
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledWith('Cleared, but saving failed: quota');
  });

  it('reports a clear failure without trying to save', async () => {
    testDb.run('DROP TABLE vocab_kanji');

    await useDatabaseExport().clearDatabase();

    expect(persist).not.toHaveBeenCalled();
    expect(toastError).toHaveBeenCalledTimes(1);
  });
});
