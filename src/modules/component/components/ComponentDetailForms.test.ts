/**
 * ComponentDetailForms Tests
 *
 * Tests for the component forms section (visual variants).
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailForms from './ComponentDetailForms.vue'

import type { ComponentForm } from '@/shared/types/database-types'

// Sample form data
function createForm(overrides: Partial<ComponentForm> = {}): ComponentForm {
  return {
    id: 1,
    componentId: 1,
    formCharacter: '氵',
    formName: 'sanzui',
    strokeCount: 3,
    usageNotes: 'Used on left side of kanji',
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  }
}

describe('ComponentDetailForms', () => {
  describe('rendering', () => {
    it('renders empty state when no forms', () => {
      render(ComponentDetailForms, {
        props: {
          forms: [],
          componentId: 1
        }
      })

      expect(screen.getByText(/no forms added yet/i)).toBeInTheDocument()
    })

    it('renders form list when forms exist', () => {
      const forms = [
        createForm({ id: 1, formCharacter: '水', formName: 'standard' }),
        createForm({ id: 2, formCharacter: '氵', formName: 'sanzui' })
      ]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      expect(screen.getByText('水')).toBeInTheDocument()
      expect(screen.getByText('氵')).toBeInTheDocument()
      expect(screen.getByText('standard')).toBeInTheDocument()
      expect(screen.getByText('sanzui')).toBeInTheDocument()
    })

    it('renders stroke count when present', () => {
      const forms = [createForm({ strokeCount: 3 })]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      expect(screen.getByText('3画')).toBeInTheDocument()
    })

    it('renders usage notes when present', () => {
      const forms = [createForm({ usageNotes: 'Used on left side' })]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      expect(screen.getByText('Used on left side')).toBeInTheDocument()
    })

    it('renders add button', () => {
      render(ComponentDetailForms, {
        props: {
          forms: [],
          componentId: 1
        }
      })

      expect(
        screen.getByRole('button', { name: /add form/i })
      ).toBeInTheDocument()
    })
  })

  describe('add form dialog', () => {
    it('opens add dialog when clicking add button', async () => {
      const user = userEvent.setup()

      render(ComponentDetailForms, {
        props: {
          forms: [],
          componentId: 1
        }
      })

      await user.click(screen.getByRole('button', { name: /add form/i }))

      expect(screen.getByText('Add Form Variant')).toBeInTheDocument()
      expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
    })

    it('emits add event on form submission', async () => {
      const user = userEvent.setup()

      const renderResult = render(ComponentDetailForms, {
        props: {
          forms: [],
          componentId: 1
        }
      })

      await user.click(screen.getByRole('button', { name: /add form/i }))
      await user.type(screen.getByLabelText(/character/i), '氵')
      await user.type(screen.getByLabelText(/form name/i), 'sanzui')
      await user.type(screen.getByLabelText(/stroke count/i), '3')
      await user.click(screen.getByRole('button', { name: /^add$/i }))

      expect(renderResult.emitted()['add']).toBeTruthy()
      const addEvent = renderResult.emitted()['add']?.[0] as [unknown]
      expect(addEvent[0]).toEqual({
        formCharacter: '氵',
        formName: 'sanzui',
        strokeCount: 3,
        usageNotes: null
      })
    })
  })

  describe('edit form dialog', () => {
    it('opens edit dialog when clicking edit button', async () => {
      const user = userEvent.setup()
      const forms = [createForm()]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(screen.getByText('Edit Form Variant')).toBeInTheDocument()
    })

    it('emits update event on form submission', async () => {
      const user = userEvent.setup()
      const forms = [createForm({ id: 1, formName: 'old name' })]

      const renderResult = render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      const nameInput = screen.getByLabelText(/form name/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'new name')
      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(renderResult.emitted()['update']).toBeTruthy()
    })
  })

  describe('delete form', () => {
    it('hides delete button when destructive mode disabled', () => {
      const forms = [createForm()]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1,
          isDestructiveMode: false
        }
      })

      // Delete button should not be visible
      expect(
        screen.queryByRole('button', { name: '✕' })
      ).not.toBeInTheDocument()
    })

    it('shows delete button when destructive mode enabled', () => {
      const forms = [createForm()]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1,
          isDestructiveMode: true
        }
      })

      // Delete button should be visible
      expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
    })

    it('opens delete confirmation dialog', async () => {
      const user = userEvent.setup()
      const forms = [createForm()]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1,
          isDestructiveMode: true
        }
      })

      await user.click(screen.getByRole('button', { name: '✕' }))

      // Check for the dialog title specifically
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('emits remove event on delete confirmation', async () => {
      const user = userEvent.setup()
      const forms = [createForm({ id: 42 })]

      const renderResult = render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1,
          isDestructiveMode: true
        }
      })

      await user.click(screen.getByRole('button', { name: '✕' }))

      // Find the delete button in the confirm dialog (it will be in the dialog actions)
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
      // The second delete button is in the dialog (first is ✕)
      await user.click(deleteButtons[deleteButtons.length - 1]!)

      expect(renderResult.emitted()['remove']).toBeTruthy()
      expect(renderResult.emitted()['remove']?.[0]).toEqual([42])
    })
  })

  describe('reordering', () => {
    it('renders up/down buttons for each form', () => {
      const forms = [createForm({ id: 1 }), createForm({ id: 2 })]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      // Should have 2 up buttons and 2 down buttons
      expect(screen.getAllByRole('button', { name: '↑' })).toHaveLength(2)
      expect(screen.getAllByRole('button', { name: '↓' })).toHaveLength(2)
    })

    it('disables up button for first item', () => {
      const forms = [createForm({ id: 1 })]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      expect(screen.getByRole('button', { name: '↑' })).toBeDisabled()
    })

    it('disables down button for last item', () => {
      const forms = [createForm({ id: 1 })]

      render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      expect(screen.getByRole('button', { name: '↓' })).toBeDisabled()
    })

    it('emits reorder event when moving up', async () => {
      const user = userEvent.setup()
      const forms = [createForm({ id: 1 }), createForm({ id: 2 })]

      const renderResult = render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      // Click the second item's up button
      const upButtons = screen.getAllByRole('button', { name: '↑' })
      await user.click(upButtons[1]!)

      expect(renderResult.emitted()['reorder']).toBeTruthy()
      expect(renderResult.emitted()['reorder']?.[0]).toEqual([[2, 1]])
    })

    it('emits reorder event when moving down', async () => {
      const user = userEvent.setup()
      const forms = [createForm({ id: 1 }), createForm({ id: 2 })]

      const renderResult = render(ComponentDetailForms, {
        props: {
          forms,
          componentId: 1
        }
      })

      // Click the first item's down button
      const downButtons = screen.getAllByRole('button', { name: '↓' })
      await user.click(downButtons[0]!)

      expect(renderResult.emitted()['reorder']).toBeTruthy()
      expect(renderResult.emitted()['reorder']?.[0]).toEqual([[2, 1]])
    })
  })
})
