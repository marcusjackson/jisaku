import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiMeaningsViewMode from './KanjiMeaningsViewMode.vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/shared/types/database-types'

describe('KanjiMeaningsViewMode', () => {
  const mockMeanings: KanjiMeaning[] = [
    {
      id: 1,
      kanjiId: 1,
      meaningText: 'bright',
      additionalInfo: 'light quality',
      displayOrder: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      kanjiId: 1,
      meaningText: 'light',
      additionalInfo: null,
      displayOrder: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  it('displays empty state when no meanings', () => {
    render(KanjiMeaningsViewMode, {
      props: {
        meanings: [],
        readingGroups: [],
        groupMembers: []
      }
    })

    expect(screen.getByText('No meanings added yet.')).toBeInTheDocument()
  })

  it('displays meanings in flat list when no grouping', () => {
    render(KanjiMeaningsViewMode, {
      props: {
        meanings: mockMeanings,
        readingGroups: [],
        groupMembers: []
      }
    })

    expect(screen.getByText('bright')).toBeInTheDocument()
    expect(screen.getByText('light')).toBeInTheDocument()
  })

  it('displays additional info when present', () => {
    render(KanjiMeaningsViewMode, {
      props: {
        meanings: mockMeanings,
        readingGroups: [],
        groupMembers: []
      }
    })

    expect(screen.getByText('light quality')).toBeInTheDocument()
  })

  it('displays grouped meanings by reading', () => {
    const readingGroups: KanjiMeaningReadingGroup[] = [
      {
        id: 1,
        kanjiId: 1,
        readingText: 'メイ',
        displayOrder: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    const groupMembers: KanjiMeaningGroupMember[] = [
      {
        id: 1,
        readingGroupId: 1,
        meaningId: 1,
        displayOrder: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    render(KanjiMeaningsViewMode, {
      props: {
        meanings: mockMeanings,
        readingGroups,
        groupMembers
      }
    })

    expect(screen.getByText('メイ')).toBeInTheDocument()
    expect(screen.getByText('bright')).toBeInTheDocument()
  })

  it('displays unassigned meanings section when grouping enabled', () => {
    const readingGroups: KanjiMeaningReadingGroup[] = [
      {
        id: 1,
        kanjiId: 1,
        readingText: 'メイ',
        displayOrder: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    const groupMembers: KanjiMeaningGroupMember[] = [
      {
        id: 1,
        readingGroupId: 1,
        meaningId: 1,
        displayOrder: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    render(KanjiMeaningsViewMode, {
      props: {
        meanings: mockMeanings,
        readingGroups,
        groupMembers
      }
    })

    // Second meaning is unassigned
    expect(screen.getByText('(Unassigned)')).toBeInTheDocument()
    expect(screen.getByText('light')).toBeInTheDocument()
  })

  it('uses ordered list for flat meanings', () => {
    const { container } = render(KanjiMeaningsViewMode, {
      props: {
        meanings: mockMeanings,
        readingGroups: [],
        groupMembers: []
      }
    })

    const orderedList = container.querySelector('.kanji-meanings-list')
    expect(orderedList?.tagName).toBe('OL')
  })

  it('uses ordered list for grouped meanings', () => {
    const readingGroups: KanjiMeaningReadingGroup[] = [
      {
        id: 1,
        kanjiId: 1,
        readingText: 'メイ',
        displayOrder: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    const groupMembers: KanjiMeaningGroupMember[] = [
      {
        id: 1,
        readingGroupId: 1,
        meaningId: 1,
        displayOrder: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]

    const { container } = render(KanjiMeaningsViewMode, {
      props: {
        meanings: mockMeanings,
        readingGroups,
        groupMembers
      }
    })

    const orderedLists = container.querySelectorAll(
      '.kanji-meanings-group-list'
    )
    expect(orderedLists.length).toBeGreaterThan(0)
    orderedLists.forEach((list) => {
      expect(list.tagName).toBe('OL')
    })
  })
})
