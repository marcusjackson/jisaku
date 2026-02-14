/**
 * Tests for KanjiDetailReadingsDisplay component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailReadingsDisplay from './KanjiDetailReadingsDisplay.vue'

import type { KunReading, OnReading } from '@/api/kanji'

function mockOnReading(overrides: Partial<OnReading> = {}): OnReading {
  return {
    id: 1,
    kanjiId: 1,
    reading: 'メイ',
    readingLevel: '小',
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

function mockKunReading(overrides: Partial<KunReading> = {}): KunReading {
  return {
    id: 1,
    kanjiId: 1,
    reading: 'あか',
    okurigana: null,
    readingLevel: '小',
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

describe('KanjiDetailReadingsDisplay', () => {
  describe('on-yomi display', () => {
    it('displays on-readings grouped by level', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [
            mockOnReading({ id: 1, reading: 'メイ', readingLevel: '小' }),
            mockOnReading({ id: 2, reading: 'ミョウ', readingLevel: '小' }),
            mockOnReading({ id: 3, reading: 'アイ', readingLevel: '中' })
          ],
          kunReadings: []
        }
      })

      const display = screen.getByTestId('on-readings-display')
      expect(display).toHaveTextContent('メイ・ミョウ')
      expect(display).toHaveTextContent('[中]')
      expect(display).toHaveTextContent('アイ')
    })

    it('shows dash when no on-readings', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [],
          kunReadings: []
        }
      })

      expect(screen.getByTestId('on-readings-empty')).toHaveTextContent('—')
    })

    it('does not show level marker for 小 level', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [mockOnReading({ reading: 'メイ', readingLevel: '小' })],
          kunReadings: []
        }
      })

      const display = screen.getByTestId('on-readings-display')
      expect(display).not.toHaveTextContent('[小]')
      expect(display).toHaveTextContent('メイ')
    })
  })

  describe('kun-yomi display', () => {
    it('displays kun-readings with okurigana', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [],
          kunReadings: [
            mockKunReading({ reading: 'あか', okurigana: 'り' }),
            mockKunReading({ id: 2, reading: 'かげ', okurigana: null })
          ]
        }
      })

      const display = screen.getByTestId('kun-readings-display')
      expect(display).toHaveTextContent('あか.り')
      expect(display).toHaveTextContent('かげ')
    })

    it('shows dash when no kun-readings', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [],
          kunReadings: []
        }
      })

      expect(screen.getByTestId('kun-readings-empty')).toHaveTextContent('—')
    })

    it('groups kun-readings by level', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [],
          kunReadings: [
            mockKunReading({ id: 1, reading: 'あか', readingLevel: '小' }),
            mockKunReading({ id: 2, reading: 'かげ', readingLevel: '高' })
          ]
        }
      })

      const display = screen.getByTestId('kun-readings-display')
      expect(display).toHaveTextContent('あか')
      expect(display).toHaveTextContent('[高]')
      expect(display).toHaveTextContent('かげ')
    })
  })

  describe('type badges', () => {
    it('displays 音 badge for on-yomi', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [mockOnReading()],
          kunReadings: []
        }
      })

      expect(screen.getByText('音')).toBeInTheDocument()
    })

    it('displays 訓 badge for kun-yomi', () => {
      render(KanjiDetailReadingsDisplay, {
        props: {
          onReadings: [],
          kunReadings: [mockKunReading()]
        }
      })

      expect(screen.getByText('訓')).toBeInTheDocument()
    })
  })
})
