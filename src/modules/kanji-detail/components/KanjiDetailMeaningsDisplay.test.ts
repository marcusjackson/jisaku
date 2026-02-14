/**
 * Tests for KanjiDetailMeaningsDisplay component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailMeaningsDisplay from './KanjiDetailMeaningsDisplay.vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/api/kanji'

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

describe('KanjiDetailMeaningsDisplay', () => {
  it('shows empty state when no meanings', () => {
    render(KanjiDetailMeaningsDisplay, {
      props: { groupMembers: [], meanings: [], readingGroups: [] }
    })
    expect(screen.getByText('No meanings defined')).toBeInTheDocument()
  })

  it('shows simple list without grouping', () => {
    render(KanjiDetailMeaningsDisplay, {
      props: {
        groupMembers: [],
        meanings: [
          mockMeaning({ meaningText: 'bright' }),
          mockMeaning({ id: 2, meaningText: 'light' })
        ],
        readingGroups: []
      }
    })
    // Meanings are now shown as list items, not joined text
    expect(screen.getByText('bright')).toBeInTheDocument()
    expect(screen.getByText('light')).toBeInTheDocument()
    // Verify they are in an ordered list
    const listItems = screen.getAllByRole('listitem')
    expect(listItems).toHaveLength(2)
  })

  it('shows additional info in parentheses', () => {
    render(KanjiDetailMeaningsDisplay, {
      props: {
        groupMembers: [],
        meanings: [
          mockMeaning({ additionalInfo: 'of the sun', meaningText: 'bright' })
        ],
        readingGroups: []
      }
    })
    expect(screen.getByText('bright (of the sun)')).toBeInTheDocument()
  })

  it('shows grouped meanings with reading labels', () => {
    render(KanjiDetailMeaningsDisplay, {
      props: {
        groupMembers: [mockMember({ meaningId: 1, readingGroupId: 1 })],
        meanings: [mockMeaning({ meaningText: 'bright' })],
        readingGroups: [mockGroup({ readingText: 'メイ' })]
      }
    })
    expect(screen.getByText('メイ')).toBeInTheDocument()
    expect(screen.getByText('bright')).toBeInTheDocument()
  })

  it('shows ungrouped meanings separately', () => {
    render(KanjiDetailMeaningsDisplay, {
      props: {
        groupMembers: [mockMember({ meaningId: 1, readingGroupId: 1 })],
        meanings: [
          mockMeaning({ id: 1, meaningText: 'bright' }),
          mockMeaning({ id: 2, meaningText: 'light' })
        ],
        readingGroups: [mockGroup({ readingText: 'メイ' })]
      }
    })
    expect(screen.getByText('メイ')).toBeInTheDocument()
    expect(screen.getByText('bright')).toBeInTheDocument()
    expect(screen.getByText('light')).toBeInTheDocument()
  })

  it('shows multiple groups', () => {
    render(KanjiDetailMeaningsDisplay, {
      props: {
        groupMembers: [
          mockMember({ meaningId: 1, readingGroupId: 1 }),
          mockMember({ meaningId: 2, readingGroupId: 2 })
        ],
        meanings: [
          mockMeaning({ id: 1, meaningText: 'bright' }),
          mockMeaning({ id: 2, meaningText: 'next' })
        ],
        readingGroups: [
          mockGroup({ id: 1, readingText: 'メイ' }),
          mockGroup({ id: 2, readingText: 'ミョウ' })
        ]
      }
    })
    expect(screen.getByText('メイ')).toBeInTheDocument()
    expect(screen.getByText('ミョウ')).toBeInTheDocument()
  })
})
