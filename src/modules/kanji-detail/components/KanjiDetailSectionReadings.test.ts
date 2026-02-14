/**
 * Tests for KanjiDetailSectionReadings component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailSectionReadings from './KanjiDetailSectionReadings.vue'

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

describe('KanjiDetailSectionReadings', () => {
  const defaultProps = {
    onReadings: [mockOnReading()],
    kunReadings: [mockKunReading()]
  }

  it('renders section with title', () => {
    render(KanjiDetailSectionReadings, { props: defaultProps })
    expect(screen.getByText('Readings')).toBeInTheDocument()
  })

  it('displays readings in compact format', () => {
    render(KanjiDetailSectionReadings, { props: defaultProps })
    expect(screen.getByText('音')).toBeInTheDocument()
    expect(screen.getByText('訓')).toBeInTheDocument()
  })

  it('opens dialog when Edit button clicked', async () => {
    const user = userEvent.setup()
    render(KanjiDetailSectionReadings, { props: defaultProps })

    await user.click(screen.getByTestId('readings-edit-button'))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Edit Readings')).toBeInTheDocument()
  })

  it('emits save event when dialog saves', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailSectionReadings, {
      props: defaultProps
    })

    await user.click(screen.getByTestId('readings-edit-button'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(emitted()['save']).toBeTruthy()
  })

  it('closes dialog after save', async () => {
    const user = userEvent.setup()
    render(KanjiDetailSectionReadings, { props: defaultProps })

    await user.click(screen.getByTestId('readings-edit-button'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
