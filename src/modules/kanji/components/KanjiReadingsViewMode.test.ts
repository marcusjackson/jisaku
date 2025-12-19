import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiReadingsViewMode from './KanjiReadingsViewMode.vue'

import type { KunReading, OnReading } from '@/shared/types/database-types'

describe('KanjiReadingsViewMode', () => {
  const mockOnReadings: OnReading[] = [
    {
      id: 1,
      kanjiId: 1,
      reading: 'メイ',
      readingLevel: '小',
      displayOrder: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 2,
      kanjiId: 1,
      reading: 'ミョウ',
      readingLevel: '中',
      displayOrder: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  const mockKunReadings: KunReading[] = [
    {
      id: 3,
      kanjiId: 1,
      reading: 'あか',
      okurigana: 'るい',
      readingLevel: '小',
      displayOrder: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      id: 4,
      kanjiId: 1,
      reading: 'あか',
      okurigana: 'り',
      readingLevel: '小',
      displayOrder: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  it('renders on-yomi section header', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: [],
        kunReadings: []
      }
    })

    expect(screen.getByText('On-yomi:')).toBeInTheDocument()
  })

  it('renders kun-yomi section header', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: [],
        kunReadings: []
      }
    })

    expect(screen.getByText('Kun-yomi:')).toBeInTheDocument()
  })

  it('displays empty state for on-yomi when no readings', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: [],
        kunReadings: []
      }
    })

    expect(screen.getByText('No on-yomi readings')).toBeInTheDocument()
  })

  it('displays empty state for kun-yomi when no readings', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: [],
        kunReadings: []
      }
    })

    expect(screen.getByText('No kun-yomi readings')).toBeInTheDocument()
  })

  it('displays on-yomi readings', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: []
      }
    })

    expect(screen.getByText('メイ')).toBeInTheDocument()
    expect(screen.getByText('ミョウ')).toBeInTheDocument()
  })

  it('displays kun-yomi readings with dot notation', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: [],
        kunReadings: mockKunReadings
      }
    })

    expect(screen.getByText('あか.るい')).toBeInTheDocument()
    expect(screen.getByText('あか.り')).toBeInTheDocument()
  })

  it('displays kun-yomi without okurigana correctly', () => {
    const readingWithoutOkurigana: KunReading = {
      id: 5,
      kanjiId: 1,
      reading: 'ひ',
      okurigana: null,
      readingLevel: '小',
      displayOrder: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }

    render(KanjiReadingsViewMode, {
      props: {
        onReadings: [],
        kunReadings: [readingWithoutOkurigana]
      }
    })

    expect(screen.getByText('ひ')).toBeInTheDocument()
  })

  it('shows level marker for non-elementary readings', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: []
      }
    })

    // Elementary reading (小) should not show level marker
    const meiText = screen.getByText('メイ')
    expect(meiText.parentElement).not.toHaveTextContent('[小]')

    // Non-elementary reading (中) should show level marker
    expect(screen.getByText('[中]')).toBeInTheDocument()
  })

  it('does not show level marker for elementary readings', () => {
    render(KanjiReadingsViewMode, {
      props: {
        onReadings: [mockOnReadings[0]!],
        kunReadings: []
      }
    })

    expect(screen.queryByText('[小]')).not.toBeInTheDocument()
  })
})
