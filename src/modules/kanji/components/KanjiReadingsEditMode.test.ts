import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiReadingsEditMode from './KanjiReadingsEditMode.vue'

import type { ReadingLevel } from '@/shared/types/database-types'

describe('KanjiReadingsEditMode', () => {
  const mockOnReadings = [
    {
      id: 1,
      reading: 'メイ',
      readingLevel: '小' as ReadingLevel,
      isNew: false
    }
  ]

  const mockKunReadings = [
    {
      id: 2,
      reading: 'あか',
      okurigana: 'るい',
      readingLevel: '小' as ReadingLevel,
      isNew: false
    }
  ]

  it('renders on-yomi section header', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    expect(screen.getByText('On-yomi:')).toBeInTheDocument()
  })

  it('renders kun-yomi section header', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    expect(screen.getByText('Kun-yomi:')).toBeInTheDocument()
  })

  it('displays empty state for on-yomi when no readings', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    expect(
      screen.getByText(/No on-yomi readings.*Click.*Add.*to add one/)
    ).toBeInTheDocument()
  })

  it('displays empty state for kun-yomi when no readings', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    expect(
      screen.getByText(/No kun-yomi readings.*Click.*Add.*to add one/)
    ).toBeInTheDocument()
  })

  it('renders on-yomi add button', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    const addButtons = screen.getAllByRole('button', { name: /\+ Add/i })
    expect(addButtons.length).toBeGreaterThanOrEqual(1)
  })

  it('renders kun-yomi add button', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    const addButtons = screen.getAllByRole('button', { name: /\+ Add/i })
    expect(addButtons.length).toBe(2)
  })

  it('emits addOnReading when on-yomi add button clicked', async () => {
    const user = userEvent.setup()
    const onAddOnReading = vi.fn()

    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {},
        onAddOnReading
      }
    })

    const addButtons = screen.getAllByRole('button', { name: /\+ Add/i })
    await user.click(addButtons[0]!)

    expect(onAddOnReading).toHaveBeenCalled()
  })

  it('emits addKunReading when kun-yomi add button clicked', async () => {
    const user = userEvent.setup()
    const onAddKunReading = vi.fn()

    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {},
        onAddKunReading
      }
    })

    const addButtons = screen.getAllByRole('button', { name: /\+ Add/i })
    await user.click(addButtons[1]!)

    expect(onAddKunReading).toHaveBeenCalled()
  })

  it('renders on-yomi reading items', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    expect(screen.getByDisplayValue('メイ')).toBeInTheDocument()
  })

  it('renders kun-yomi reading items', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: mockKunReadings,
        onReadingWarnings: {},
        kunReadingWarnings: {}
      }
    })

    expect(screen.getByDisplayValue('あか')).toBeInTheDocument()
    expect(screen.getByDisplayValue('るい')).toBeInTheDocument()
  })

  it('passes warnings to on-yomi items', () => {
    const warnings = {
      0: 'On-yomi is generally in katakana'
    }

    render(KanjiReadingsEditMode, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: [],
        onReadingWarnings: warnings,
        kunReadingWarnings: {}
      }
    })

    expect(
      screen.getByText(/On-yomi is generally in katakana/)
    ).toBeInTheDocument()
  })

  it('passes warnings to kun-yomi items', () => {
    const warnings = {
      0: {
        reading: 'Kun-yomi reading is generally in hiragana'
      }
    }

    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: mockKunReadings,
        onReadingWarnings: {},
        kunReadingWarnings: warnings
      }
    })

    expect(
      screen.getByText(/Kun-yomi reading is generally in hiragana/)
    ).toBeInTheDocument()
  })

  it('passes isDestructiveMode to reading items', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: mockKunReadings,
        onReadingWarnings: {},
        kunReadingWarnings: {},
        isDestructiveMode: true
      }
    })

    // Should have delete buttons for both readings
    const deleteButtons = screen.getAllByLabelText('Delete reading')
    expect(deleteButtons.length).toBe(2)
  })

  it('does not show delete buttons when destructive mode disabled', () => {
    render(KanjiReadingsEditMode, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: mockKunReadings,
        onReadingWarnings: {},
        kunReadingWarnings: {},
        isDestructiveMode: false
      }
    })

    expect(screen.queryByLabelText('Delete reading')).not.toBeInTheDocument()
  })

  it('emits update:onReading when on-yomi field changes', async () => {
    const user = userEvent.setup()
    const onUpdateOnReading = vi.fn()

    render(KanjiReadingsEditMode, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: [],
        onReadingWarnings: {},
        kunReadingWarnings: {},
        'onUpdate:onReading': onUpdateOnReading
      }
    })

    const input = screen.getByDisplayValue('メイ')
    await user.clear(input)
    await user.type(input, 'ミョウ')

    expect(onUpdateOnReading).toHaveBeenCalledWith(0, 'reading', 'ミョウ')
  })

  it('emits update:kunReading when kun-yomi field changes', async () => {
    const user = userEvent.setup()
    const onUpdateKunReading = vi.fn()

    render(KanjiReadingsEditMode, {
      props: {
        onReadings: [],
        kunReadings: mockKunReadings,
        onReadingWarnings: {},
        kunReadingWarnings: {},
        'onUpdate:kunReading': onUpdateKunReading
      }
    })

    const input = screen.getByDisplayValue('あか')
    await user.clear(input)
    await user.type(input, 'ひ')

    expect(onUpdateKunReading).toHaveBeenCalledWith(0, 'reading', 'ひ')
  })
})
