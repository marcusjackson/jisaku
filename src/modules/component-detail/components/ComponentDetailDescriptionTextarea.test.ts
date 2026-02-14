/**
 * Tests for ComponentDetailDescriptionTextarea component.
 *
 * TDD tests for inline textarea with save-on-blur behavior.
 */

import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailDescriptionTextarea from './ComponentDetailDescriptionTextarea.vue'

describe('ComponentDetailDescriptionTextarea', () => {
  describe('display mode', () => {
    it('renders content when provided', () => {
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Some description content' }
      })

      expect(screen.getByText('Some description content')).toBeInTheDocument()
    })

    it('renders placeholder when content is null', () => {
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: null, placeholder: 'Click to add description' }
      })

      expect(screen.getByText('Click to add description')).toBeInTheDocument()
    })

    it('renders default placeholder when none provided', () => {
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: null }
      })

      expect(screen.getByText('No description')).toBeInTheDocument()
    })

    it('shows display area with correct test id', () => {
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Content' }
      })

      const display = screen.getByTestId('description-textarea')
      expect(display).toBeInTheDocument()
    })

    it('enters edit mode when clicked', async () => {
      const user = userEvent.setup()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Content' }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('shows textarea with current content', async () => {
      const user = userEvent.setup()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Original content' }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Original content')
    })

    it('supports multi-line input', async () => {
      const user = userEvent.setup()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: '' }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Line 1{enter}Line 2')

      expect(textarea).toHaveValue('Line 1\nLine 2')
    })
  })

  describe('save-on-blur behavior', () => {
    it('emits save event when textarea loses focus', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Original', onSave }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      // Trigger blur by tabbing away
      await user.tab()

      expect(onSave).toHaveBeenCalledWith('Updated content')
    })

    it('exits edit mode after blur', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Content', onSave }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      expect(screen.getByRole('textbox')).toBeInTheDocument()

      // Blur the textarea using fireEvent
      const textarea = screen.getByRole('textbox')
      await fireEvent.blur(textarea)

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('converts empty string to null on save', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Some content', onSave }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.tab()

      expect(onSave).toHaveBeenCalledWith(null)
    })

    it('converts whitespace-only to null on save', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Content', onSave }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, '   ')
      await user.tab()

      expect(onSave).toHaveBeenCalledWith(null)
    })
  })

  describe('keyboard navigation', () => {
    it('exits edit mode on Escape without saving', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(ComponentDetailDescriptionTextarea, {
        props: { modelValue: 'Original', onSave }
      })

      await user.click(screen.getByTestId('description-textarea'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Changed')
      await user.keyboard('{Escape}')

      expect(onSave).not.toHaveBeenCalled()
      await waitFor(() => {
        expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      })
    })
  })
})
