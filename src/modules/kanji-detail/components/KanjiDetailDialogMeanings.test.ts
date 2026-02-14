/**
 * Tests for KanjiDetailDialogMeanings component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailDialogMeanings from './KanjiDetailDialogMeanings.vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/api/kanji'

// Mock BaseDialog and BaseSwitch to render without teleport
vi.mock('@/base/components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  return {
    ...original,
    BaseDialog: {
      name: 'BaseDialog',
      props: {
        open: { type: Boolean, required: true },
        title: { type: String, default: '' }
      },
      emits: ['update:open'],
      template: `<div v-if="open" role="dialog"><h2>{{ title }}</h2><slot></slot></div>`
    },
    BaseSwitch: {
      name: 'BaseSwitch',
      props: {
        modelValue: { type: Boolean, default: false },
        label: { type: String, default: '' }
      },
      emits: ['update:modelValue'],
      setup(
        props: { modelValue: boolean },
        { emit }: { emit: (event: string, ...args: unknown[]) => void }
      ) {
        return {
          toggle: () => {
            emit('update:modelValue', !props.modelValue)
          }
        }
      },
      template: `<div><button role="switch" :aria-checked="modelValue" @click="toggle">{{ label }}</button></div>`
    }
  }
})

function mockMeaning(overrides: Partial<KanjiMeaning> = {}): KanjiMeaning {
  return {
    additionalInfo: null,
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    meaningText: 'bright',
    updatedAt: '',
    ...overrides
  }
}

function mockGroup(
  overrides: Partial<KanjiMeaningReadingGroup> = {}
): KanjiMeaningReadingGroup {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    kanjiId: 1,
    readingText: 'メイ',
    updatedAt: '',
    ...overrides
  }
}

function mockMember(
  overrides: Partial<KanjiMeaningGroupMember> = {}
): KanjiMeaningGroupMember {
  return {
    createdAt: '',
    displayOrder: 0,
    id: 1,
    meaningId: 1,
    readingGroupId: 1,
    updatedAt: '',
    ...overrides
  }
}

describe('KanjiDetailDialogMeanings', () => {
  const defaultProps = {
    groupMembers: [] as KanjiMeaningGroupMember[],
    meanings: [mockMeaning()],
    open: true,
    readingGroups: [] as KanjiMeaningReadingGroup[]
  }

  it('renders dialog when open', () => {
    render(KanjiDetailDialogMeanings, { props: defaultProps })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('displays existing meanings', () => {
    render(KanjiDetailDialogMeanings, { props: defaultProps })
    expect(screen.getByDisplayValue('bright')).toBeInTheDocument()
  })

  it('adds new meaning when Add button clicked', async () => {
    const user = userEvent.setup()
    render(KanjiDetailDialogMeanings, { props: defaultProps })

    await user.click(screen.getByRole('button', { name: /add/i }))

    const inputs = screen.getAllByPlaceholderText('Meaning')
    expect(inputs).toHaveLength(2)
  })

  it('shows grouping toggle', () => {
    render(KanjiDetailDialogMeanings, { props: defaultProps })
    expect(screen.getByText('Group meanings by readings')).toBeInTheDocument()
  })

  it('enables grouping switch when groups exist', () => {
    render(KanjiDetailDialogMeanings, {
      props: {
        ...defaultProps,
        groupMembers: [mockMember()],
        readingGroups: [mockGroup()]
      }
    })
    const toggle = screen.getByRole('switch')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
  })

  it('emits save with meanings on submit', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailDialogMeanings, {
      props: defaultProps
    })

    const input = screen.getByDisplayValue('bright')
    await user.clear(input)
    await user.type(input, 'light')

    await user.click(screen.getByRole('button', { name: 'Save' }))

    expect(emitted()['save']).toBeTruthy()
    const saveEvents = emitted()['save'] as unknown[][]

    const saveData = saveEvents[0]![0] as {
      meanings: { meaningText: string }[]
    }
    expect(saveData.meanings[0]?.meaningText).toBe('light')
  })

  it('emits update:open false on cancel', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailDialogMeanings, {
      props: defaultProps
    })

    await user.click(screen.getByRole('button', { name: 'Cancel' }))

    expect(emitted()['update:open']).toContainEqual([false])
  })

  it('shows empty state when no meanings', () => {
    render(KanjiDetailDialogMeanings, {
      props: { ...defaultProps, meanings: [] }
    })
    expect(screen.getByText('No meanings')).toBeInTheDocument()
  })

  it('clears grouping data when grouping disabled', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailDialogMeanings, {
      props: {
        ...defaultProps,
        destructiveMode: true, // Enable destructive mode to allow unchecking
        groupMembers: [mockMember()],
        readingGroups: [mockGroup()]
      }
    })

    // Uncheck grouping
    await user.click(screen.getByRole('switch'))
    await user.click(screen.getByRole('button', { name: 'Save' }))

    const saveEvents = emitted()['save'] as unknown[][]

    const saveData = saveEvents[0]![0] as { groupingDisabled: boolean }
    expect(saveData.groupingDisabled).toBe(true)
  })
})
