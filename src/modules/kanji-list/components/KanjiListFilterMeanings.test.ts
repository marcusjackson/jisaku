/**
 * KanjiListFilterMeanings Tests
 *
 * Tests for meanings search filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterMeanings from './KanjiListFilterMeanings.vue'

describe('KanjiListFilterMeanings', () => {
  it('renders with label', () => {
    render(KanjiListFilterMeanings, {
      props: { modelValue: '' }
    })

    expect(screen.getByLabelText(/meanings/i)).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiListFilterMeanings, {
      props: { modelValue: 'day' }
    })

    expect(screen.getByLabelText(/meanings/i)).toHaveValue('day')
  })

  it('emits update on input', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListFilterMeanings, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': vi.fn()
      }
    })

    await user.type(screen.getByLabelText(/meanings/i), 'test')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
