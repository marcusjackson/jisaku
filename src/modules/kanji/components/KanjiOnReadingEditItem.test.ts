import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiOnReadingEditItem from './KanjiOnReadingEditItem.vue'

import type { ReadingLevel } from '@/shared/types/database-types'

describe('KanjiOnReadingEditItem', () => {
  const mockReading = {
    id: 1,
    reading: 'メイ',
    readingLevel: '小' as ReadingLevel,
    isNew: false
  }

  it('displays reading number', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByText('1.')).toBeInTheDocument()
  })

  it('renders reading input with current value', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByLabelText('Reading')).toHaveValue('メイ')
  })

  it('renders level select', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    // BaseSelect renders a select (Reka UI uses hidden select for a11y)
    expect(screen.getByLabelText('Level')).toBeInTheDocument()
  })

  it('emits update:reading when reading changes', async () => {
    const user = userEvent.setup()
    const onUpdateReading = vi.fn()

    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        'onUpdate:reading': onUpdateReading
      }
    })

    const input = screen.getByLabelText('Reading')
    await user.clear(input)
    await user.type(input, 'ミョウ')

    expect(onUpdateReading).toHaveBeenCalledWith('ミョウ')
  })

  it('shows reorder buttons for existing readings', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 1,
        totalCount: 3
      }
    })

    expect(screen.getByLabelText('Move up')).toBeInTheDocument()
    expect(screen.getByLabelText('Move down')).toBeInTheDocument()
  })

  it('disables move up button for first item', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByLabelText('Move up')).toBeDisabled()
  })

  it('disables move down button for last item', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 1,
        totalCount: 2
      }
    })

    expect(screen.getByLabelText('Move down')).toBeDisabled()
  })

  it('shows save/cancel buttons for new readings', () => {
    const newReading = {
      ...mockReading,
      isNew: true
    }

    render(KanjiOnReadingEditItem, {
      props: {
        reading: newReading,
        index: 0,
        totalCount: 1
      }
    })

    expect(screen.getByLabelText('Save reading')).toBeInTheDocument()
    expect(screen.getByLabelText('Cancel')).toBeInTheDocument()
  })

  it('emits save event when save button clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    const newReading = {
      ...mockReading,
      isNew: true
    }

    render(KanjiOnReadingEditItem, {
      props: {
        reading: newReading,
        index: 0,
        totalCount: 1,
        onSave
      }
    })

    await user.click(screen.getByLabelText('Save reading'))
    expect(onSave).toHaveBeenCalled()
  })

  it('emits cancel event when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    const newReading = {
      ...mockReading,
      isNew: true
    }

    render(KanjiOnReadingEditItem, {
      props: {
        reading: newReading,
        index: 0,
        totalCount: 1,
        onCancel
      }
    })

    await user.click(screen.getByLabelText('Cancel'))
    expect(onCancel).toHaveBeenCalled()
  })

  it('shows delete button when destructive mode enabled', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        isDestructiveMode: true
      }
    })

    expect(screen.getByLabelText('Delete reading')).toBeInTheDocument()
  })

  it('does not show delete button when destructive mode disabled', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        isDestructiveMode: false
      }
    })

    expect(screen.queryByLabelText('Delete reading')).not.toBeInTheDocument()
  })

  it('displays warning message when provided', () => {
    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        warning: 'On-yomi is generally in katakana'
      }
    })

    expect(
      screen.getByText(/On-yomi is generally in katakana/)
    ).toBeInTheDocument()
  })

  it('emits moveUp event when up button clicked', async () => {
    const user = userEvent.setup()
    const onMoveUp = vi.fn()

    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 1,
        totalCount: 2,
        onMoveUp
      }
    })

    await user.click(screen.getByLabelText('Move up'))
    expect(onMoveUp).toHaveBeenCalled()
  })

  it('emits moveDown event when down button clicked', async () => {
    const user = userEvent.setup()
    const onMoveDown = vi.fn()

    render(KanjiOnReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        onMoveDown
      }
    })

    await user.click(screen.getByLabelText('Move down'))
    expect(onMoveDown).toHaveBeenCalled()
  })
})
