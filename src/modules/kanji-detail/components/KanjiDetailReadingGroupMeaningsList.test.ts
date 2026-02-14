/**
 * Tests for KanjiDetailReadingGroupMeaningsList component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailReadingGroupMeaningsList from './KanjiDetailReadingGroupMeaningsList.vue'

import type { EditMeaning } from '../kanji-detail-types'

// Mock BaseButton
vi.mock('@/base/components', () => ({
  BaseButton: {
    name: 'BaseButton',
    props: {
      size: { type: String, default: 'md' },
      variant: { type: String, default: 'primary' },
      disabled: { type: Boolean, default: false }
    },
    template: `<button :disabled="disabled"><slot /></button>`
  }
}))

function mockMeaning(overrides: Partial<EditMeaning> = {}): EditMeaning {
  return {
    additionalInfo: '',
    id: 1,
    meaningText: 'bright',
    ...overrides
  }
}

describe('KanjiDetailReadingGroupMeaningsList', () => {
  const defaultProps = {
    destructiveMode: false,
    groupId: 1,
    meanings: [] as EditMeaning[]
  }

  describe('Empty state', () => {
    it('renders empty state when no meanings', () => {
      render(KanjiDetailReadingGroupMeaningsList, { props: defaultProps })

      expect(screen.getByText(/no meanings assigned/i)).toBeInTheDocument()
    })

    it('shows label', () => {
      render(KanjiDetailReadingGroupMeaningsList, { props: defaultProps })

      expect(screen.getByText(/meanings in this group/i)).toBeInTheDocument()
    })
  })

  describe('Displaying meanings', () => {
    it('renders single meaning', () => {
      render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [mockMeaning()]
        }
      })

      expect(screen.getByText('bright')).toBeInTheDocument()
    })

    it('renders multiple meanings', () => {
      render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [
            mockMeaning({ id: 1, meaningText: 'bright' }),
            mockMeaning({ id: 2, meaningText: 'light' })
          ]
        }
      })

      expect(screen.getByText('bright')).toBeInTheDocument()
      expect(screen.getByText('light')).toBeInTheDocument()
    })

    it('renders meanings in ordered list', () => {
      const { container } = render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [mockMeaning()]
        }
      })

      expect(container.querySelector('ol')).toBeInTheDocument()
    })
  })

  describe('Moving meanings', () => {
    it('shows move up and down buttons', () => {
      render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [mockMeaning(), mockMeaning({ id: 2 })]
        }
      })

      const moveUpButtons = screen.getAllByRole('button', { name: /move up/i })
      const moveDownButtons = screen.getAllByRole('button', {
        name: /move down/i
      })

      expect(moveUpButtons).toHaveLength(2)
      expect(moveDownButtons).toHaveLength(2)
    })

    it('disables move up button for first meaning', () => {
      render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [mockMeaning({ id: 1 }), mockMeaning({ id: 2 })]
        }
      })

      const moveUpButtons = screen.getAllByRole('button', { name: /move up/i })
      expect(moveUpButtons[0]).toBeDisabled()
      expect(moveUpButtons[1]).not.toBeDisabled()
    })

    it('disables move down button for last meaning', () => {
      render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [mockMeaning({ id: 1 }), mockMeaning({ id: 2 })]
        }
      })

      const moveDownButtons = screen.getAllByRole('button', {
        name: /move down/i
      })
      expect(moveDownButtons[0]).not.toBeDisabled()
      expect(moveDownButtons[1]).toBeDisabled()
    })

    it('emits moveUp event when move up clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [mockMeaning({ id: 1 }), mockMeaning({ id: 2 })]
        }
      })

      const moveUpButtons = screen.getAllByRole('button', { name: /move up/i })
      await user.click(moveUpButtons[1]!)

      expect(emitted()['moveUp']).toBeTruthy()
      expect(emitted()['moveUp']?.[0]).toEqual([1]) // Index of second meaning
    })

    it('emits moveDown event when move down clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          meanings: [mockMeaning({ id: 1 }), mockMeaning({ id: 2 })]
        }
      })

      const moveDownButtons = screen.getAllByRole('button', {
        name: /move down/i
      })
      await user.click(moveDownButtons[0]!)

      expect(emitted()['moveDown']).toBeTruthy()
      expect(emitted()['moveDown']?.[0]).toEqual([0]) // Index of first meaning
    })
  })

  describe('Removing meanings', () => {
    it('hides remove button when destructive mode is off', () => {
      render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          destructiveMode: false,
          meanings: [mockMeaning()]
        }
      })

      expect(
        screen.queryByRole('button', { name: /remove from group/i })
      ).not.toBeInTheDocument()
    })

    it('shows remove button when destructive mode is on', () => {
      render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          destructiveMode: true,
          meanings: [mockMeaning()]
        }
      })

      expect(
        screen.getByRole('button', { name: /remove from group/i })
      ).toBeInTheDocument()
    })

    it('emits remove event with meaning ID when remove clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailReadingGroupMeaningsList, {
        props: {
          ...defaultProps,
          destructiveMode: true,
          meanings: [mockMeaning({ id: 42 })]
        }
      })

      await user.click(
        screen.getByRole('button', { name: /remove from group/i })
      )

      expect(emitted()['remove']).toBeTruthy()
      expect(emitted()['remove']?.[0]).toEqual([42]) // Meaning ID
    })
  })
})
