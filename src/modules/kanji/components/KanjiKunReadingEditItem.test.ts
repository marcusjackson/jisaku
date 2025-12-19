import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiKunReadingEditItem from './KanjiKunReadingEditItem.vue'

import type { ReadingLevel } from '@/shared/types/database-types'

describe('KanjiKunReadingEditItem', () => {
  const mockReading = {
    id: 1,
    reading: 'あか',
    okurigana: 'るい',
    readingLevel: '小' as ReadingLevel,
    isNew: false
  }

  it('displays reading number', () => {
    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByText('1.')).toBeInTheDocument()
  })

  it('renders reading input with current value', () => {
    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByLabelText('Reading')).toHaveValue('あか')
  })

  it('renders okurigana input with current value', () => {
    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByLabelText('Okurigana')).toHaveValue('るい')
  })

  it('renders level select', () => {
    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    // BaseSelect renders a select (Reka UI uses hidden select for a11y)
    expect(screen.getByLabelText('Level')).toBeInTheDocument()
  })

  it('displays dot separator between reading and okurigana', () => {
    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByText('.')).toBeInTheDocument()
  })

  it('emits update:reading when reading changes', async () => {
    const user = userEvent.setup()
    const onUpdateReading = vi.fn()

    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        'onUpdate:reading': onUpdateReading
      }
    })

    const input = screen.getByLabelText('Reading')
    await user.clear(input)
    await user.type(input, 'ひ')

    expect(onUpdateReading).toHaveBeenCalledWith('ひ')
  })

  it('emits update:okurigana when okurigana changes', async () => {
    const user = userEvent.setup()
    const onUpdateOkurigana = vi.fn()

    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        'onUpdate:okurigana': onUpdateOkurigana
      }
    })

    const input = screen.getByLabelText('Okurigana')
    await user.clear(input)
    await user.type(input, 'り')

    expect(onUpdateOkurigana).toHaveBeenCalledWith('り')
  })

  it('shows reorder buttons for existing readings', () => {
    render(KanjiKunReadingEditItem, {
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
    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2
      }
    })

    expect(screen.getByLabelText('Move up')).toBeDisabled()
  })

  it('disables move down button for last item', () => {
    render(KanjiKunReadingEditItem, {
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

    render(KanjiKunReadingEditItem, {
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

    render(KanjiKunReadingEditItem, {
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

  it('shows delete button when destructive mode enabled', () => {
    render(KanjiKunReadingEditItem, {
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
    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        isDestructiveMode: false
      }
    })

    expect(screen.queryByLabelText('Delete reading')).not.toBeInTheDocument()
  })

  it('displays reading warning when provided', () => {
    const warning = {
      reading: 'Kun-yomi reading is generally in hiragana'
    }

    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        warning
      }
    })

    expect(
      screen.getByText(/Kun-yomi reading is generally in hiragana/)
    ).toBeInTheDocument()
  })

  it('displays okurigana warning when provided', () => {
    const warning = {
      okurigana: 'Okurigana is generally in hiragana'
    }

    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        warning
      }
    })

    expect(
      screen.getByText(/Okurigana is generally in hiragana/)
    ).toBeInTheDocument()
  })

  it('displays both warnings when provided', () => {
    const warning = {
      reading: 'Kun-yomi reading is generally in hiragana',
      okurigana: 'Okurigana is generally in hiragana'
    }

    render(KanjiKunReadingEditItem, {
      props: {
        reading: mockReading,
        index: 0,
        totalCount: 2,
        warning
      }
    })

    expect(
      screen.getByText(/Kun-yomi reading is generally in hiragana/)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Okurigana is generally in hiragana/)
    ).toBeInTheDocument()
  })
})
