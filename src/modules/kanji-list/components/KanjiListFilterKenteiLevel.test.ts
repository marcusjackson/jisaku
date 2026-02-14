/**
 * KanjiListFilterKenteiLevel Tests
 *
 * Tests for Kanji Kentei level chip toggle filter component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListFilterKenteiLevel from './KanjiListFilterKenteiLevel.vue'

describe('KanjiListFilterKenteiLevel', () => {
  it('renders all Kentei levels', () => {
    render(KanjiListFilterKenteiLevel, {
      props: { modelValue: [] }
    })

    expect(screen.getByText(/kanji kentei level/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '10級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '準2級' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '1級' })).toBeInTheDocument()
  })

  it('shows selected state for active levels', () => {
    render(KanjiListFilterKenteiLevel, {
      props: { modelValue: ['10', '9'] }
    })

    expect(screen.getByRole('button', { name: '10級' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '9級' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: '8級' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('emits update to add level', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiListFilterKenteiLevel, {
      props: { modelValue: [], 'onUpdate:modelValue': onUpdate }
    })

    await user.click(screen.getByRole('button', { name: '10級' }))

    expect(onUpdate).toHaveBeenCalledWith(['10'])
  })

  it('emits update to remove level', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    render(KanjiListFilterKenteiLevel, {
      props: { modelValue: ['10', '9'], 'onUpdate:modelValue': onUpdate }
    })

    await user.click(screen.getByRole('button', { name: '10級' }))

    expect(onUpdate).toHaveBeenCalledWith(['9'])
  })
})
