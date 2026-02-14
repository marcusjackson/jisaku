/**
 * Tests for ComponentDetailGroupings component
 *
 * Tests grouping management UI including add/edit/delete dialogs,
 * member management, and reordering functionality.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailGroupings from './ComponentDetailGroupings.vue'

import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  Kanji,
  OccurrenceWithKanji
} from '@/legacy/shared/types/database-types'

// =============================================================================
// Mock Data Factories
// =============================================================================

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '海',
    strokeCount: 9,
    shortMeaning: 'sea',
    searchKeywords: null,
    radicalId: null,
    radicalStrokeCount: null,
    jlptLevel: null,
    joyoLevel: null,
    kenteiLevel: null,
    identifier: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

function createMockOccurrence(
  overrides: Partial<OccurrenceWithKanji> = {}
): OccurrenceWithKanji {
  return {
    id: 1,
    kanjiId: 1,
    componentId: 1,
    componentFormId: null,
    positionTypeId: null,
    position: null,
    isRadical: false,
    analysisNotes: null,
    displayOrder: 0,
    kanji: createMockKanji(),
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

function createMockGrouping(
  overrides: Partial<ComponentGroupingWithMembers> = {}
): ComponentGroupingWithMembers {
  return {
    id: 1,
    componentId: 1,
    name: 'Water-related',
    description: 'Kanji with semantic water meaning',
    displayOrder: 0,
    occurrenceCount: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

function createMockMember(
  overrides: Partial<ComponentGroupingMember> = {}
): ComponentGroupingMember {
  return {
    id: 1,
    groupingId: 1,
    occurrenceId: 1,
    displayOrder: 0,
    ...overrides
  }
}

// =============================================================================
// Tests
// =============================================================================

describe('ComponentDetailGroupings', () => {
  describe('rendering', () => {
    it('renders empty state when no groupings', () => {
      render(ComponentDetailGroupings, {
        props: {
          groupings: [],
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.getByText(/no groupings created yet/i)).toBeInTheDocument()
    })

    it('renders add button', () => {
      render(ComponentDetailGroupings, {
        props: {
          groupings: [],
          componentId: 1,
          occurrences: []
        }
      })

      expect(
        screen.getByRole('button', { name: /add grouping/i })
      ).toBeInTheDocument()
    })

    it('displays grouping name and description', () => {
      const groupings = [
        createMockGrouping({
          name: 'Left-side positions',
          description: 'Uses 氵 on left'
        })
      ]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.getByText('Left-side positions')).toBeInTheDocument()
      expect(screen.getByText('Uses 氵 on left')).toBeInTheDocument()
    })

    it('displays occurrence count', () => {
      const groupings = [createMockGrouping({ occurrenceCount: 3 })]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.getByText('(3 kanji)')).toBeInTheDocument()
    })

    it('renders edit button for each grouping', () => {
      const groupings = [createMockGrouping({ id: 1 })]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })
  })

  describe('add grouping dialog', () => {
    it('opens add dialog when clicking add button', async () => {
      const user = userEvent.setup()

      render(ComponentDetailGroupings, {
        props: {
          groupings: [],
          componentId: 1,
          occurrences: []
        }
      })

      await user.click(screen.getByRole('button', { name: /add grouping/i }))

      expect(screen.getByText('Add Grouping')).toBeInTheDocument()
      expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('emits add event on form submission', async () => {
      const user = userEvent.setup()

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings: [],
          componentId: 1,
          occurrences: []
        }
      })

      await user.click(screen.getByRole('button', { name: /add grouping/i }))
      await user.type(screen.getByLabelText(/name/i), 'Water kanji')
      await user.type(
        screen.getByLabelText(/description/i),
        'Kanji related to water'
      )

      const addButton = screen.getByRole('button', { name: /^add$/i })
      await user.click(addButton)

      expect(renderResult.emitted()['add']).toBeTruthy()
      const addEvent = renderResult.emitted()['add']?.[0] as [unknown]
      expect(addEvent[0]).toEqual({
        name: 'Water kanji',
        description: 'Kanji related to water'
      })
    })

    it('does not submit with empty name', async () => {
      const user = userEvent.setup()

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings: [],
          componentId: 1,
          occurrences: []
        }
      })

      await user.click(screen.getByRole('button', { name: /add grouping/i }))

      const addButton = screen.getByRole('button', { name: /^add$/i })
      await user.click(addButton)

      // Should not emit add event
      expect(renderResult.emitted()['add']).toBeFalsy()
    })
  })

  describe('edit grouping dialog', () => {
    it('opens edit dialog when clicking edit button', async () => {
      const user = userEvent.setup()
      const groupings = [
        createMockGrouping({ name: 'Old name', description: 'Old desc' })
      ]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByText('Edit Grouping')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Old name')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Old desc')).toBeInTheDocument()
    })

    it('emits update event on form submission', async () => {
      const user = userEvent.setup()
      const groupings = [
        createMockGrouping({
          id: 42,
          name: 'Old name',
          description: 'Old desc'
        })
      ]

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      const nameInput = screen.getByLabelText(/name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'New name')

      const descInput = screen.getByLabelText(/description/i)
      await user.clear(descInput)
      await user.type(descInput, 'New description')

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(renderResult.emitted()['update']).toBeTruthy()
      const updateEvent = renderResult.emitted()['update']?.[0] as [
        number,
        unknown
      ]
      expect(updateEvent[0]).toBe(42)
      expect(updateEvent[1]).toEqual({
        name: 'New name',
        description: 'New description'
      })
    })
  })

  describe('delete grouping', () => {
    it('hides delete button when destructive mode disabled', () => {
      const groupings = [createMockGrouping()]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: [],
          isDestructiveMode: false
        }
      })

      expect(
        screen.queryByRole('button', { name: '✕' })
      ).not.toBeInTheDocument()
    })

    it('shows delete button when destructive mode enabled', () => {
      const groupings = [createMockGrouping()]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: [],
          isDestructiveMode: true
        }
      })

      expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
    })

    it('opens delete confirmation dialog', async () => {
      const user = userEvent.setup()
      const groupings = [createMockGrouping()]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: [],
          isDestructiveMode: true
        }
      })

      await user.click(screen.getByRole('button', { name: '✕' }))

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(
        screen.getByRole('heading', { name: /delete grouping/i })
      ).toBeInTheDocument()
    })

    it('emits remove event on delete confirmation', async () => {
      const user = userEvent.setup()
      const groupings = [createMockGrouping({ id: 42, name: 'Test Group' })]

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: [],
          isDestructiveMode: true
        }
      })

      await user.click(screen.getByRole('button', { name: '✕' }))

      const deleteButton = screen.getByRole('button', { name: /delete/i })
      await user.click(deleteButton)

      expect(renderResult.emitted()['remove']).toBeTruthy()
      expect(renderResult.emitted()['remove']?.[0]).toEqual([42])
    })
  })

  describe('reordering', () => {
    it('renders up/down buttons for each grouping', () => {
      const groupings = [
        createMockGrouping({ id: 1 }),
        createMockGrouping({ id: 2 })
      ]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.getAllByRole('button', { name: '↑' })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: '↓' })).toHaveLength(2)
    })

    it('disables up button for first item', () => {
      const groupings = [createMockGrouping()]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.getByRole('button', { name: '↑' })).toBeDisabled()
    })

    it('disables down button for last item', () => {
      const groupings = [createMockGrouping()]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.getByRole('button', { name: '↓' })).toBeDisabled()
    })

    it('emits reorder event when moving up', async () => {
      const user = userEvent.setup()
      const groupings = [
        createMockGrouping({ id: 1 }),
        createMockGrouping({ id: 2 })
      ]

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      const upButtons = screen.getAllByRole('button', { name: '↑' })
      await user.click(upButtons[1]!)

      expect(renderResult.emitted()['reorder']).toBeTruthy()
      expect(renderResult.emitted()['reorder']?.[0]).toEqual([[2, 1]])
    })

    it('emits reorder event when moving down', async () => {
      const user = userEvent.setup()
      const groupings = [
        createMockGrouping({ id: 1 }),
        createMockGrouping({ id: 2 })
      ]

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      const downButtons = screen.getAllByRole('button', { name: '↓' })
      await user.click(downButtons[0]!)

      expect(renderResult.emitted()['reorder']).toBeTruthy()
      expect(renderResult.emitted()['reorder']?.[0]).toEqual([[2, 1]])
    })
  })

  describe('member expansion', () => {
    it('starts collapsed by default', () => {
      const groupings = [createMockGrouping()]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      expect(screen.queryByText('Members')).not.toBeInTheDocument()
    })

    it('expands to show members when clicking expand button', async () => {
      const user = userEvent.setup()
      const groupings = [createMockGrouping({ name: 'Test Group' })]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      const expandButton = screen.getByRole('button', { name: /test group/i })
      await user.click(expandButton)

      expect(screen.getByText('Members')).toBeInTheDocument()
    })
  })

  describe('member management', () => {
    it('displays member occurrences when expanded', async () => {
      const user = userEvent.setup()
      const occurrences = [
        createMockOccurrence({
          id: 1,
          kanji: createMockKanji({ character: '海', shortMeaning: 'sea' })
        })
      ]
      const groupings = [createMockGrouping({ id: 1, occurrenceCount: 1 })]
      const members = new Map<number, ComponentGroupingMember[]>([
        [1, [createMockMember({ groupingId: 1, occurrenceId: 1 })]]
      ])

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences,
          groupingMembers: members
        }
      })

      const expandButton = screen.getByRole('button', {
        name: /water-related/i
      })
      await user.click(expandButton)

      expect(screen.getByText('海')).toBeInTheDocument()
      expect(screen.getByText('sea')).toBeInTheDocument()
    })

    it('shows empty state when no members in group', async () => {
      const user = userEvent.setup()
      const groupings = [createMockGrouping({ occurrenceCount: 0 })]

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences: []
        }
      })

      const expandButton = screen.getByRole('button', {
        name: /water-related/i
      })
      await user.click(expandButton)

      expect(
        screen.getByText(/no kanji in this group yet/i)
      ).toBeInTheDocument()
    })

    it('displays remove button for each member', async () => {
      const user = userEvent.setup()
      const occurrences = [
        createMockOccurrence({
          id: 1,
          kanji: createMockKanji({ character: '海' })
        })
      ]
      const groupings = [createMockGrouping({ id: 1 })]
      const members = new Map<number, ComponentGroupingMember[]>([
        [1, [createMockMember({ groupingId: 1, occurrenceId: 1 })]]
      ])

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences,
          groupingMembers: members
        }
      })

      const expandButton = screen.getByRole('button', {
        name: /water-related/i
      })
      await user.click(expandButton)

      expect(
        screen.getByRole('button', { name: /remove/i })
      ).toBeInTheDocument()
    })

    it('emits removeMember event when clicking remove', async () => {
      const user = userEvent.setup()
      const occurrences = [
        createMockOccurrence({
          id: 99,
          kanji: createMockKanji({ character: '海' })
        })
      ]
      const groupings = [createMockGrouping({ id: 42 })]
      const members = new Map<number, ComponentGroupingMember[]>([
        [42, [createMockMember({ groupingId: 42, occurrenceId: 99 })]]
      ])

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences,
          groupingMembers: members
        }
      })

      const expandButton = screen.getByRole('button', {
        name: /water-related/i
      })
      await user.click(expandButton)

      const removeButton = screen.getByRole('button', { name: /remove/i })
      await user.click(removeButton)

      expect(renderResult.emitted()['removeMember']).toBeTruthy()
      expect(renderResult.emitted()['removeMember']?.[0]).toEqual([42, 99])
    })

    it('displays available occurrences to add', async () => {
      const user = userEvent.setup()
      const occurrences = [
        createMockOccurrence({
          id: 1,
          kanji: createMockKanji({ character: '海' })
        }),
        createMockOccurrence({
          id: 2,
          kanji: createMockKanji({ character: '泳' })
        })
      ]
      const groupings = [createMockGrouping({ id: 1 })]
      const members = new Map<number, ComponentGroupingMember[]>([
        [1, [createMockMember({ groupingId: 1, occurrenceId: 1 })]]
      ])

      render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences,
          groupingMembers: members
        }
      })

      const expandButton = screen.getByRole('button', {
        name: /water-related/i
      })
      await user.click(expandButton)

      expect(screen.getByText('Add kanji:')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '泳' })).toBeInTheDocument()
    })

    it('emits addMember event when clicking available occurrence', async () => {
      const user = userEvent.setup()
      const occurrences = [
        createMockOccurrence({
          id: 1,
          kanji: createMockKanji({ character: '海' })
        }),
        createMockOccurrence({
          id: 2,
          kanji: createMockKanji({ character: '泳' })
        })
      ]
      const groupings = [createMockGrouping({ id: 42 })]
      const members = new Map<number, ComponentGroupingMember[]>([
        [42, [createMockMember({ groupingId: 42, occurrenceId: 1 })]]
      ])

      const renderResult = render(ComponentDetailGroupings, {
        props: {
          groupings,
          componentId: 1,
          occurrences,
          groupingMembers: members
        }
      })

      const expandButton = screen.getByRole('button', {
        name: /water-related/i
      })
      await user.click(expandButton)

      const addButton = screen.getByRole('button', { name: '泳' })
      await user.click(addButton)

      expect(renderResult.emitted()['addMember']).toBeTruthy()
      expect(renderResult.emitted()['addMember']?.[0]).toEqual([42, 2])
    })
  })
})
