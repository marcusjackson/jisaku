/**
 * Component Repository Tests
 *
 * Unit tests for the component repository.
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
import { useComponentRepository } from './component-repository';

describe('useComponentRepository', function () {
  beforeEach(async () => {
    testDb = await createTestDatabase();
  });

  describe('getById', () => {
    it('returns null when component does not exist', () => {
      const repo = useComponentRepository();
      expect(repo.getById(999)).toBeNull();
    });

    it('returns component when it exists', () => {
      testDb.run(
        'INSERT INTO components (character, stroke_count, short_meaning) VALUES (?, ?, ?)',
        ['氵', 3, 'water radical']
      );

      const repo = useComponentRepository();
      const component = repo.getById(1);

      expect(component).not.toBeNull();
      expect(component?.character).toBe('氵');
      expect(component?.strokeCount).toBe(3);
      expect(component?.shortMeaning).toBe('water radical');
    });
  });

  describe('getByCharacter', () => {
    it('returns null when character not found', () => {
      const repo = useComponentRepository();
      expect(repo.getByCharacter('火')).toBeNull();
    });

    it('returns component when character exists', () => {
      testDb.run('INSERT INTO components (character) VALUES (?)', ['木']);

      const repo = useComponentRepository();
      const component = repo.getByCharacter('木');

      expect(component?.character).toBe('木');
    });
  });

  describe('getAll', () => {
    it('returns empty array when no components exist', () => {
      const repo = useComponentRepository();
      expect(repo.getAll()).toEqual([]);
    });

    it('returns all components ordered by id desc', () => {
      testDb.run('INSERT INTO components (character) VALUES (?)', ['氵']);
      testDb.run('INSERT INTO components (character) VALUES (?)', ['火']);
      testDb.run('INSERT INTO components (character) VALUES (?)', ['木']);

      const repo = useComponentRepository();
      const all = repo.getAll();

      expect(all).toHaveLength(3);
      expect(all[0]?.character).toBe('木');
      expect(all[1]?.character).toBe('火');
      expect(all[2]?.character).toBe('氵');
    });
  });

  describe('getRadicals', () => {
    it('returns only components that can be radicals', () => {
      testDb.run('INSERT INTO components (character, can_be_radical) VALUES (?, ?)', ['氵', 1]);
      testDb.run('INSERT INTO components (character, can_be_radical) VALUES (?, ?)', ['木', 1]);
      testDb.run('INSERT INTO components (character, can_be_radical) VALUES (?, ?)', ['口', 0]);

      const repo = useComponentRepository();
      const radicals = repo.getRadicals();

      expect(radicals).toHaveLength(2);
      expect(radicals[0]?.canBeRadical).toBe(true);
      expect(radicals[1]?.canBeRadical).toBe(true);
    });
  });

  describe('create', () => {
    it('creates a component with required fields', () => {
      const repo = useComponentRepository();
      const component = repo.create({ character: '氵' });

      expect(component.id).toBe(1);
      expect(component.character).toBe('氵');
      expect(component.strokeCount).toBeNull();
      expect(component.canBeRadical).toBe(false);
    });

    it('creates a component with optional fields', () => {
      const repo = useComponentRepository();
      const component = repo.create({
        character: '水',
        strokeCount: 4,
        shortMeaning: 'water',
        canBeRadical: true,
        kangxiNumber: 85,
        kangxiMeaning: 'water',
      });

      expect(component.character).toBe('水');
      expect(component.strokeCount).toBe(4);
      expect(component.canBeRadical).toBe(true);
      expect(component.kangxiNumber).toBe(85);
    });
  });

  describe('update', () => {
    it('throws EntityNotFoundError when component does not exist', () => {
      const repo = useComponentRepository();
      const throwFn = () => repo.update(999, { strokeCount: 5 });

      expect(throwFn).toThrow('Component with id 999 not found');
    });

    it('updates component fields', () => {
      testDb.run('INSERT INTO components (character, stroke_count) VALUES (?, ?)', ['氵', 3]);

      const repo = useComponentRepository();
      const updated = repo.update(1, {
        strokeCount: 4,
        shortMeaning: 'water variant',
      });

      expect(updated.strokeCount).toBe(4);
      expect(updated.shortMeaning).toBe('water variant');
    });

    it('returns unchanged component when no fields provided', () => {
      testDb.run('INSERT INTO components (character, stroke_count) VALUES (?, ?)', ['氵', 3]);

      const repo = useComponentRepository();
      const updated = repo.update(1, {});

      expect(updated.strokeCount).toBe(3);
    });
  });

  describe('updateField', () => {
    it('updates a single field', () => {
      testDb.run('INSERT INTO components (character, stroke_count) VALUES (?, ?)', ['氵', 3]);

      const repo = useComponentRepository();
      const updated = repo.updateField(1, 'shortMeaning', 'water radical');

      expect(updated.shortMeaning).toBe('water radical');
      expect(updated.strokeCount).toBe(3);
    });
  });

  describe('remove', () => {
    it('removes a component', () => {
      testDb.run('INSERT INTO components (character) VALUES (?)', ['氵']);

      const repo = useComponentRepository();
      repo.remove(1);

      expect(repo.getById(1)).toBeNull();
    });

    it('deletes its children itself, without relying on the schema cascade', () => {
      testDb.run('PRAGMA foreign_keys = OFF');
      testDb.run('INSERT INTO components (character) VALUES (?)', ['氵']);
      testDb.run('INSERT INTO kanjis (character) VALUES (?)', ['水']);
      testDb.run(
        'INSERT INTO component_occurrences (kanji_id, component_id, is_radical, display_order) VALUES (1, 1, 0, 0)'
      );
      testDb.run('INSERT INTO component_forms (component_id, form_character) VALUES (1, ?)', [
        '氵',
      ]);
      testDb.run('INSERT INTO component_groupings (component_id, name) VALUES (1, ?)', ['g']);
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id) VALUES (1, 1)'
      );
      // A member of another component's grouping that points at this component's occurrence
      testDb.run('INSERT INTO components (character) VALUES (?)', ['木']);
      testDb.run('INSERT INTO component_groupings (component_id, name) VALUES (2, ?)', ['other']);
      testDb.run(
        'INSERT INTO component_grouping_members (grouping_id, occurrence_id) VALUES (2, 1)'
      );

      useComponentRepository().remove(1);

      for (const table of [
        'component_occurrences',
        'component_forms',
        'component_grouping_members',
      ]) {
        expect(testDb.exec(`SELECT COUNT(*) FROM ${table}`)[0]?.values[0]?.[0]).toBe(0);
      }
      // The other component's grouping stays; only this component's is gone.
      expect(testDb.exec('SELECT id FROM component_groupings')[0]?.values).toEqual([[2]]);
    });
  });

  describe('search', () => {
    beforeEach(() => {
      testDb.run(
        'INSERT INTO components (character, short_meaning, can_be_radical, kangxi_number) VALUES (?, ?, ?, ?)',
        ['水', 'water', 1, 85]
      );
      testDb.run(
        'INSERT INTO components (character, short_meaning, can_be_radical) VALUES (?, ?, ?)',
        ['氵', 'water variant', 0]
      );
      testDb.run(
        'INSERT INTO components (character, short_meaning, can_be_radical) VALUES (?, ?, ?)',
        ['火', 'fire', 1]
      );
    });

    it('returns all components when no filters applied', () => {
      const repo = useComponentRepository();
      const results = repo.search({});

      expect(results).toHaveLength(3);
    });

    it('filters by canBeRadical', () => {
      const repo = useComponentRepository();
      const results = repo.search({ canBeRadical: true });

      expect(results).toHaveLength(2);
      expect(results.every((c) => c.canBeRadical)).toBe(true);
    });

    it('filters by search in character', () => {
      const repo = useComponentRepository();
      const results = repo.search({ search: '水' });

      expect(results).toHaveLength(1);
      expect(results[0]?.character).toBe('水');
    });

    it('filters by search in meaning', () => {
      const repo = useComponentRepository();
      const results = repo.search({ search: 'water' });

      expect(results).toHaveLength(2);
    });

    it('filters by kangxiSearch with number', () => {
      const repo = useComponentRepository();
      const results = repo.search({ kangxiSearch: '85' });

      expect(results).toHaveLength(1);
      expect(results[0]?.kangxiNumber).toBe(85);
    });

    it('filters by kangxiSearch with meaning text', () => {
      testDb.run(
        'INSERT INTO components (character, kangxi_number, kangxi_meaning) VALUES (?, ?, ?)',
        ['人', 9, 'person']
      );

      const repo = useComponentRepository();
      const results = repo.search({ kangxiSearch: 'person' });

      expect(results).toHaveLength(1);
      expect(results[0]?.kangxiMeaning).toBe('person');
    });

    it('kangxiSearch does not search short_meaning', () => {
      const repo = useComponentRepository();
      const results = repo.search({ kangxiSearch: 'water' });

      // Should NOT match the short_meaning field
      expect(results).toHaveLength(0);
    });

    it('matches search_keywords', () => {
      testDb.run('INSERT INTO components (character, search_keywords) VALUES (?, ?)', [
        '木',
        'tree wood',
      ]);

      const repo = useComponentRepository();
      const results = repo.search({ search: 'wood' });

      expect(results.map((c) => c.character)).toEqual(['木']);
    });

    it('folds Latin case when searching', () => {
      const repo = useComponentRepository();

      expect(repo.search({ search: 'WATER' })).toHaveLength(2);
    });

    it('treats % and _ in search text literally', () => {
      testDb.run('INSERT INTO components (character, short_meaning) VALUES (?, ?)', [
        '百',
        '100% pure',
      ]);
      testDb.run('INSERT INTO components (character, short_meaning) VALUES (?, ?)', ['口', 'a_b']);
      testDb.run('INSERT INTO components (character, short_meaning) VALUES (?, ?)', ['田', 'axb']);

      const repo = useComponentRepository();

      expect(repo.search({ search: '100% pure' }).map((c) => c.character)).toEqual(['百']);
      expect(repo.search({ search: 'a_b' }).map((c) => c.character)).toEqual(['口']);
      expect(repo.search({ search: '%' }).map((c) => c.character)).toEqual(['百']);
      expect(repo.search({ search: '_' }).map((c) => c.character)).toEqual(['口']);
    });

    it('treats a backslash in search text literally', () => {
      testDb.run('INSERT INTO components (character, short_meaning) VALUES (?, ?)', ['丿', 'a\\b']);

      const repo = useComponentRepository();

      expect(repo.search({ search: '\\' }).map((c) => c.character)).toEqual(['丿']);
    });

    it('treats % and _ in kangxiSearch literally', () => {
      testDb.run(
        'INSERT INTO components (character, kangxi_number, kangxi_meaning) VALUES (?, ?, ?)',
        ['人', 9, 'person']
      );

      const repo = useComponentRepository();

      expect(repo.search({ kangxiSearch: '%' })).toHaveLength(0);
      expect(repo.search({ kangxiSearch: 'per_on' })).toHaveLength(0);
    });

    describe('stroke count and combined filters', () => {
      beforeEach(() => {
        testDb.run(
          'INSERT INTO components (character, stroke_count, can_be_radical) VALUES (?, ?, ?)',
          ['一', 1, 1]
        );
        testDb.run(
          'INSERT INTO components (character, stroke_count, can_be_radical) VALUES (?, ?, ?)',
          ['人', 2, 0]
        );
        testDb.run(
          'INSERT INTO components (character, stroke_count, can_be_radical) VALUES (?, ?, ?)',
          ['大', 3, 1]
        );
        testDb.run(
          'INSERT INTO components (character, stroke_count, can_be_radical) VALUES (?, ?, ?)',
          ['山', 3, 0]
        );
      });

      const chars = (filters: Parameters<ReturnType<typeof useComponentRepository>['search']>[0]) =>
        useComponentRepository()
          .search(filters)
          .map((c) => c.character)
          .sort();

      it('strokeCountMin includes the bound and excludes NULL stroke counts', () => {
        expect(chars({ strokeCountMin: 2 })).toEqual(['人', '大', '山'].sort());
      });

      it('strokeCountMax includes the bound and excludes NULL stroke counts', () => {
        expect(chars({ strokeCountMax: 2 })).toEqual(['一', '人'].sort());
      });

      it('combines min and max as an inclusive range', () => {
        expect(chars({ strokeCountMin: 2, strokeCountMax: 3 })).toEqual(['人', '大', '山'].sort());
        expect(chars({ strokeCountMin: 3, strokeCountMax: 3 })).toEqual(['大', '山'].sort());
      });

      it('never matches a component with no stroke count', () => {
        expect(chars({ strokeCountMin: 0, strokeCountMax: 99 })).not.toContain('水');
      });

      it('filters canBeRadical false', () => {
        const results = useComponentRepository().search({ canBeRadical: false });

        expect(results.every((c) => !c.canBeRadical)).toBe(true);
        expect(results.map((c) => c.character).sort()).toEqual(['人', '山', '氵'].sort());
      });

      it('ANDs two filters together', () => {
        expect(chars({ canBeRadical: true, strokeCountMin: 2 })).toEqual(['大']);
      });

      it('returns results newest first', () => {
        const results = useComponentRepository().search({ strokeCountMin: 1 });

        expect(results.map((c) => c.id)).toEqual(
          [...results.map((c) => c.id)].sort((a, b) => b - a)
        );
        expect(results).toHaveLength(4);
      });
    });
  });
});
