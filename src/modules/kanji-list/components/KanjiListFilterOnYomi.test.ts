/**
 * KanjiListFilterOnYomi Tests
 *
 * Tests for on-yomi search filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterOnYomi from './KanjiListFilterOnYomi.vue'

describe('KanjiListFilterOnYomi', () => {
  it('renders with label', () => {
    render(KanjiListFilterOnYomi, {
      props: { modelValue: '' }
    })

    expect(screen.getByLabelText(/on-yomi/i)).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiListFilterOnYomi, {
      props: { modelValue: 'サン' }
    })

    expect(screen.getByLabelText(/on-yomi/i)).toHaveValue('サン')
  })

  it('emits update on input', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListFilterOnYomi, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': vi.fn()
      }
    })

    await user.type(screen.getByLabelText(/on-yomi/i), 'カン')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
