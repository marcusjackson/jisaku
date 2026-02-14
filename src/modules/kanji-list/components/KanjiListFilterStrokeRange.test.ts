/**
 * KanjiListFilterStrokeRange Tests
 *
 * Tests for stroke count range filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterStrokeRange from './KanjiListFilterStrokeRange.vue'

describe('KanjiListFilterStrokeRange', () => {
  it('renders label and both inputs', () => {
    render(KanjiListFilterStrokeRange, {
      props: { min: undefined, max: undefined }
    })

    expect(screen.getByText(/strokes/i)).toBeInTheDocument()
    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs).toHaveLength(2)
  })

  it('displays current min and max values', () => {
    render(KanjiListFilterStrokeRange, {
      props: { min: 5, max: 10 }
    })

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toHaveValue(5)
    expect(inputs[1]).toHaveValue(10)
  })

  it('emits update:min when min input changes', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListFilterStrokeRange, {
      props: {
        min: undefined,
        max: undefined,
        'onUpdate:min': vi.fn()
      }
    })

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[0]).toBeDefined()
    await user.type(inputs[0]!, '5')

    expect(wrapper.emitted('update:min')).toBeTruthy()
  })

  it('emits update:max when max input changes', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListFilterStrokeRange, {
      props: {
        min: undefined,
        max: undefined,
        'onUpdate:max': vi.fn()
      }
    })

    const inputs = screen.getAllByRole('spinbutton')
    expect(inputs[1]).toBeDefined()
    await user.type(inputs[1]!, '10')

    expect(wrapper.emitted('update:max')).toBeTruthy()
  })
})
