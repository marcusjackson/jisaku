/**
 * KanjiListFilterCharacter Tests
 *
 * Tests for character search filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterCharacter from './KanjiListFilterCharacter.vue'

describe('KanjiListFilterCharacter', () => {
  it('renders with label', () => {
    render(KanjiListFilterCharacter, {
      props: { modelValue: '' }
    })

    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiListFilterCharacter, {
      props: { modelValue: '山' }
    })

    expect(screen.getByLabelText(/character/i)).toHaveValue('山')
  })

  it('emits update on input', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListFilterCharacter, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': vi.fn()
      }
    })

    await user.type(screen.getByLabelText(/character/i), '川')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
