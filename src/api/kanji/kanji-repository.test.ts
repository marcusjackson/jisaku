/**
 * Kanji Repository Tests
 *
 * Unit tests for the kanji repository.
 */

import { createTestDatabase } from '@test/helpers/database';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Database } from 'sql.js';

// Test database instance
let testDb: Database;

// Mock useDatabase
vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    exec: (sql: string, params?: unknown[]) => testDb.exec(sql, params),
    run: (sql: string, params?: unknown[]) => testDb.run(sql, params),
  }),
}));

// Mock schedulePersist
vi.mock('@/db/indexeddb', () => ({
  schedulePersist: vi.fn(),
}));

// Import after mocking
import { useKanjiRepository } from './kanji-repository';

describe('useKanjiRepository', function () {
  beforeEach(async () => {
    testDb = await createTestDatabase();
  });

  describe('getById', () => {
    it('returns null when kanji does not exist', () => {
      const repo = useKanjiRepository();
      expect(repo.getById(999)).toBeNull();
    });

    it('returns kanji when it exists', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', ['水', 4]);

      const repo = useKanjiRepository();
      const kanji = repo.getById(1);

      expect(kanji).not.toBeNull();
      expect(kanji?.character).toBe('水');
      expect(kanji?.strokeCount).toBe(4);
    });
  });

  describe('getByCharacter', () => {
    it('returns null when character not found', () => {
      const repo = useKanjiRepository();
      expect(repo.getByCharacter('火')).toBeNull();
    });

    it('returns kanji when character exists', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', ['火', 4]);

      const repo = useKanjiRepository();
      const kanji = repo.getByCharacter('火');

      expect(kanji?.character).toBe('火');
    });
  });

  describe('getAll', () => {
    it('returns empty array when no kanji exist', () => {
      const repo = useKanjiRepository();
      expect(repo.getAll()).toEqual([]);
    });

    it('returns all kanji ordered by id desc', () => {
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水']);
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火']);
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['木']);

      const repo = useKanjiRepository();
      const all = repo.getAll();

      expect(all).toHaveLength(3);
      expect(all[0]?.character).toBe('木');
      expect(all[1]?.character).toBe('火');
      expect(all[2]?.character).toBe('水');
    });
  });

  describe('create', () => {
    it('creates a kanji with required fields', () => {
      const repo = useKanjiRepository();
      const kanji = repo.create({ character: '山' });

      expect(kanji.id).toBe(1);
      expect(kanji.character).toBe('山');
      expect(kanji.strokeCount).toBeNull();
    });

    it('creates a kanji with optional fields', () => {
      const repo = useKanjiRepository();
      const kanji = repo.create({
        character: '川',
        strokeCount: 3,
        shortMeaning: 'river',
        jlptLevel: 'N5',
      });

      expect(kanji.character).toBe('川');
      expect(kanji.strokeCount).toBe(3);
      expect(kanji.shortMeaning).toBe('river');
      expect(kanji.jlptLevel).toBe('N5');
    });
  });

  describe('update', () => {
    it('throws EntityNotFoundError when kanji does not exist', () => {
      const repo = useKanjiRepository();
      const throwFn = () => repo.update(999, { strokeCount: 5 });

      expect(throwFn).toThrow('Kanji with id 999 not found');
    });

    it('updates kanji fields', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', ['水', 4]);

      const repo = useKanjiRepository();
      const updated = repo.update(1, {
        strokeCount: 5,
        shortMeaning: 'water',
      });

      expect(updated.strokeCount).toBe(5);
      expect(updated.shortMeaning).toBe('water');
    });

    it('returns unchanged kanji when no fields provided', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', ['水', 4]);

      const repo = useKanjiRepository();
      const updated = repo.update(1, {});

      expect(updated.strokeCount).toBe(4);
    });
  });

  describe('updateField', () => {
    it('updates a single field', () => {
      testDb.run('INSERT INTO kanjis (character, stroke_count) VALUES (?, ?)', ['水', 4]);

      const repo = useKanjiRepository();
      const updated = repo.updateField(1, 'shortMeaning', 'water');

      expect(updated.shortMeaning).toBe('water');
      expect(updated.strokeCount).toBe(4);
    });
  });

  describe('remove', () => {
    it('removes a kanji', () => {
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水']);

      const repo = useKanjiRepository();
      repo.remove(1);

      expect(repo.getById(1)).toBeNull();
    });

    it('deletes occurrence grouping members itself, without relying on the schema cascade', () => {
      testDb.run('PRAGMA foreign_keys = OFF');
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水']);
      testDb.run('INSERT INTO components (character) VALUES (?)', ['氵']);
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (1, 1, 0, 0)'
      );
      testDb.run('INSERT INTO component_groupings (component_id, name) VALUES (1, ?)', ['g']);
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id) VALUES (1, 1)'
      );

      useKanjiRepository().remove(1);

      expect(
        testDb.exec('SELECT COUNT(*) FROM component_grouping_members')[0]?.values[0]?.[0]
      ).toBe(0);
    });

    it('removes related reading groups and group members on delete', () => {
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水']);
      const kanjiId = testDb.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number;

      // Create a meaning
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
        [kanjiId, 'water', null, 0]
      );
      const meaningId = testDb.exec('SELECT last_insert_rowid() as id')[0]
        ?.values[0]?.[0] as number;

      // Create a reading group
      testDb.run(
        'INSERT INTO kanji_meaning_reading_groups (kanji_id, reading_text, display_order) VALUES (?, ?, ?)',
        [kanjiId, 'すい', 0]
      );
      const groupId = testDb.exec('SELECT last_insert_rowid() as id')[0]?.values[0]?.[0] as number;

      // Create a group member
      testDb.run(
        'INSERT INTO kanji_meaning_group_members (reading_group_id, meaning_id, display_order) VALUES (?, ?, ?)',
        [groupId, meaningId, 0]
      );

      const repo = useKanjiRepository();
      repo.remove(kanjiId);

      const groups = testDb.exec('SELECT * FROM kanji_meaning_reading_groups WHERE kanji_id = ?', [
        kanjiId,
      ]);
      const members = testDb.exec(
        'SELECT * FROM kanji_meaning_group_members WHERE reading_group_id = ?',
        [groupId]
      );
      expect(groups[0]?.values ?? []).toHaveLength(0);
      expect(members[0]?.values ?? []).toHaveLength(0);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      testDb.run('INSERT INTO kanjis (character, jlpt_level, stroke_count) VALUES (?, ?, ?)', [
        '水',
        'N5',
        4,
      ]);
      testDb.run('INSERT INTO kanjis (character, jlpt_level, stroke_count) VALUES (?, ?, ?)', [
        '火',
        'N5',
        4,
      ]);
      testDb.run('INSERT INTO kanjis (character, jlpt_level, stroke_count) VALUES (?, ?, ?)', [
        '難',
        'N1',
        18,
      ]);
    });

    it('lists kanji created in the same second newest first when filtered, as unfiltered', () => {
      testDb.run("UPDATE kanjis SET created_at = '2026-01-01 00:00:00'");
      const repo = useKanjiRepository();
      const filtered = repo.search({ jlptLevels: ['N5'] }).map((k) => k.character);
      expect(filtered).toEqual(['火', '水']);
      expect(repo.getAll().map((k) => k.character)).toEqual(['難', '火', '水']);
    });

    it('sorts by character in both directions', () => {
      const repo = useKanjiRepository();
      const order = (direction: 'asc' | 'desc'): string[] =>
        repo.search({}, { field: 'character', direction }).map((k) => k.character);

      expect(order('asc')).toEqual(['水', '火', '難']);
      expect(order('desc')).toEqual(['難', '火', '水']);
    });

    it('sorts by stroke count', () => {
      const repo = useKanjiRepository();
      const first = (direction: 'asc' | 'desc'): string | undefined =>
        repo.search({}, { field: 'strokeCount', direction })[0]?.character;

      expect(first('asc')).not.toBe('難');
      expect(first('desc')).toBe('難');
    });

    it('accepts created-at as a sort field', () => {
      const repo = useKanjiRepository();

      expect(repo.search({}, { field: 'createdAt', direction: 'desc' })).toHaveLength(3);
    });

    it('treats % and _ in search text literally', () => {
      testDb.run('INSERT INTO kanjis (character, short_meaning, stroke_count) VALUES (?, ?, ?)', [
        '百',
        '100% sure',
        6,
      ]);
      const repo = useKanjiRepository();

      expect(repo.search({ search: '%' }).map((k) => k.character)).toEqual(['百']);
      expect(repo.search({ search: '_' })).toHaveLength(0);
    });

    it('filters analysis notes by length band', () => {
      testDb.run('UPDATE kanjis SET notes_personal = ? WHERE character = ?', [
        'x'.repeat(100),
        '水',
      ]);
      testDb.run('UPDATE kanjis SET notes_personal = ? WHERE character = ?', [
        'x'.repeat(300),
        '火',
      ]);
      testDb.run('UPDATE kanjis SET notes_personal = ? WHERE character = ?', [
        'x'.repeat(10),
        '難',
      ]);
      const repo = useKanjiRepository();
      const matching = (threshold: 'short' | 'medium' | 'long'): string[] =>
        repo
          .search({ analysisFilters: [{ field: 'notesPersonal', threshold }] })
          .map((k) => k.character);

      expect(matching('short')).toEqual(['難']);
      expect(matching('medium')).toEqual(['水']);
      expect(matching('long')).toEqual(['火']);
    });

    it('rejects a sort field search cannot order by', () => {
      const repo = useKanjiRepository();

      expect(() => repo.search({}, { field: 'jlptLevel' as never, direction: 'asc' })).toThrow(
        /Invalid sort field/
      );
    });

    it('filters by JLPT levels', () => {
      const repo = useKanjiRepository();
      const results = repo.search({ jlptLevels: ['N5'] });

      expect(results).toHaveLength(2);
      expect(results.every((k) => k.jlptLevel === 'N5')).toBe(true);
    });

    it('filters by stroke count range', () => {
      const repo = useKanjiRepository();
      const results = repo.search({ strokeCountMin: 4, strokeCountMax: 4 });

      expect(results).toHaveLength(2);
    });

    it('filters by search text matching character', () => {
      const repo = useKanjiRepository();
      const results = repo.search({ search: '水' });

      expect(results).toHaveLength(1);
      expect(results[0]?.character).toBe('水');
    });

    it('filters by meanings text', () => {
      // Insert a meaning for 水
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
        [1, 'water', 'H2O', 0]
      );
      // Insert a meaning for 火
      testDb.run(
        'INSERT INTO kanji_meanings (kanji_id, meaning_text, additional_info, display_order) VALUES (?, ?, ?, ?)',
        [2, 'fire', 'flame', 0]
      );

      const repo = useKanjiRepository();
      const results = repo.search({ meanings: 'wat' });

      expect(results).toHaveLength(1);
      expect(results[0]?.character).toBe('水');
    });
  });

  describe('getByIds', () => {
    it('returns empty array for empty ids', () => {
      const repo = useKanjiRepository();
      expect(repo.getByIds([])).toEqual([]);
    });

    it('returns kanji matching ids', () => {
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水']);
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['火']);
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['木']);

      const repo = useKanjiRepository();
      const results = repo.getByIds([1, 3]);

      expect(results).toHaveLength(2);
      expect(results[0]?.character).toBe('水');
      expect(results[1]?.character).toBe('木');
    });
  });
});
