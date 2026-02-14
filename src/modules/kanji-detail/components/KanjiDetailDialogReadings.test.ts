/**
 * Tests for KanjiDetailDialogReadings component.
 */

import { defineComponent } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailDialogReadings from './KanjiDetailDialogReadings.vue'

import type { KunReading, OnReading } from '@/api/kanji'

// Mock BaseDialog to render without teleport
vi.mock('@/base/components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  const MockDialog = defineComponent({
    name: 'BaseDialog',
    props: {
      open: { type: Boolean, required: true },
      title: { type: String, default: '' }
    },
    emits: ['update:open'],
    setup(_props, { emit }) {
      const handleClose = () => {
        emit('update:open', false)
      }
      return { handleClose }
    },
    template: `
      <div v-if="open" role="dialog">
        <h2>{{ title }}</h2>
        <slot></slot>
      </div>
    `
  })
  return {
    ...original,
    BaseDialog: MockDialog
  }
})

function mockOnReading(overrides: Partial<OnReading> = {}): OnReading {
  return {
    id: 1,
    kanjiId: 1,
    reading: 'メイ',
    readingLevel: '小',
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

function mockKunReading(overrides: Partial<KunReading> = {}): KunReading {
  return {
    id: 1,
    kanjiId: 1,
    reading: 'あか',
    okurigana: null,
    readingLevel: '小',
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

describe('KanjiDetailDialogReadings', () => {
  const defaultProps = {
    open: true,
    onReadings: [mockOnReading()],
    kunReadings: [mockKunReading()]
  }

  it('renders dialog when open', () => {
    render(KanjiDetailDialogReadings, { props: defaultProps })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Edit Readings')).toBeInTheDocument()
  })

  it('displays existing on-readings', () => {
    render(KanjiDetailDialogReadings, { props: defaultProps })
    const inputs = screen.getAllByPlaceholderText('Reading')
    expect(inputs[0]).toHaveValue('メイ')
  })

  it('displays existing kun-readings', () => {
    render(KanjiDetailDialogReadings, { props: defaultProps })
    const inputs = screen.getAllByPlaceholderText('Reading')
    expect(inputs[1]).toHaveValue('あか')
  })

  it('adds new on-reading when Add button clicked', async () => {
    const user = userEvent.setup()
    render(KanjiDetailDialogReadings, { props: defaultProps })

    const addButtons = screen.getAllByRole('button', { name: '+ Add' })
    await user.click(addButtons[0]!) // First Add button is for on-yomi

    const inputs = screen.getAllByPlaceholderText('Reading')
    expect(inputs).toHaveLength(3) // 1 original on + 1 original kun + 1 new on
  })

  it('adds new kun-reading when Add button clicked', async () => {
    const user = userEvent.setup()
    render(KanjiDetailDialogReadings, { props: defaultProps })

    const addButtons = screen.getAllByRole('button', { name: '+ Add' })
    await user.click(addButtons[1]!) // Second Add button is for kun-yomi

    const inputs = screen.getAllByPlaceholderText('Reading')
    expect(inputs).toHaveLength(3)
  })

  it('emits save with updated readings on submit', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailDialogReadings, {
      props: defaultProps
    })

    const inputs = screen.getAllByPlaceholderText('Reading')
    await user.clear(inputs[0]!)
    await user.type(inputs[0]!, 'ミョウ')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(emitted()['save']).toBeTruthy()
    const saveEvents = emitted()['save'] as unknown[][]

    const saveData = saveEvents[0]![0] as { onReadings: OnReading[] }
    expect(saveData.onReadings[0]?.reading).toBe('ミョウ')
  })

  it('emits update:open false on cancel', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailDialogReadings, {
      props: defaultProps
    })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(emitted()['update:open']).toContainEqual([false])
  })

  it('shows empty state when no readings', () => {
    render(KanjiDetailDialogReadings, {
      props: { ...defaultProps, onReadings: [], kunReadings: [] }
    })

    expect(screen.getByText('No on-yomi readings')).toBeInTheDocument()
    expect(screen.getByText('No kun-yomi readings')).toBeInTheDocument()
  })

  it('shows warning for hiragana in on-reading', async () => {
    const user = userEvent.setup()
    render(KanjiDetailDialogReadings, { props: defaultProps })

    const input = screen.getAllByPlaceholderText('Reading')[0]!
    await user.clear(input)
    await user.type(input, 'めい')

    expect(
      screen.getByText('On-yomi is generally katakana')
    ).toBeInTheDocument()
  })

  it('resets state when dialog reopens', async () => {
    const { rerender } = render(KanjiDetailDialogReadings, {
      props: { ...defaultProps, open: false }
    })

    // Reopen dialog
    await rerender({ ...defaultProps, open: true })

    const inputs = screen.getAllByPlaceholderText('Reading')
    expect(inputs[0]).toHaveValue('メイ')
  })
})
