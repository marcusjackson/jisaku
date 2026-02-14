/**
 * Tests for KanjiDetailMeaningItem component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailMeaningItem from './KanjiDetailMeaningItem.vue'

describe('KanjiDetailMeaningItem', () => {
  const defaultProps = {
    additionalInfo: '',
    index: 0,
    meaningText: 'bright',
    total: 3
  }

  it('displays item number', () => {
    render(KanjiDetailMeaningItem, { props: defaultProps })
    expect(screen.getByText('1.')).toBeInTheDocument()
  })

  it('displays meaning text', () => {
    render(KanjiDetailMeaningItem, { props: defaultProps })
    expect(screen.getByDisplayValue('bright')).toBeInTheDocument()
  })

  it('displays additional info', () => {
    render(KanjiDetailMeaningItem, {
      props: { ...defaultProps, additionalInfo: 'of the sun' }
    })
    expect(screen.getByDisplayValue('of the sun')).toBeInTheDocument()
  })

  it('emits update:meaningText on input', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailMeaningItem, { props: defaultProps })

    const input = screen.getByPlaceholderText('Meaning')
    await user.clear(input)
    await user.type(input, 'light')

    expect(emitted()['update:meaningText']).toBeTruthy()
  })

  it('emits update:additionalInfo on input', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailMeaningItem, { props: defaultProps })

    const input = screen.getByPlaceholderText('Additional info (optional)')
    await user.type(input, 'info')

    expect(emitted()['update:additionalInfo']).toBeTruthy()
  })

  it('emits move-up when up button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailMeaningItem, {
      props: { ...defaultProps, index: 1 }
    })

    await user.click(screen.getByRole('button', { name: 'Move up' }))

    expect(emitted()['move-up']).toBeTruthy()
  })

  it('emits move-down when down button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailMeaningItem, { props: defaultProps })

    await user.click(screen.getByRole('button', { name: 'Move down' }))

    expect(emitted()['move-down']).toBeTruthy()
  })

  it('emits delete when delete button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailMeaningItem, {
      props: { ...defaultProps, destructiveMode: true }
    })

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(emitted()['delete']).toBeTruthy()
  })

  it('disables move-up for first item', () => {
    render(KanjiDetailMeaningItem, { props: { ...defaultProps, index: 0 } })
    expect(screen.getByRole('button', { name: 'Move up' })).toBeDisabled()
  })

  it('disables move-down for last item', () => {
    render(KanjiDetailMeaningItem, {
      props: { ...defaultProps, index: 2, total: 3 }
    })
    expect(screen.getByRole('button', { name: 'Move down' })).toBeDisabled()
  })
})
