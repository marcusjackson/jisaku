/**
 * Tests for KanjiDetailSectionMeanings component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailSectionMeanings from './KanjiDetailSectionMeanings.vue'

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

describe('KanjiDetailSectionMeanings', () => {
  const defaultProps = {
    groupMembers: [] as KanjiMeaningGroupMember[],
    meanings: [mockMeaning()],
    readingGroups: [] as KanjiMeaningReadingGroup[]
  }

  it('renders section title', () => {
    render(KanjiDetailSectionMeanings, { props: defaultProps })
    expect(screen.getByText('Meanings')).toBeInTheDocument()
  })

  it('displays meanings', () => {
    render(KanjiDetailSectionMeanings, { props: defaultProps })
    expect(screen.getByText('bright')).toBeInTheDocument()
  })

  it('has edit button', () => {
    render(KanjiDetailSectionMeanings, { props: defaultProps })
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('shows empty state when no meanings', () => {
    render(KanjiDetailSectionMeanings, {
      props: { ...defaultProps, meanings: [] }
    })
    expect(screen.getByText('No meanings defined')).toBeInTheDocument()
  })
})
