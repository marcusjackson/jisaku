/**
 * Tests for meaning-processing utilities.
 */

import { describe, expect, it, vi } from 'vitest'

import {
  processGroupMembers,
  processMeanings,
  processReadingGroups
} from './meaning-processing'

import type {
  EditGroupMember,
  EditMeaning,
  EditReadingGroup
} from '../kanji-detail-types'
import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/api/kanji'

// Mock repositories
function createMockMeaningRepo() {
  return {
    create: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn()
  }
}

function createMockGroupRepo() {
  return {
    create: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
    update: vi.fn()
  }
}

function createMockMemberRepo() {
  return {
    create: vi.fn(),
    remove: vi.fn(),
    removeAllByGroupId: vi.fn()
  }
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
    ...overrides
  }
}

function mockGroup(
  overrides: Partial<KanjiMeaningReadingGroup> = {}
): KanjiMeaningReadingGroup {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    readingText: 'メイ',
    updatedAt: '',
    ...overrides
  }
}

function mockMember(
  overrides: Partial<KanjiMeaningGroupMember> = {}
): KanjiMeaningGroupMember {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    meaningId: 1,
    readingGroupId: 1,
    updatedAt: '',
    ...overrides
  }
}

describe('processMeanings', () => {
  it('creates new meanings', () => {
    const repo = createMockMeaningRepo()
    const edits: EditMeaning[] = [
      { additionalInfo: '', id: -1, isNew: true, meaningText: 'bright' }
    ]

    processMeanings(edits, [], 1, repo as never)

    expect(repo.create).toHaveBeenCalledWith({
      additionalInfo: null,
      displayOrder: 0,
      kanjiId: 1,
      meaningText: 'bright'
    })
  })

  it('deletes removed meanings', () => {
    const repo = createMockMeaningRepo()
    const existing = [mockMeaning({ id: 1 }), mockMeaning({ id: 2 })]
    const edits: EditMeaning[] = [
      { additionalInfo: '', id: 1, meaningText: 'bright' }
    ]

    processMeanings(edits, existing, 1, repo as never)

    expect(repo.remove).toHaveBeenCalledWith(2)
  })

  it('updates changed meanings', () => {
    const repo = createMockMeaningRepo()
    const existing = [mockMeaning({ id: 1, meaningText: 'bright' })]
    const edits: EditMeaning[] = [
      { additionalInfo: 'info', id: 1, meaningText: 'light' }
    ]

    processMeanings(edits, existing, 1, repo as never)

    expect(repo.update).toHaveBeenCalledWith(1, {
      additionalInfo: 'info',
      meaningText: 'light'
    })
  })
})

describe('processReadingGroups', () => {
  it('creates new groups', () => {
    const groupRepo = createMockGroupRepo()
    const memberRepo = createMockMemberRepo()
    const edits: EditReadingGroup[] = [
      { id: -1, isNew: true, readingText: 'メイ' }
    ]

    processReadingGroups(edits, [], 1, groupRepo as never, memberRepo as never)

    expect(groupRepo.create).toHaveBeenCalledWith({
      displayOrder: 0,
      kanjiId: 1,
      readingText: 'メイ'
    })
  })

  it('removes members when deleting groups', () => {
    const groupRepo = createMockGroupRepo()
    const memberRepo = createMockMemberRepo()
    const existing = [mockGroup({ id: 1 })]
    const edits: EditReadingGroup[] = []

    processReadingGroups(
      edits,
      existing,
      1,
      groupRepo as never,
      memberRepo as never
    )

    expect(memberRepo.removeAllByGroupId).toHaveBeenCalledWith(1)
    expect(groupRepo.remove).toHaveBeenCalledWith(1)
  })
})

describe('processGroupMembers', () => {
  it('recreates all members', () => {
    const memberRepo = createMockMemberRepo()
    const existing = [mockMember({ id: 1 })]
    const edits: EditGroupMember[] = [
      { displayOrder: 0, meaningId: 1, readingGroupId: 1 }
    ]
    const freshGroups = [mockGroup({ id: 1 })]
    const editGroups: EditReadingGroup[] = []

    processGroupMembers(
      edits,
      editGroups,
      existing,
      freshGroups,
      memberRepo as never
    )

    expect(memberRepo.remove).toHaveBeenCalledWith(1)
    expect(memberRepo.create).toHaveBeenCalledWith({
      displayOrder: 0,
      meaningId: 1,
      readingGroupId: 1
    })
  })

  it('maps new group IDs correctly', () => {
    const memberRepo = createMockMemberRepo()
    const edits: EditGroupMember[] = [
      { displayOrder: 0, meaningId: 1, readingGroupId: -1 }
    ]
    const editGroups: EditReadingGroup[] = [
      { id: -1, isNew: true, readingText: 'メイ' }
    ]
    const freshGroups = [mockGroup({ id: 100 })]

    processGroupMembers(edits, editGroups, [], freshGroups, memberRepo as never)

    expect(memberRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ readingGroupId: 100 })
    )
  })
})
