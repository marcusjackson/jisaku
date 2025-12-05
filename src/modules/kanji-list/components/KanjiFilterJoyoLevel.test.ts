import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import { JOYO_OPTIONS } from '@/shared/constants/kanji-constants'

import KanjiFilterJoyoLevel from './KanjiFilterJoyoLevel.vue'

describe('KanjiFilterJoyoLevel', () => {
  it('renders with label', () => {
    render(KanjiFilterJoyoLevel, {
      props: { modelValue: [] }
    })

    expect(screen.getByText('Joyo Level')).toBeInTheDocument()
  })

  it('renders all Joyo level chips', () => {
    render(KanjiFilterJoyoLevel, {
      props: { modelValue: [] }
    })

    for (const option of JOYO_OPTIONS) {
      expect(
        screen.getByRole('button', { name: option.label })
      ).toBeInTheDocument()
    }
  })

  it('marks selected levels as pressed', () => {
    render(KanjiFilterJoyoLevel, {
      props: { modelValue: ['elementary1', 'elementary3'] }
    })

    expect(
      screen.getByRole('button', { name: '小1 (Grade 1)' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(
      screen.getByRole('button', { name: '小2 (Grade 2)' })
    ).toHaveAttribute('aria-pressed', 'false')
    expect(
      screen.getByRole('button', { name: '小3 (Grade 3)' })
    ).toHaveAttribute('aria-pressed', 'true')
  })

  it('emits new selection when chip is clicked to add', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterJoyoLevel, {
      props: { modelValue: ['elementary1'] }
    })

    await user.click(screen.getByRole('button', { name: '小4 (Grade 4)' }))

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.[0]).toEqual([
      ['elementary1', 'elementary4']
    ])
  })

  it('emits new selection when chip is clicked to remove', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterJoyoLevel, {
      props: { modelValue: ['elementary1', 'elementary2'] }
    })

    await user.click(screen.getByRole('button', { name: '小1 (Grade 1)' }))

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.[0]).toEqual([['elementary2']])
  })

  it('has accessible group role', () => {
    render(KanjiFilterJoyoLevel, {
      props: { modelValue: [] }
    })

    const group = screen.getByRole('group', { name: 'Joyo Level filter' })
    expect(group).toBeInTheDocument()
  })
})
