import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailReadings from './KanjiDetailReadings.vue'

import type {
  KunReading,
  OnReading,
  ReadingLevel
} from '@/shared/types/database-types'

describe('KanjiDetailReadings', () => {
  const mockOnReadings: OnReading[] = [
    {
      id: 1,
      kanjiId: 1,
      reading: 'メイ',
      readingLevel: '小' as ReadingLevel,
      displayOrder: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  const mockKunReadings: KunReading[] = [
    {
      id: 2,
      kanjiId: 1,
      reading: 'あか',
      okurigana: 'るい',
      readingLevel: '小' as ReadingLevel,
      displayOrder: 0,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ]

  it('renders in view mode by default', () => {
    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: mockKunReadings
      }
    })

    expect(screen.getByText('メイ')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('switches to edit mode when Edit button clicked', async () => {
    const user = userEvent.setup()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: mockKunReadings
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('shows cancel button in edit mode', async () => {
    const user = userEvent.setup()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: mockKunReadings
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('returns to view mode when Cancel button clicked', async () => {
    const user = userEvent.setup()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: mockKunReadings
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('emits addOnReading when adding new on-yomi', async () => {
    const user = userEvent.setup()
    const onAddOnReading = vi.fn()

    render(KanjiDetailReadings, {
      props: {
        onReadings: [],
        kunReadings: [],
        onAddOnReading
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))
    const addButtons = screen.getAllByRole('button', { name: /\+ Add/i })
    await user.click(addButtons[0]!)

    // Type in the new reading
    const readingInputs = screen.getAllByLabelText('Reading')
    await user.type(readingInputs[0]!, 'メイ')

    // Click save on the new item
    await user.click(screen.getByLabelText('Save reading'))

    expect(onAddOnReading).toHaveBeenCalledWith('メイ', '小')
  })

  it('emits addKunReading when adding new kun-yomi', async () => {
    const user = userEvent.setup()
    const onAddKunReading = vi.fn()

    render(KanjiDetailReadings, {
      props: {
        onReadings: [],
        kunReadings: [],
        onAddKunReading
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))
    const addButtons = screen.getAllByRole('button', { name: /\+ Add/i })
    await user.click(addButtons[1]!)

    // Type in the new reading
    const readingInputs = screen.getAllByLabelText('Reading')
    await user.type(readingInputs[0]!, 'あか')

    const okuriganaInputs = screen.getAllByLabelText('Okurigana')
    await user.type(okuriganaInputs[0]!, 'るい')

    // Click save on the new item
    await user.click(screen.getByLabelText('Save reading'))

    expect(onAddKunReading).toHaveBeenCalledWith('あか', 'るい', '小')
  })

  it('emits updateOnReading when saving changes', async () => {
    const user = userEvent.setup()
    const onUpdateOnReading = vi.fn()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: [],
        onUpdateOnReading
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))

    // Change the reading
    const input = screen.getByDisplayValue('メイ')
    await user.clear(input)
    await user.type(input, 'ミョウ')

    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onUpdateOnReading).toHaveBeenCalledWith(1, 'ミョウ', '小')
  })

  it('emits removeOnReading when deleting in destructive mode', async () => {
    const user = userEvent.setup()
    const onRemoveOnReading = vi.fn()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: [],
        isDestructiveMode: true,
        onRemoveOnReading
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))

    // Click delete button
    await user.click(screen.getByLabelText('Delete reading'))

    // Confirm deletion in dialog
    await user.click(screen.getByRole('button', { name: /delete/i }))

    expect(onRemoveOnReading).toHaveBeenCalledWith(1)
  })

  it('shows delete confirmation dialog', async () => {
    const user = userEvent.setup()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: [],
        isDestructiveMode: true
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByLabelText('Delete reading'))

    expect(screen.getByText('Delete On-yomi Reading?')).toBeInTheDocument()
  })

  it('does not emit remove event when delete is cancelled', async () => {
    const user = userEvent.setup()
    const onRemoveOnReading = vi.fn()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: [],
        isDestructiveMode: true,
        onRemoveOnReading
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))
    await user.click(screen.getByLabelText('Delete reading'))

    // Cancel the dialog
    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i })
    await user.click(cancelButtons[cancelButtons.length - 1]!)

    expect(onRemoveOnReading).not.toHaveBeenCalled()
  })

  it('passes isDestructiveMode to edit mode', async () => {
    const user = userEvent.setup()

    render(KanjiDetailReadings, {
      props: {
        onReadings: mockOnReadings,
        kunReadings: mockKunReadings,
        isDestructiveMode: true
      }
    })

    await user.click(screen.getByRole('button', { name: /edit/i }))

    // Should show delete buttons
    const deleteButtons = screen.getAllByLabelText('Delete reading')
    expect(deleteButtons.length).toBeGreaterThan(0)
  })
})
