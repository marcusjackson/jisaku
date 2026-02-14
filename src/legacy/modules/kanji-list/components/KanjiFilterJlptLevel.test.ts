import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiFilterJlptLevel from './KanjiFilterJlptLevel.vue'

describe('KanjiFilterJlptLevel', () => {
  it('renders with label', () => {
    render(KanjiFilterJlptLevel, {
      props: {
        modelValue: []
      }
    })

    expect(screen.getByText('JLPT Level')).toBeInTheDocument()
  })

  it('renders all JLPT level chips', () => {
    render(KanjiFilterJlptLevel, {
      props: {
        modelValue: []
      }
    })

    expect(screen.getByRole('button', { name: 'N5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N1' })).toBeInTheDocument()
  })

  it('marks selected levels as pressed', () => {
    render(KanjiFilterJlptLevel, {
      props: {
        modelValue: ['N3', 'N2']
      }
    })

    expect(screen.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
    expect(screen.getByRole('button', { name: 'N3' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'N2' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('emits new selection when chip is clicked to add', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterJlptLevel, {
      props: {
        modelValue: ['N3']
      }
    })

    await user.click(screen.getByRole('button', { name: 'N2' }))

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.[0]).toEqual([['N3', 'N2']])
  })

  it('emits new selection when chip is clicked to remove', async () => {
    const user = userEvent.setup()
    const result = render(KanjiFilterJlptLevel, {
      props: {
        modelValue: ['N3', 'N2']
      }
    })

    await user.click(screen.getByRole('button', { name: 'N3' }))

    const emittedEvents = result.emitted()
    expect(emittedEvents['update:modelValue']).toBeTruthy()
    expect(emittedEvents['update:modelValue']?.[0]).toEqual([['N2']])
  })

  it('has accessible group role', () => {
    render(KanjiFilterJlptLevel, {
      props: {
        modelValue: []
      }
    })

    expect(
      screen.getByRole('group', { name: 'JLPT Level filter' })
    ).toBeInTheDocument()
  })
})
