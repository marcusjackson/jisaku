/**
 * useSeedData tests
 */

import { createTestDatabase } from '@test/helpers/database';
import { describe, expect, it, vi } from 'vitest';

import type { Database } from 'sql.js';

// Mock useDatabase
const mockExec = vi.fn();
const mockRun = vi.fn();
const mockPersist = vi.fn();
const mockTransaction = vi.fn(<T>(fn: () => T): T => fn());

vi.mock('./use-database', () => ({
  useDatabase: () => ({
    exec: mockExec,
    persist: mockPersist,
    run: mockRun,
    transaction: mockTransaction,
  }),
}));

const mockClearDatabase = vi.fn();

vi.mock('./use-database-export', () => ({
  useDatabaseExport: () => ({ clearDatabase: mockClearDatabase }),
}));

// Mock useToast
const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();

vi.mock('./use-toast', () => ({
  useToast: () => ({
    error: mockShowError,
    success: mockShowSuccess,
  }),
}));

import { useSeedData } from './use-seed-data';

describe('useSeedData', () => {
  function resetMocks() {
    mockExec.mockReset();
    mockRun.mockReset();
    mockPersist.mockReset();
    mockTransaction.mockClear();
    mockPersist.mockResolvedValue(undefined);
    mockClearDatabase.mockReset();
    mockClearDatabase.mockResolvedValue(undefined);
    mockShowSuccess.mockReset();
    mockShowError.mockReset();
  }

  describe('seed', () => {
    it('returns seed and clear functions', () => {
      resetMocks();
      const result = useSeedData();

      expect(result).toHaveProperty('seed');
      expect(result).toHaveProperty('clear');
      expect(result).toHaveProperty('isSeeding');
      expect(result).toHaveProperty('isClearing');
    });

    it('checks for existing data before seeding', async () => {
      resetMocks();
      mockExec.mockReturnValue([{ values: [[0]] }]);

      const { seed } = useSeedData();
      await seed();

      expect(mockExec).toHaveBeenCalledWith('SELECT COUNT(*) FROM kanjis');
      expect(mockExec).toHaveBeenCalledWith('SELECT COUNT(*) FROM components');
    });

    it('shows error if database already has data', async () => {
      resetMocks();
      mockExec.mockReturnValue([{ values: [[5]] }]);

      const { seed } = useSeedData();
      await seed();

      expect(mockShowError).toHaveBeenCalledWith('Database already has data');
      expect(mockRun).not.toHaveBeenCalled();
    });

    it('inserts seed data when database is empty', async () => {
      resetMocks();
      mockExec.mockReturnValue([{ values: [[0]] }]);

      const { seed } = useSeedData();
      await seed();

      // Should call run for position types + kanji + components + vocabulary
      expect(mockRun).toHaveBeenCalled();
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO position_types'),
        expect.arrayContaining(['hen', 'へん', 'left side'])
      );
      expect(mockRun).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO kanjis'),
        expect.arrayContaining(['日', 4, 'N5', 'elementary1', '10'])
      );
    });

    it('seeds inside one transaction', async () => {
      resetMocks();
      mockExec.mockReturnValue([{ values: [[0]] }]);

      const { seed } = useSeedData();
      await seed();

      expect(mockTransaction).toHaveBeenCalledTimes(1);
    });

    it('persists data after seeding', async () => {
      resetMocks();
      mockExec.mockReturnValue([{ values: [[0]] }]);

      const { seed } = useSeedData();
      await seed();

      expect(mockPersist).toHaveBeenCalled();
    });

    it('sets isSeeding during operation', async () => {
      resetMocks();
      mockExec.mockReturnValue([{ values: [[0]] }]);

      const { isSeeding, seed } = useSeedData();

      expect(isSeeding.value).toBe(false);

      const seedPromise = seed();
      expect(isSeeding.value).toBe(true);

      await seedPromise;
      expect(isSeeding.value).toBe(false);
    });

    it('handles errors during seeding', async () => {
      resetMocks();
      mockExec.mockReturnValue([{ values: [[0]] }]);
      mockRun.mockImplementation(() => {
        throw new Error('Insert failed');
      });

      const { seed } = useSeedData();
      await seed();

      expect(mockShowError).toHaveBeenCalledWith('Insert failed');
    });
  });

  describe('clear', () => {
    it('delegates to the production clear', async () => {
      resetMocks();

      const { clear } = useSeedData();
      await clear();

      expect(mockClearDatabase).toHaveBeenCalledTimes(1);
    });

    it('sets isClearing during operation', async () => {
      resetMocks();

      const { clear, isClearing } = useSeedData();

      expect(isClearing.value).toBe(false);

      const clearPromise = clear();
      expect(isClearing.value).toBe(true);

      await clearPromise;
      expect(isClearing.value).toBe(false);
    });
  });

  describe('seedDataCounts', () => {
    it('exposes seed data counts for testing', () => {
      resetMocks();
      const { seedDataCounts } = useSeedData();

      expect(seedDataCounts.kanji).toBeGreaterThan(0);
      expect(seedDataCounts.components).toBeGreaterThan(0);
      expect(seedDataCounts.positionTypes).toBeGreaterThan(0);
      expect(seedDataCounts.vocabulary).toBeGreaterThan(0);
    });
  });

  describe('against a real database', () => {
    function count(db: Database, table: string): number {
      return db.exec(`SELECT COUNT(*) FROM ${table}`)[0]?.values[0]?.[0] as number;
    }

    it('seeds every table to the advertised counts, then reports existing data', async () => {
      resetMocks();
      const db = await createTestDatabase();
      mockExec.mockImplementation((sql: string, params?: unknown[]) => db.exec(sql, params));
      mockRun.mockImplementation((sql: string, params?: unknown[]) => {
        db.run(sql, params);
      });
      const { seed, seedDataCounts } = useSeedData();

      await seed();

      expect(mockShowError).not.toHaveBeenCalled();
      expect(count(db, 'position_types')).toBe(seedDataCounts.positionTypes);
      expect(count(db, 'kanjis')).toBe(seedDataCounts.kanji);
      expect(count(db, 'components')).toBe(seedDataCounts.components);
      expect(count(db, 'on_readings')).toBe(seedDataCounts.onReadings);
      expect(count(db, 'kun_readings')).toBe(seedDataCounts.kunReadings);
      expect(count(db, 'kanji_meanings')).toBe(seedDataCounts.meanings);
      expect(count(db, 'vocabulary')).toBe(seedDataCounts.vocabulary);

      mockShowError.mockClear();
      await seed();

      expect(mockShowError).toHaveBeenCalledWith('Database already has data');
      db.close();
    });
  });
});
