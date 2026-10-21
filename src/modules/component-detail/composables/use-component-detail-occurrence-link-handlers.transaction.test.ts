/**
 * Create-and-link atomicity, against a real in-memory database and the real
 * transaction wrapper: a failed link must leave no new kanji behind.
 */

import { createTestDatabase, seedComponent } from '@test/helpers/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { inTransaction } from '@/db/transaction';

import type { useComponentOccurrenceRepository } from '@/api/component';
import type { Database } from 'sql.js';

let testDb: Database;

function run(sql: string, params?: unknown[]): void {
  testDb.run(sql, params);
}

const database = {
  exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
  run,
  transaction: <T>(fn: () => T): T => inTransaction(run, fn),
};

const mockError = vi.fn();

vi.mock('@/shared/composables/use-database', () => ({ useDatabase: () => database }));
vi.mock('@/shared/composables', () => ({
  useDatabase: () => database,
  useToast: () => ({ success: vi.fn(), error: mockError }),
}));
vi.mock('@/db/indexeddb', () => ({ schedulePersist: vi.fn() }));

import { useComponentDetailOccurrenceLinkHandlers } from './use-component-detail-occurrence-link-handlers';

function countKanji(): number {
  return testDb.exec('SELECT COUNT(*) FROM kanjis')[0]?.values[0]?.[0] as number;
}

describe('useComponentDetailOccurrenceLinkHandlers (real transaction)', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    testDb = await createTestDatabase();
  });

  it('rolls the new kanji back when the link throws', () => {
    const component = seedComponent(testDb, { character: '氵' });
    const failingRepo = {
      create: () => {
        throw new Error('Link failed');
      },
    } as unknown as ReturnType<typeof useComponentOccurrenceRepository>;
    const { handleOccurrenceCreate } = useComponentDetailOccurrenceLinkHandlers({
      componentId: { value: component.id } as never,
      kanjiOptions: { value: [] } as never,
      reloadOccurrences: vi.fn(),
      occurrenceRepo: failingRepo,
    });

    const created = handleOccurrenceCreate({ character: '木' });

    expect(created).toBe(false);
    expect(mockError).toHaveBeenCalledWith('Link failed');
    expect(countKanji()).toBe(0);
  });
});
