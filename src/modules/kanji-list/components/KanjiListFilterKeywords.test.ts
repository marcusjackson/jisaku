/**
 * KanjiListFilterKeywords Tests
 *
 * Tests for keywords search filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterKeywords from './KanjiListFilterKeywords.vue'

describe('KanjiListFilterKeywords', () => {
  it('renders with label', () => {
    render(KanjiListFilterKeywords, {
      props: { modelValue: '' }
    })

    expect(screen.getByLabelText(/display \+ keywords/i)).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiListFilterKeywords, {
      props: { modelValue: 'mountain' }
    })

    expect(screen.getByLabelText(/display \+ keywords/i)).toHaveValue(
      'mountain'
    )
  })

  it('emits update on input', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListFilterKeywords, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': vi.fn()
      }
    })

    await user.type(screen.getByLabelText(/display \+ keywords/i), 'test')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
