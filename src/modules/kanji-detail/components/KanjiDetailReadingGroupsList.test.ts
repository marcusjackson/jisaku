/**
 * Tests for KanjiDetailReadingGroupsList component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailReadingGroupsList from './KanjiDetailReadingGroupsList.vue'

import type { EditMeaning, EditReadingGroup } from '../kanji-detail-types'

// Mock base components
vi.mock('@/base/components', () => ({
  BaseButton: {
    name: 'BaseButton',
    props: {
      size: { type: String, default: 'md' },
      variant: { type: String, default: 'primary' },
      disabled: { type: Boolean, default: false }
    },
    template: `<button :disabled="disabled"><slot /></button>`
  },
  BaseInput: {
    name: 'BaseInput',
    props: {
      modelValue: { type: String, default: '' },
      placeholder: { type: String, default: '' }
    },
    emits: ['update:modelValue'],
    template: `<input :value="modelValue" :placeholder="placeholder" @input="$emit('update:modelValue', $event.target.value)" />`
  },
  BaseSelect: {
    name: 'BaseSelect',
    props: {
      modelValue: { type: String, default: '' },
      label: { type: String, default: '' },
      placeholder: { type: String, default: '' },
      options: { type: Array, default: () => [] }
    },
    emits: ['update:modelValue'],
    template: `
      <div>
        <select :value="modelValue" :aria-label="label" @change="$emit('update:modelValue', $event.target.value)">
          <option value="">{{ placeholder }}</option>
          <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>
    `
  }
}))

function mockGroup(
  overrides: Partial<EditReadingGroup> = {}
): EditReadingGroup {
  return {
    id: 1,
    readingText: 'メイ',
    ...overrides
  }
}

function mockMeaning(overrides: Partial<EditMeaning> = {}): EditMeaning {
  return {
    id: 1,
    meaningText: 'bright',
    additionalInfo: '',
    ...overrides
  }
}

describe('KanjiDetailReadingGroupsList', () => {
  const defaultProps = {
    groups: [] as EditReadingGroup[],
    destructiveMode: false,
    unassignedMeanings: [] as EditMeaning[]
  }

  describe('Empty state', () => {
    it('renders empty state when no groups', () => {
      render(KanjiDetailReadingGroupsList, { props: defaultProps })

      expect(
        screen.getByText(
          /No reading groups\. Click "\+ Add Group" to create one\./i
        )
      ).toBeInTheDocument()
    })

    it('shows "+ Add Group" button in empty state', () => {
      render(KanjiDetailReadingGroupsList, { props: defaultProps })

      expect(
        screen.getByRole('button', { name: /\+ add group/i })
      ).toBeInTheDocument()
    })
  })

  describe('Adding groups', () => {
    it('emits add event when "+ Add Group" clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: defaultProps
      })

      await user.click(screen.getByRole('button', { name: /\+ add group/i }))

      expect(emitted()['add']).toBeTruthy()
      expect(emitted()['add']).toHaveLength(1)
    })
  })

  describe('Displaying groups', () => {
    it('renders single group', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup()]
        }
      })

      expect(screen.getByDisplayValue('メイ')).toBeInTheDocument()
    })

    it('renders multiple groups', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [
            mockGroup({ id: 1, readingText: 'メイ' }),
            mockGroup({ id: 2, readingText: 'ミョウ' })
          ]
        }
      })

      expect(screen.getByDisplayValue('メイ')).toBeInTheDocument()
      expect(screen.getByDisplayValue('ミョウ')).toBeInTheDocument()
    })

    it('renders group input with placeholder', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup({ readingText: '' })]
        }
      })

      expect(
        screen.getByPlaceholderText(/reading.*メイ.*あか.り/i)
      ).toBeInTheDocument()
    })
  })

  describe('Editing groups', () => {
    it('emits update:readingText when group text changes', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup({ id: 1, readingText: 'メイ' })]
        }
      })

      const input = screen.getByDisplayValue('メイ')
      await user.clear(input)
      await user.type(input, 'ミョウ')

      expect(emitted()['update:readingText']).toBeTruthy()
      // Should emit index and new value
      const lastEmit = emitted()['update:readingText']?.at(-1) as
        | [number, string]
        | undefined
      expect(lastEmit?.[0]).toBe(0) // Index
      expect(lastEmit?.[1]).toBe('ミョウ') // New value
    })
  })

  describe('Moving groups', () => {
    it('shows move up and down buttons', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup(), mockGroup({ id: 2 })]
        }
      })

      const moveUpButtons = screen.getAllByRole('button', {
        name: /move group up/i
      })
      const moveDownButtons = screen.getAllByRole('button', {
        name: /move group down/i
      })

      expect(moveUpButtons).toHaveLength(2)
      expect(moveDownButtons).toHaveLength(2)
    })

    it('disables move up button for first group', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup(), mockGroup({ id: 2 })]
        }
      })

      const moveUpButtons = screen.getAllByRole('button', {
        name: /move group up/i
      })
      expect(moveUpButtons[0]).toBeDisabled()
      expect(moveUpButtons[1]).not.toBeDisabled()
    })

    it('disables move down button for last group', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup(), mockGroup({ id: 2 })]
        }
      })

      const moveDownButtons = screen.getAllByRole('button', {
        name: /move group down/i
      })
      expect(moveDownButtons[0]).not.toBeDisabled()
      expect(moveDownButtons[1]).toBeDisabled()
    })

    it('emits move event with correct direction when move up clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup({ id: 1 }), mockGroup({ id: 2 })]
        }
      })

      const moveUpButtons = screen.getAllByRole('button', {
        name: /move group up/i
      })
      await user.click(moveUpButtons[1]!) // Click second group's move up

      expect(emitted()['move']).toBeTruthy()
      const lastEmit = emitted()['move']?.at(-1) as [number, -1 | 1] | undefined
      expect(lastEmit?.[0]).toBe(1) // Index of second group
      expect(lastEmit?.[1]).toBe(-1) // Direction up
    })

    it('emits move event with correct direction when move down clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup({ id: 1 }), mockGroup({ id: 2 })]
        }
      })

      const moveDownButtons = screen.getAllByRole('button', {
        name: /move group down/i
      })
      await user.click(moveDownButtons[0]!) // Click first group's move down

      expect(emitted()['move']).toBeTruthy()
      const lastEmit = emitted()['move']?.at(-1) as [number, -1 | 1] | undefined
      expect(lastEmit?.[0]).toBe(0) // Index of first group
      expect(lastEmit?.[1]).toBe(1) // Direction down
    })
  })

  describe('Deleting groups', () => {
    it('hides delete button when destructive mode is off', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          destructiveMode: false,
          groups: [mockGroup()]
        }
      })

      expect(
        screen.queryByRole('button', { name: /delete group/i })
      ).not.toBeInTheDocument()
    })

    it('shows delete button when destructive mode is on', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          destructiveMode: true,
          groups: [mockGroup()]
        }
      })

      expect(
        screen.getByRole('button', { name: /delete group/i })
      ).toBeInTheDocument()
    })

    it('emits delete event when delete button clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          destructiveMode: true,
          groups: [mockGroup({ id: 1 })]
        }
      })

      await user.click(screen.getByRole('button', { name: /delete group/i }))

      expect(emitted()['delete']).toBeTruthy()
      const lastEmit = emitted()['delete']?.at(-1) as [number] | undefined
      expect(lastEmit?.[0]).toBe(0) // Index of group
    })

    it('emits correct index when deleting second group', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          destructiveMode: true,
          groups: [mockGroup({ id: 1 }), mockGroup({ id: 2 })]
        }
      })

      const deleteButtons = screen.getAllByRole('button', {
        name: /delete group/i
      })
      await user.click(deleteButtons[1]!)

      const lastEmit = emitted()['delete']?.at(-1) as [number] | undefined
      expect(lastEmit?.[0]).toBe(1) // Index of second group
    })
  })

  describe('Assigning meanings', () => {
    it('hides assign dropdown when no unassigned meanings', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup()],
          unassignedMeanings: []
        }
      })

      expect(
        screen.queryByRole('combobox', { name: /assign meaning to group/i })
      ).not.toBeInTheDocument()
    })

    it('shows assign dropdown when unassigned meanings exist', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup()],
          unassignedMeanings: [mockMeaning()]
        }
      })

      expect(
        screen.getByRole('combobox', { name: /assign meaning to group/i })
      ).toBeInTheDocument()
    })

    it('renders placeholder in assign dropdown', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup()],
          unassignedMeanings: [mockMeaning()]
        }
      })

      const select = screen.getByRole('combobox', {
        name: /assign meaning to group/i
      })
      expect(select).toHaveTextContent(/select a meaning/i)
    })

    it('displays unassigned meanings as options', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup()],
          unassignedMeanings: [
            mockMeaning({ id: 1, meaningText: 'bright' }),
            mockMeaning({ id: 2, meaningText: 'light' })
          ]
        }
      })

      expect(
        screen.getByRole('option', { name: /bright/i })
      ).toBeInTheDocument()
      expect(screen.getByRole('option', { name: /light/i })).toBeInTheDocument()
    })

    it('truncates long meaning text in dropdown', () => {
      const longText = 'a'.repeat(60)
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup()],
          unassignedMeanings: [mockMeaning({ id: 1, meaningText: longText })]
        }
      })

      const option = screen.getByRole('option', { name: /\.\.\./ })
      expect(option.textContent).toHaveLength(53) // 50 chars + '...'
    })

    it('does not truncate meaning text shorter than 50 chars', () => {
      render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup()],
          unassignedMeanings: [mockMeaning({ id: 1, meaningText: 'bright' })]
        }
      })

      const option = screen.getByRole('option', { name: /bright/i })
      expect(option.textContent).toBe('bright')
    })

    it('emits assign-meaning event when meaning selected', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup({ id: 1 })],
          unassignedMeanings: [mockMeaning({ id: 2, meaningText: 'bright' })]
        }
      })

      const select = screen.getByRole('combobox', {
        name: /assign meaning to group/i
      })
      await user.selectOptions(select, '2')

      expect(emitted()['assign-meaning']).toBeTruthy()
      const lastEmit = emitted()['assign-meaning']?.at(-1) as
        | [number, number]
        | undefined
      expect(lastEmit?.[0]).toBe(1) // Group ID
      expect(lastEmit?.[1]).toBe(2) // Meaning ID
    })

    it('does not emit assign-meaning when empty option selected', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup({ id: 1 })],
          unassignedMeanings: [mockMeaning({ id: 2, meaningText: 'bright' })]
        }
      })

      const select = screen.getByRole('combobox', {
        name: /assign meaning to group/i
      })
      await user.selectOptions(select, '')

      expect(emitted()['assign-meaning']).toBeFalsy()
    })
  })

  describe('Slot content', () => {
    it('renders slot content for each group', () => {
      const { container } = render(KanjiDetailReadingGroupsList, {
        props: {
          ...defaultProps,
          groups: [mockGroup({ id: 1 }), mockGroup({ id: 2 })]
        },
        slots: {
          'group-meanings': `<div>Slot content</div>`
        }
      })

      // Check that the slot content appears for each group
      const allText = container.textContent ?? ''
      const matches = (allText.match(/Slot content/g) ?? []).length
      expect(matches).toBeGreaterThanOrEqual(2)
    })
  })
})
