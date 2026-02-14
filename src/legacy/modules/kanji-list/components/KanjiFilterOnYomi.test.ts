import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterOnYomi from './KanjiFilterOnYomi.vue'

describe('KanjiFilterOnYomi', () => {
  it('renders with label', () => {
    render(KanjiFilterOnYomi, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByLabelText('On-yomi')).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiFilterOnYomi, {
      props: {
        modelValue: 'メイ'
      }
    })

    expect(screen.getByLabelText('On-yomi')).toHaveValue('メイ')
  })

  it('emits update:modelValue on input', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterOnYomi, {
      props: {
        modelValue: ''
      }
    })

    const input = screen.getByLabelText('On-yomi')
    await user.type(input, 'メイ')

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.at(-1)).toEqual(['メイ'])
  })

  it('has placeholder text', () => {
    render(KanjiFilterOnYomi, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByPlaceholderText('メイ, ミョウ...')).toBeInTheDocument()
  })
})
