/**
 * Tests for meaning-processing utilities.
 */

import { describe, expect, it, vi } from 'vitest';

import {
  dropBlankNewRows,
  processGroupMembers,
  processMeanings,
  processReadingGroups,
} from './meaning-processing';

import type { EditGroupMember, EditMeaning, EditReadingGroup } from '../kanji-detail-types';
import type { KanjiMeaning, KanjiMeaningGroupMember, KanjiMeaningReadingGroup } from '@/api/kanji';

// Mock repositories
function createMockMeaningRepo() {
  return {
    create: vi.fn(() => mockMeaning({ id: 500 })),
    remove: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn(),
  };
}

function createMockGroupRepo() {
  return {
    create: vi.fn(() => ({ id: 700 })),
    remove: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn(),
  };
}

function createMockMemberRepo() {
  return {
    create: vi.fn(),
    remove: vi.fn(),
    removeAllByGroupId: vi.fn(),
  };
}

function mockMeaning(overrides: Partial<KanjiMeaning> = {}): KanjiMeaning {
  return {
    additionalInfo: null,
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    meaningText: 'bright',
    updatedAt: '',
    ...overrides,
  };
}

function mockGroup(overrides: Partial<KanjiMeaningReadingGroup> = {}): KanjiMeaningReadingGroup {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    readingText: 'メイ',
    updatedAt: '',
    ...overrides,
  };
}

function mockMember(overrides: Partial<KanjiMeaningGroupMember> = {}): KanjiMeaningGroupMember {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    meaningId: 1,
    readingGroupId: 1,
    updatedAt: '',
    ...overrides,
  };
}

describe('processMeanings', () => {
  it('creates new meanings', () => {
    const repo = createMockMeaningRepo();
    const edits: EditMeaning[] = [
      { additionalInfo: '', id: -1, isNew: true, meaningText: 'bright' },
    ];

    processMeanings(edits, [], 1, repo as never);

    expect(repo.create).toHaveBeenCalledWith({
      additionalInfo: null,
      displayOrder: 0,
      kanjiId: 1,
      meaningText: 'bright',
    });
  });

  it('numbers a new meaning placed above existing ones', () => {
    const repo = createMockMeaningRepo();
    const existing = [mockMeaning({ id: 1 })];
    const edits: EditMeaning[] = [
      { additionalInfo: '', id: -1, isNew: true, meaningText: 'light' },
      { additionalInfo: '', id: 1, meaningText: 'bright' },
    ];

    processMeanings(edits, existing, 1, repo as never);

    expect(repo.reorder).toHaveBeenCalledWith([500, 1]);
  });

  it('deletes removed meanings', () => {
    const repo = createMockMeaningRepo();
    const existing = [mockMeaning({ id: 1 }), mockMeaning({ id: 2 })];
    const edits: EditMeaning[] = [{ additionalInfo: '', id: 1, meaningText: 'bright' }];

    processMeanings(edits, existing, 1, repo as never);

    expect(repo.remove).toHaveBeenCalledWith(2);
  });

  it('updates changed meanings', () => {
    const repo = createMockMeaningRepo();
    const existing = [mockMeaning({ id: 1, meaningText: 'bright' })];
    const edits: EditMeaning[] = [{ additionalInfo: 'info', id: 1, meaningText: 'light' }];

    processMeanings(edits, existing, 1, repo as never);

    expect(repo.update).toHaveBeenCalledWith(1, {
      additionalInfo: 'info',
      meaningText: 'light',
    });
  });
});

describe('processReadingGroups', () => {
  it('creates new groups', () => {
    const groupRepo = createMockGroupRepo();
    const memberRepo = createMockMemberRepo();
    const edits: EditReadingGroup[] = [{ id: -1, isNew: true, readingText: 'メイ' }];

    processReadingGroups(edits, [], 1, groupRepo as never, memberRepo as never);

    expect(groupRepo.create).toHaveBeenCalledWith({
      displayOrder: 0,
      kanjiId: 1,
      readingText: 'メイ',
    });
  });

  it('numbers a new group placed above existing ones', () => {
    const groupRepo = createMockGroupRepo();
    const memberRepo = createMockMemberRepo();
    const existing = [mockGroup({ id: 1 })];
    const edits: EditReadingGroup[] = [
      { id: -1, isNew: true, readingText: 'ショウ' },
      { id: 1, readingText: existing[0]?.readingText ?? '' },
    ];

    processReadingGroups(edits, existing, 1, groupRepo as never, memberRepo as never);

    expect(groupRepo.reorder).toHaveBeenCalledWith([700, 1]);
  });

  it('removes members when deleting groups', () => {
    const groupRepo = createMockGroupRepo();
    const memberRepo = createMockMemberRepo();
    const existing = [mockGroup({ id: 1 })];
    const edits: EditReadingGroup[] = [];

    processReadingGroups(edits, existing, 1, groupRepo as never, memberRepo as never);

    expect(memberRepo.removeAllByGroupId).toHaveBeenCalledWith(1);
    expect(groupRepo.remove).toHaveBeenCalledWith(1);
  });
});

describe('processMeanings created ids', () => {
  it('returns created ids keyed by temp id', () => {
    const repo = createMockMeaningRepo();
    const edits: EditMeaning[] = [
      { additionalInfo: '', id: -1, isNew: true, meaningText: 'bright' },
    ];

    const created = processMeanings(edits, [], 1, repo as never);

    expect(created.get(-1)).toBe(500);
  });
});

describe('processGroupMembers', () => {
  it('maps temp meaning IDs to created ones and skips unmapped temps', () => {
    const memberRepo = createMockMemberRepo();
    const edits: EditGroupMember[] = [
      { displayOrder: 0, meaningId: -1, readingGroupId: 1 },
      { displayOrder: 1, meaningId: -2, readingGroupId: 1 },
    ];

    processGroupMembers(edits, [], new Map([[-1, 500]]), new Map(), memberRepo as never);

    expect(memberRepo.create).toHaveBeenCalledTimes(1);
    expect(memberRepo.create).toHaveBeenCalledWith(expect.objectContaining({ meaningId: 500 }));
  });

  it('recreates all members', () => {
    const memberRepo = createMockMemberRepo();
    const existing = [mockMember({ id: 1 })];
    const edits: EditGroupMember[] = [{ displayOrder: 0, meaningId: 1, readingGroupId: 1 }];

    processGroupMembers(edits, existing, new Map(), new Map(), memberRepo as never);

    expect(memberRepo.remove).toHaveBeenCalledWith(1);
    expect(memberRepo.create).toHaveBeenCalledWith({
      displayOrder: 0,
      meaningId: 1,
      readingGroupId: 1,
    });
  });

  it('maps new group IDs correctly', () => {
    const memberRepo = createMockMemberRepo();
    const edits: EditGroupMember[] = [{ displayOrder: 0, meaningId: 1, readingGroupId: -1 }];

    processGroupMembers(edits, [], new Map(), new Map([[-1, 100]]), memberRepo as never);

    expect(memberRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ readingGroupId: 100 })
    );
  });

  it('maps reordered new groups by id, not by position', () => {
    const groupRepo = createMockGroupRepo();
    const memberRepo = createMockMemberRepo();
    groupRepo.create.mockReturnValueOnce({ id: 701 }).mockReturnValueOnce({ id: 702 });
    const edits: EditReadingGroup[] = [
      { id: -2, isNew: true, readingText: 'B' },
      { id: -1, isNew: true, readingText: 'A' },
    ];

    const created = processReadingGroups(edits, [], 1, groupRepo as never, memberRepo as never);
    processGroupMembers(
      [{ displayOrder: 0, meaningId: 1, readingGroupId: -1 }],
      [],
      new Map(),
      created,
      memberRepo as never
    );

    expect(memberRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ readingGroupId: 702 })
    );
  });
});

describe('dropBlankNewRows', () => {
  const save = {
    groupMembers: [],
    groupingDisabled: false,
    meanings: [
      { additionalInfo: '', id: 1, meaningText: '' },
      { additionalInfo: '', id: -1, isNew: true, meaningText: '   ' },
      { additionalInfo: '', id: -2, isNew: true, meaningText: 'light' },
    ],
    readingGroups: [
      { id: -1, isNew: true, readingText: '' },
      { id: -2, isNew: true, readingText: 'コウ' },
    ],
  };

  it('drops blank new rows and keeps the rest', () => {
    const result = dropBlankNewRows(save);
    expect(result.meanings.map((m) => m.id)).toEqual([1, -2]);
    expect(result.readingGroups.map((g) => g.id)).toEqual([-2]);
  });
});
