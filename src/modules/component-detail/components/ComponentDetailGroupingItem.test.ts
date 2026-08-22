/**
 * Tests for ComponentDetailGroupingItem component.
 *
 * TDD tests for the grouping item display with edit/delete/reorder/manage controls.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailGroupingItem from './ComponentDetailGroupingItem.vue'

import type {
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/api/component'

// Factory function for creating test grouping data
function createTestGrouping(
  overrides: Partial<ComponentGroupingWithMembers> = {}
): ComponentGroupingWithMembers {
  return {
    id: 1,
    componentId: 100,
    name: 'Left side',
    description: 'Appears on the left',
    displayOrder: 0,
    occurrenceCount: 3,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

// Default props shared by all tests
const defaultProps = {
  memberOccurrences: [] as OccurrenceWithKanji[],
  index: 0,
  total: 3,
  isDestructiveMode: false
}

describe('ComponentDetailGroupingItem', () => {
  describe('display', () => {
    it('displays grouping name', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          ...defaultProps,
          grouping: createTestGrouping({ name: 'Left side' })
        }
      })

      expect(screen.getByText('Left side')).toBeInTheDocument()
    })

    it('displays occurrence count badge', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping({ occurrenceCount: 5 }),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByText('5 kanji')).toBeInTheDocument()
    })

    it('displays singular "kanji" for count of 1', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping({ occurrenceCount: 1 }),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByText('1 kanji')).toBeInTheDocument()
    })

    it('displays description when present', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping({
            description: 'Appears on the left side'
          }),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByText('Appears on the left side')).toBeInTheDocument()
    })

    it('does not render description when null', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping({ description: null }),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.queryByText('Appears on the left')).not.toBeInTheDocument()
    })

    it('has correct test id', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping({ id: 42 }),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByTestId('grouping-item-42')).toBeInTheDocument()
    })
  })

  describe('reorder buttons', () => {
    it('disables up arrow when index is 0', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move up/i })).toBeDisabled()
    })

    it('enables up arrow when index > 0', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 1,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move up/i })).toBeEnabled()
    })

    it('disables down arrow when index equals total - 1', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 2,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move down/i })).toBeDisabled()
    })

    it('enables down arrow when index < total - 1', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move down/i })).toBeEnabled()
    })

    it('emits move-up when up arrow is clicked', async () => {
      const user = userEvent.setup()
      const onMoveUp = vi.fn()
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 1,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false,
          'onMove-up': onMoveUp
        }
      })

      await user.click(screen.getByRole('button', { name: /move up/i }))

      expect(onMoveUp).toHaveBeenCalled()
    })

    it('emits move-down when down arrow is clicked', async () => {
      const user = userEvent.setup()
      const onMoveDown = vi.fn()
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false,
          'onMove-down': onMoveDown
        }
      })

      await user.click(screen.getByRole('button', { name: /move down/i }))

      expect(onMoveDown).toHaveBeenCalled()
    })
  })

  describe('action buttons', () => {
    it('shows edit button', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('emits edit when edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false,
          onEdit
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(onEdit).toHaveBeenCalled()
    })

    it('shows manage members button', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(
        screen.getByRole('button', { name: /manage members/i })
      ).toBeInTheDocument()
    })

    it('emits manage-members when button is clicked', async () => {
      const user = userEvent.setup()
      const onManageMembers = vi.fn()
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false,
          'onManage-members': onManageMembers
        }
      })

      await user.click(screen.getByRole('button', { name: /manage members/i }))

      expect(onManageMembers).toHaveBeenCalled()
    })
  })

  describe('delete button', () => {
    it('shows delete button when destructive mode is enabled', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: true
        }
      })

      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
    })

    it('hides delete button when destructive mode is disabled', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: false
        }
      })

      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeInTheDocument()
    })

    it('emits delete when delete button is clicked', async () => {
      const user = userEvent.setup()
      const onDelete = vi.fn()
      render(ComponentDetailGroupingItem, {
        props: {
          grouping: createTestGrouping(),
          index: 0,
          total: 3,
          memberOccurrences: [],
          isDestructiveMode: true,
          onDelete
        }
      })

      await user.click(screen.getByRole('button', { name: /delete/i }))

      expect(onDelete).toHaveBeenCalled()
    })
  })

  describe('inline member preview', () => {
    function createTestOccurrence(
      id: number,
      character: string,
      shortMeaning: string
    ): OccurrenceWithKanji {
      return {
        id,
        kanjiId: id,
        componentId: 100,
        componentFormId: null,
        positionTypeId: null,
        isRadical: false,
        analysisNotes: null,
        displayOrder: 0,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        kanji: { id, character, shortMeaning, strokeCount: 4 },
        position: null
      }
    }

    const fewMembers = [
      createTestOccurrence(1, '木', 'tree'),
      createTestOccurrence(2, '林', 'grove'),
      createTestOccurrence(3, '森', 'forest')
    ]

    const manyMembers = [
      createTestOccurrence(1, '木', 'tree'),
      createTestOccurrence(2, '林', 'grove'),
      createTestOccurrence(3, '森', 'forest'),
      createTestOccurrence(4, '休', 'rest'),
      createTestOccurrence(5, '体', 'body'),
      createTestOccurrence(6, '本', 'book'),
      createTestOccurrence(7, '杉', 'cedar')
    ]

    it('does not render member section when no members', () => {
      render(ComponentDetailGroupingItem, {
        props: { ...defaultProps, grouping: createTestGrouping() }
      })

      expect(screen.queryByText('木')).not.toBeInTheDocument()
    })

    it('renders all member kanji when count <= 5', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          ...defaultProps,
          grouping: createTestGrouping(),
          memberOccurrences: fewMembers
        }
      })

      expect(screen.getByText('木')).toBeInTheDocument()
      expect(screen.getByText('林')).toBeInTheDocument()
      expect(screen.getByText('森')).toBeInTheDocument()
      expect(screen.queryByText(/more/)).not.toBeInTheDocument()
    })

    it('shows only first 5 and "+N more" button when count > 5', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          ...defaultProps,
          grouping: createTestGrouping(),
          memberOccurrences: manyMembers
        }
      })

      // First 5 visible
      expect(screen.getByText('木')).toBeInTheDocument()
      expect(screen.getByText('体')).toBeInTheDocument()
      // 6th and 7th hidden
      expect(screen.queryByText('本')).not.toBeInTheDocument()
      expect(screen.queryByText('杉')).not.toBeInTheDocument()
      // Toggle button shows count
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    it('expands to show all members when toggle is clicked', async () => {
      const user = userEvent.setup()
      render(ComponentDetailGroupingItem, {
        props: {
          ...defaultProps,
          grouping: createTestGrouping(),
          memberOccurrences: manyMembers
        }
      })

      await user.click(screen.getByText('+2 more'))

      expect(screen.getByText('本')).toBeInTheDocument()
      expect(screen.getByText('杉')).toBeInTheDocument()
      expect(screen.getByText('Show less')).toBeInTheDocument()
    })

    it('collapses back when "Show less" is clicked', async () => {
      const user = userEvent.setup()
      render(ComponentDetailGroupingItem, {
        props: {
          ...defaultProps,
          grouping: createTestGrouping(),
          memberOccurrences: manyMembers
        }
      })

      await user.click(screen.getByText('+2 more'))
      await user.click(screen.getByText('Show less'))

      expect(screen.queryByText('本')).not.toBeInTheDocument()
      expect(screen.getByText('+2 more')).toBeInTheDocument()
    })

    it('shows kanji shortMeaning as title attribute', () => {
      render(ComponentDetailGroupingItem, {
        props: {
          ...defaultProps,
          grouping: createTestGrouping(),
          memberOccurrences: [createTestOccurrence(1, '木', 'tree')]
        }
      })

      expect(screen.getByText('木')).toHaveAttribute('title', 'tree')
    })
  })
})
