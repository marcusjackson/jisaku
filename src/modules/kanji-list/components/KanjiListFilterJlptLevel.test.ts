/**
 * KanjiListFilterJlptLevel Tests
 *
 * Tests for JLPT level chip toggle filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterJlptLevel from './KanjiListFilterJlptLevel.vue'

describe('KanjiListFilterJlptLevel', () => {
  it('renders all JLPT levels', () => {
    render(KanjiListFilterJlptLevel, {
      props: { modelValue: [] }
    })

    expect(screen.getByText(/jlpt level/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'N1' })).toBeInTheDocument()
  })

  it('shows selected state for active levels', () => {
    render(KanjiListFilterJlptLevel, {
      props: { modelValue: ['N5', 'N3'] }
    })

    expect(screen.getByRole('button', { name: 'N5' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'N3' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'N4' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('emits update to add level when unselected level clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiListFilterJlptLevel, {
      props: { modelValue: [], 'onUpdate:modelValue': onUpdate }
    })

    await user.click(screen.getByRole('button', { name: 'N5' }))

    expect(onUpdate).toHaveBeenCalledWith(['N5'])
  })

  it('emits update to remove level when selected level clicked', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiListFilterJlptLevel, {
      props: { modelValue: ['N5', 'N4'], 'onUpdate:modelValue': onUpdate }
    })

    await user.click(screen.getByRole('button', { name: 'N5' }))

    expect(onUpdate).toHaveBeenCalledWith(['N4'])
  })
})
