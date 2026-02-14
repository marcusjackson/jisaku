/**
 * KanjiListFilterJoyoLevel Tests
 *
 * Tests for Joyo level chip toggle filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterJoyoLevel from './KanjiListFilterJoyoLevel.vue'

describe('KanjiListFilterJoyoLevel', () => {
  it('renders all Joyo levels with Japanese labels', () => {
    render(KanjiListFilterJoyoLevel, {
      props: { modelValue: [] }
    })

    expect(screen.getByText(/joyo level/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '小1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '小2' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '小3' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '小4' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '小5' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '小6' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '中学' })).toBeInTheDocument()
  })

  it('shows selected state for active levels', () => {
    render(KanjiListFilterJoyoLevel, {
      props: { modelValue: ['elementary1', 'elementary2'] }
    })

    expect(screen.getByRole('button', { name: '小1' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '小2' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '小3' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('emits update to add level', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiListFilterJoyoLevel, {
      props: { modelValue: [], 'onUpdate:modelValue': onUpdate }
    })

    await user.click(screen.getByRole('button', { name: '小1' }))

    expect(onUpdate).toHaveBeenCalledWith(['elementary1'])
  })

  it('emits update to remove level', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiListFilterJoyoLevel, {
      props: {
        modelValue: ['elementary1', 'elementary2'],
        'onUpdate:modelValue': onUpdate
      }
    })

    await user.click(screen.getByRole('button', { name: '小1' }))

    expect(onUpdate).toHaveBeenCalledWith(['elementary2'])
  })
})
