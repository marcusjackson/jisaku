import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterKunYomi from './KanjiFilterKunYomi.vue'

describe('KanjiFilterKunYomi', () => {
  it('renders with label', () => {
    render(KanjiFilterKunYomi, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByLabelText('Kun-yomi')).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiFilterKunYomi, {
      props: {
        modelValue: 'あか'
      }
    })

    expect(screen.getByLabelText('Kun-yomi')).toHaveValue('あか')
  })

  it('emits update:modelValue on input', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterKunYomi, {
      props: {
        modelValue: ''
      }
    })

    const input = screen.getByLabelText('Kun-yomi')
    await user.type(input, 'あか')

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.at(-1)).toEqual(['あか'])
  })

  it('has placeholder text', () => {
    render(KanjiFilterKunYomi, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByPlaceholderText('あか, あかり...')).toBeInTheDocument()
  })
})
