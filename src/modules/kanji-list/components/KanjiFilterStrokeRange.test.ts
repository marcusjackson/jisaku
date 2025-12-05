import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterStrokeRange from './KanjiFilterStrokeRange.vue'

describe('KanjiFilterStrokeRange', () => {
  it('renders with label', () => {
    render(KanjiFilterStrokeRange, {
      props: {
        max: undefined,
        min: undefined
      }
    })

    expect(screen.getByText('Strokes')).toBeInTheDocument()
  })

  it('renders min and max inputs', () => {
    render(KanjiFilterStrokeRange, {
      props: {
        max: undefined,
        min: undefined
      }
    })

    expect(screen.getByLabelText('Minimum strokes')).toBeInTheDocument()
    expect(screen.getByLabelText('Maximum strokes')).toBeInTheDocument()
  })

  it('displays current min value', () => {
    render(KanjiFilterStrokeRange, {
      props: {
        max: undefined,
        min: 5
      }
    })

    expect(screen.getByLabelText('Minimum strokes')).toHaveValue(5)
  })

  it('displays current max value', () => {
    render(KanjiFilterStrokeRange, {
      props: {
        max: 10,
        min: undefined
      }
    })

    expect(screen.getByLabelText('Maximum strokes')).toHaveValue(10)
  })

  it('emits update:min on min input change', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterStrokeRange, {
      props: {
        max: undefined,
        min: undefined
      }
    })

    const minInput = screen.getByLabelText('Minimum strokes')
    await user.type(minInput, '5')

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:min']).toBeTruthy()
    expect(emittedEvents['update:min']?.at(-1)).toEqual([5])
  })

  it('emits update:max on max input change', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterStrokeRange, {
      props: {
        max: undefined,
        min: undefined
      }
    })

    const maxInput = screen.getByLabelText('Maximum strokes')
    await user.type(maxInput, '10')

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:max']).toBeTruthy()
    expect(emittedEvents['update:max']?.at(-1)).toEqual([10])
  })

  it('emits undefined when input is cleared', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterStrokeRange, {
      props: {
        max: undefined,
        min: 5
      }
    })

    const minInput = screen.getByLabelText('Minimum strokes')
    await user.clear(minInput)

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:min']?.at(-1)).toEqual([undefined])
  })
})
