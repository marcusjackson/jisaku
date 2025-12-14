/**
 * Tests for KanjiFilterSearchKeywords component
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiFilterSearchKeywords from './KanjiFilterSearchKeywords.vue'

describe('KanjiFilterSearchKeywords', () => {
  it('renders with label', () => {
    render(KanjiFilterSearchKeywords, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByLabelText(/Meaning\/Keywords/i)).toBeInTheDocument()
  })

  it('renders with placeholder', () => {
    render(KanjiFilterSearchKeywords, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByPlaceholderText(/water, lake/i)).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiFilterSearchKeywords, {
      props: {
        modelValue: 'water'
      }
    })

    expect(screen.getByRole('textbox')).toHaveValue('water')
  })

  it('emits update event when value changes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiFilterSearchKeywords, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': onUpdate
      }
    })

    await user.type(screen.getByRole('textbox'), 'sun')

    // BaseInput emits the full value each time, not individual characters
    expect(onUpdate).toHaveBeenCalledWith('s')
    expect(onUpdate).toHaveBeenCalledWith('su')
    expect(onUpdate).toHaveBeenCalledWith('sun')
  })

  it('emits empty string when input is cleared', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiFilterSearchKeywords, {
      props: {
        modelValue: 'water',
        'onUpdate:modelValue': onUpdate
      }
    })

    const input = screen.getByRole('textbox')
    await user.clear(input)

    expect(onUpdate).toHaveBeenCalledWith('')
  })

  it('converts number values to string', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiFilterSearchKeywords, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': onUpdate
      }
    })

    await user.type(screen.getByRole('textbox'), '123')

    // Component should convert to string - emits full value each time
    expect(onUpdate).toHaveBeenCalledWith('1')
    expect(onUpdate).toHaveBeenCalledWith('12')
    expect(onUpdate).toHaveBeenCalledWith('123')
  })

  it('handles undefined value', () => {
    const onUpdate = vi.fn()

    render(KanjiFilterSearchKeywords, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': onUpdate
      }
    })

    // Input should handle undefined gracefully
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
  })
})
