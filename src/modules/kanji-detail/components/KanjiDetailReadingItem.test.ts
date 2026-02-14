/**
 * Tests for KanjiDetailReadingItem component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailReadingItem from './KanjiDetailReadingItem.vue'

describe('KanjiDetailReadingItem', () => {
  const defaultProps = {
    reading: 'メイ',
    readingLevel: '小' as const,
    index: 0,
    total: 3
  }

  it('displays reading value', () => {
    render(KanjiDetailReadingItem, { props: defaultProps })
    const input = screen.getByPlaceholderText('Reading')
    expect(input).toHaveValue('メイ')
  })

  it('displays item number', () => {
    render(KanjiDetailReadingItem, { props: { ...defaultProps, index: 2 } })
    expect(screen.getByText('3.')).toBeInTheDocument()
  })

  it('emits update:reading when input changes', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailReadingItem, { props: defaultProps })

    const input = screen.getByPlaceholderText('Reading')
    await user.clear(input)
    await user.type(input, 'ミョウ')

    expect(emitted()['update:reading']).toBeTruthy()
  })

  it('shows okurigana field when showOkurigana is true', () => {
    render(KanjiDetailReadingItem, {
      props: { ...defaultProps, showOkurigana: true, okurigana: 'り' }
    })

    const input = screen.getByPlaceholderText('Okurigana')
    expect(input).toHaveValue('り')
  })

  it('does not show okurigana field by default', () => {
    render(KanjiDetailReadingItem, { props: defaultProps })
    expect(screen.queryByPlaceholderText('Okurigana')).not.toBeInTheDocument()
  })

  it('disables move up button when first item', () => {
    render(KanjiDetailReadingItem, { props: { ...defaultProps, index: 0 } })
    const upButton = screen.getByRole('button', { name: 'Move up' })
    expect(upButton).toBeDisabled()
  })

  it('disables move down button when last item', () => {
    render(KanjiDetailReadingItem, {
      props: { ...defaultProps, index: 2, total: 3 }
    })
    const downButton = screen.getByRole('button', { name: 'Move down' })
    expect(downButton).toBeDisabled()
  })

  it('emits moveUp when up button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailReadingItem, {
      props: { ...defaultProps, index: 1 }
    })

    await user.click(screen.getByRole('button', { name: 'Move up' }))
    expect(emitted()['moveUp']).toBeTruthy()
  })

  it('emits moveDown when down button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailReadingItem, {
      props: { ...defaultProps, index: 0 }
    })

    await user.click(screen.getByRole('button', { name: 'Move down' }))
    expect(emitted()['moveDown']).toBeTruthy()
  })

  it('emits delete when delete button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailReadingItem, {
      props: { ...defaultProps, destructiveMode: true }
    })

    await user.click(screen.getByRole('button', { name: 'Delete reading' }))
    expect(emitted()['delete']).toBeTruthy()
  })

  it('displays warning message when provided', () => {
    render(KanjiDetailReadingItem, {
      props: { ...defaultProps, warning: 'On-yomi is generally katakana' }
    })

    expect(
      screen.getByText('On-yomi is generally katakana')
    ).toBeInTheDocument()
  })

  it('displays okurigana warning when provided', () => {
    render(KanjiDetailReadingItem, {
      props: {
        ...defaultProps,
        showOkurigana: true,
        okurigana: 'リ',
        okuriganaWarning: 'Okurigana is generally hiragana'
      }
    })

    expect(
      screen.getByText('Okurigana is generally hiragana')
    ).toBeInTheDocument()
  })
})
