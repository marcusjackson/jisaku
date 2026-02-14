import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterKenteiLevel from './KanjiFilterKenteiLevel.vue'

describe('KanjiFilterKenteiLevel', () => {
  it('renders with label', () => {
    render(KanjiFilterKenteiLevel, {
      props: {
        modelValue: []
      }
    })

    expect(screen.getByText('Kanji Kentei Level')).toBeInTheDocument()
  })

  it('renders all Kentei level chips', () => {
    render(KanjiFilterKenteiLevel, {
      props: {
        modelValue: []
      }
    })

    expect(screen.getByRole('button', { name: '10級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '5級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '3級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '準2級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '準1級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1級' })).toBeInTheDocument()
  })

  it('marks selected levels as pressed', () => {
    render(KanjiFilterKenteiLevel, {
      props: {
        modelValue: ['3級', '2級']
      }
    })

    expect(screen.getByRole('button', { name: '10級' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByRole('button', { name: '3級' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '2級' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('emits new selection when chip is clicked to add', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterKenteiLevel, {
      props: {
        modelValue: ['3級']
      }
    })

    await user.click(screen.getByRole('button', { name: '2級' }))

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.[0]).toEqual([['3級', '2級']])
  })

  it('emits new selection when chip is clicked to remove', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterKenteiLevel, {
      props: {
        modelValue: ['3級', '2級']
      }
    })

    await user.click(screen.getByRole('button', { name: '3級' }))

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.[0]).toEqual([['2級']])
  })

  it('allows selecting multiple levels', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterKenteiLevel, {
      props: {
        modelValue: []
      }
    })

    await user.click(screen.getByRole('button', { name: '準1級' }))

    let emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toHaveLength(1)
    expect(emittedEvents['update:modelValue']?.[0]).toEqual([['準1級']])

    // Now select another level (simulate parent updating modelValue)
    await result.rerender({ modelValue: ['準1級'] })
    await user.click(screen.getByRole('button', { name: '1級' }))

    emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toHaveLength(2)
    expect(emittedEvents['update:modelValue']?.[1]).toEqual([['準1級', '1級']])
  })
})
