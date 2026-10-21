/**
 * Tests for reading-processing utilities.
 */

import { describe, expect, it, vi } from 'vitest';

import { normalizeReadings, processKunReadings, processOnReadings } from './reading-processing';

import type { EditKunReading, EditOnReading } from '../kanji-detail-types';
import type { KunReading, OnReading } from '@/api/kanji';

// Mock repositories
function createMockOnRepo() {
  return {
    create: vi.fn(() => ({ id: 900 })),
    remove: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn(),
  };
}

function createMockKunRepo() {
  return {
    create: vi.fn(() => ({ id: 901 })),
    remove: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn(),
  };
}

function mockOnReading(overrides: Partial<OnReading> = {}): OnReading {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    reading: 'メイ',
    readingLevel: '小',
    updatedAt: '',
    ...overrides,
  };
}

function mockKunReading(overrides: Partial<KunReading> = {}): KunReading {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    okurigana: null,
    reading: 'あか',
    readingLevel: '小',
    updatedAt: '',
    ...overrides,
  };
}

describe('processOnReadings', () => {
  it('creates new readings', () => {
    const repo = createMockOnRepo();
    const edits: EditOnReading[] = [{ id: -1, isNew: true, reading: 'メイ', readingLevel: '小' }];

    processOnReadings(edits, [], 1, repo as never);

    expect(repo.create).toHaveBeenCalledWith({
      displayOrder: 0,
      kanjiId: 1,
      reading: 'メイ',
      readingLevel: '小',
    });
  });

  it('deletes removed readings', () => {
    const repo = createMockOnRepo();
    const existing = [mockOnReading({ id: 1 }), mockOnReading({ id: 2 })];
    const edits: EditOnReading[] = [{ id: 1, reading: 'メイ', readingLevel: '小' }];

    processOnReadings(edits, existing, 1, repo as never);

    expect(repo.remove).toHaveBeenCalledWith(2);
    expect(repo.remove).not.toHaveBeenCalledWith(1);
  });

  it('updates changed readings', () => {
    const repo = createMockOnRepo();
    const existing = [mockOnReading({ id: 1, reading: 'メイ' })];
    const edits: EditOnReading[] = [{ id: 1, reading: 'ミョウ', readingLevel: '小' }];

    processOnReadings(edits, existing, 1, repo as never);

    expect(repo.update).toHaveBeenCalledWith(1, {
      reading: 'ミョウ',
      readingLevel: '小',
    });
  });

  it('reorders when order changed', () => {
    const repo = createMockOnRepo();
    const existing = [mockOnReading({ id: 1 }), mockOnReading({ id: 2 })];
    const edits: EditOnReading[] = [
      { id: 2, reading: 'メイ', readingLevel: '小' },
      { id: 1, reading: 'メイ', readingLevel: '小' },
    ];

    processOnReadings(edits, existing, 1, repo as never);

    expect(repo.reorder).toHaveBeenCalledWith([2, 1]);
  });

  it('numbers a new row placed above existing rows', () => {
    const repo = createMockOnRepo();
    const existing = [mockOnReading({ id: 1 })];
    const edits: EditOnReading[] = [
      { id: -1, isNew: true, reading: 'ショウ', readingLevel: '小' },
      { id: 1, reading: 'メイ', readingLevel: '小' },
    ];

    processOnReadings(edits, existing, 1, repo as never);

    expect(repo.reorder).toHaveBeenCalledWith([900, 1]);
  });

  it('numbers a new row appended after existing rows', () => {
    const repo = createMockOnRepo();
    const existing = [mockOnReading({ id: 1 })];
    const edits: EditOnReading[] = [
      { id: 1, reading: 'メイ', readingLevel: '小' },
      { id: -1, isNew: true, reading: 'ショウ', readingLevel: '小' },
    ];

    processOnReadings(edits, existing, 1, repo as never);

    expect(repo.reorder).toHaveBeenCalledWith([1, 900]);
  });
});

describe('processKunReadings', () => {
  it('creates new readings with okurigana', () => {
    const repo = createMockKunRepo();
    const edits: EditKunReading[] = [
      {
        id: -1,
        isNew: true,
        okurigana: 'い',
        reading: 'あか',
        readingLevel: '小',
      },
    ];

    processKunReadings(edits, [], 1, repo as never);

    expect(repo.create).toHaveBeenCalledWith({
      displayOrder: 0,
      kanjiId: 1,
      okurigana: 'い',
      reading: 'あか',
      readingLevel: '小',
    });
  });

  it('handles null okurigana', () => {
    const repo = createMockKunRepo();
    const edits: EditKunReading[] = [
      {
        id: -1,
        isNew: true,
        okurigana: '',
        reading: 'あか',
        readingLevel: '小',
      },
    ];

    processKunReadings(edits, [], 1, repo as never);

    expect(repo.create).toHaveBeenCalledWith(expect.objectContaining({ okurigana: null }));
  });

  it('updates when okurigana changes', () => {
    const repo = createMockKunRepo();
    const existing = [mockKunReading({ id: 1, okurigana: null })];
    const edits: EditKunReading[] = [
      { id: 1, okurigana: 'い', reading: 'あか', readingLevel: '小' },
    ];

    processKunReadings(edits, existing, 1, repo as never);

    expect(repo.update).toHaveBeenCalledWith(1, expect.objectContaining({ okurigana: 'い' }));
  });
});

describe('normalizeReadings', () => {
  it('drops new rows with a blank reading and keeps blank existing rows', () => {
    const result = normalizeReadings({
      onReadings: [
        { id: 1, reading: '', readingLevel: '小' },
        { id: -1, isNew: true, reading: '  ', readingLevel: '小' },
        { id: -2, isNew: true, reading: 'メイ', readingLevel: '小' },
      ],
      kunReadings: [
        { id: -3, isNew: true, okurigana: 'い', reading: '', readingLevel: '小' },
        { id: 2, okurigana: '', reading: 'あか', readingLevel: '小' },
      ],
    });

    expect(result.onReadings.map((r) => r.id)).toEqual([1, -2]);
    expect(result.kunReadings.map((r) => r.id)).toEqual([2]);
  });

  it('trims reading and okurigana text', () => {
    const result = normalizeReadings({
      onReadings: [{ id: 1, reading: ' メイ ', readingLevel: '小' }],
      kunReadings: [{ id: 1, okurigana: ' い ', reading: ' あか ', readingLevel: '小' }],
    });

    expect(result.onReadings[0]?.reading).toBe('メイ');
    expect(result.kunReadings[0]).toMatchObject({ okurigana: 'い', reading: 'あか' });
  });
});
