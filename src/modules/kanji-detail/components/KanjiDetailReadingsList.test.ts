/**
 * Tests for KanjiDetailReadingsList component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailReadingsList from './KanjiDetailReadingsList.vue'

import type { EditOnReading } from '../kanji-detail-types'

function mockReading(overrides: Partial<EditOnReading> = {}): EditOnReading {
  return {
    id: 1,
    reading: 'メイ',
    readingLevel: '小',
    ...overrides
  }
}

describe('KanjiDetailReadingsList', () => {
  const defaultProps = {
    readings: [mockReading()],
    title: 'On-yomi (音読み)'
  }

  it('renders section title', () => {
    render(KanjiDetailReadingsList, { props: defaultProps })
    expect(screen.getByText('On-yomi (音読み)')).toBeInTheDocument()
  })

  it('renders empty state when no readings', () => {
    render(KanjiDetailReadingsList, {
      props: { ...defaultProps, emptyText: 'No on-yomi readings', readings: [] }
    })
    expect(screen.getByText('No on-yomi readings')).toBeInTheDocument()
  })

  it('renders reading items', () => {
    render(KanjiDetailReadingsList, { props: defaultProps })
    expect(screen.getByDisplayValue('メイ')).toBeInTheDocument()
  })

  it('emits add event when Add button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailReadingsList, { props: defaultProps })

    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(emitted()['add']).toBeTruthy()
  })

  it('shows okurigana field when showOkurigana is true', () => {
    render(KanjiDetailReadingsList, {
      props: {
        ...defaultProps,
        readings: [{ ...mockReading(), okurigana: 'い' }],
        showOkurigana: true
      }
    })
    expect(screen.getByDisplayValue('い')).toBeInTheDocument()
  })

  it('passes warnings to reading items', () => {
    render(KanjiDetailReadingsList, {
      props: {
        ...defaultProps,
        warnings: ['This is a warning']
      }
    })
    expect(screen.getByText('This is a warning')).toBeInTheDocument()
  })
})
