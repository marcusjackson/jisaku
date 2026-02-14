/**
 * KanjiListFilterKunYomi Tests
 *
 * Tests for kun-yomi search filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterKunYomi from './KanjiListFilterKunYomi.vue'

describe('KanjiListFilterKunYomi', () => {
  it('renders with label', () => {
    render(KanjiListFilterKunYomi, {
      props: { modelValue: '' }
    })

    expect(screen.getByLabelText(/kun-yomi/i)).toBeInTheDocument()
  })

  it('displays current value', () => {
    render(KanjiListFilterKunYomi, {
      props: { modelValue: 'やま' }
    })

    expect(screen.getByLabelText(/kun-yomi/i)).toHaveValue('やま')
  })

  it('emits update on input', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListFilterKunYomi, {
      props: {
        modelValue: '',
        'onUpdate:modelValue': vi.fn()
      }
    })

    await user.type(screen.getByLabelText(/kun-yomi/i), 'かわ')

    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
  })
})
