import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterCharacter from './KanjiFilterCharacter.vue'

describe('KanjiFilterCharacter', () => {
  it('renders with label', () => {
    render(KanjiFilterCharacter, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByLabelText('Character')).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiFilterCharacter, {
      props: {
        modelValue: '山'
      }
    })

    expect(screen.getByLabelText('Character')).toHaveValue('山')
  })

  it('emits update:modelValue on input', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterCharacter, {
      props: {
        modelValue: ''
      }
    })

    const input = screen.getByLabelText('Character')
    await user.type(input, '川')

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.at(-1)).toEqual(['川'])
  })

  it('has placeholder text', () => {
    render(KanjiFilterCharacter, {
      props: {
        modelValue: ''
      }
    })

    expect(screen.getByPlaceholderText('漢')).toBeInTheDocument()
  })
})
