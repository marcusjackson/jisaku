/**
 * Tests for ComponentDetailFormItem component.
 *
 * TDD tests for the form item display with edit/delete/reorder controls.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailFormItem from './ComponentDetailFormItem.vue'

import type { ComponentForm } from '@/api/component'

// Factory function for creating test form data
function createTestForm(overrides: Partial<ComponentForm> = {}): ComponentForm {
  return {
    id: 1,
    componentId: 100,
    formCharacter: '氵',
    formName: 'water radical',
    strokeCount: 3,
    usageNotes: 'Used in water-related kanji',
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

describe('ComponentDetailFormItem', () => {
  describe('display', () => {
    it('displays form character prominently', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm({ formCharacter: '氵' }),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByText('氵')).toBeInTheDocument()
    })

    it('displays form name', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm({ formName: 'water radical' }),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByText('water radical')).toBeInTheDocument()
    })

    it('displays stroke count with 画 suffix', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm({ strokeCount: 3 }),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByText('3画')).toBeInTheDocument()
    })

    it('displays usage notes', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm({ usageNotes: 'Used in water-related kanji' }),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(
        screen.getByText('Used in water-related kanji')
      ).toBeInTheDocument()
    })

    it('handles null optional fields gracefully', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm({
            formName: null,
            strokeCount: null,
            usageNotes: null
          }),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      // Only character should be visible
      expect(screen.getByText('氵')).toBeInTheDocument()
      // No stroke count suffix should be rendered
      expect(screen.queryByText(/画/)).not.toBeInTheDocument()
    })

    it('has correct test id', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm({ id: 42 }),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByTestId('form-item-42')).toBeInTheDocument()
    })
  })

  describe('reorder buttons', () => {
    it('shows up and down arrow buttons', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 1,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(
        screen.getByRole('button', { name: /move up/i })
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /move down/i })
      ).toBeInTheDocument()
    })

    it('disables up arrow when index is 0', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move up/i })).toBeDisabled()
    })

    it('enables up arrow when index > 0', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 1,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move up/i })).toBeEnabled()
    })

    it('disables down arrow when index equals total - 1', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 2,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move down/i })).toBeDisabled()
    })

    it('enables down arrow when index < total - 1', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /move down/i })).toBeEnabled()
    })

    it('emits move-up when up arrow is clicked', async () => {
      const user = userEvent.setup()
      const onMoveUp = vi.fn()
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 1,
          total: 3,
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
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
          isDestructiveMode: false,
          'onMove-down': onMoveDown
        }
      })

      await user.click(screen.getByRole('button', { name: /move down/i }))

      expect(onMoveDown).toHaveBeenCalled()
    })
  })

  describe('edit button', () => {
    it('shows edit button', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
          isDestructiveMode: false
        }
      })

      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
    })

    it('emits edit when edit button is clicked', async () => {
      const user = userEvent.setup()
      const onEdit = vi.fn()
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
          isDestructiveMode: false,
          onEdit
        }
      })

      await user.click(screen.getByRole('button', { name: /edit/i }))

      expect(onEdit).toHaveBeenCalled()
    })
  })

  describe('delete button', () => {
    it('shows delete button when destructive mode is enabled', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
          isDestructiveMode: true
        }
      })

      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
    })

    it('hides delete button when destructive mode is disabled', () => {
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
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
      render(ComponentDetailFormItem, {
        props: {
          form: createTestForm(),
          index: 0,
          total: 3,
          isDestructiveMode: true,
          onDelete
        }
      })

      await user.click(screen.getByRole('button', { name: /delete/i }))

      expect(onDelete).toHaveBeenCalled()
    })
  })
})
