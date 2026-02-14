/**
 * Tests for KanjiDetailNotesTextarea component.
 *
 * TDD tests for inline textarea with display/edit modes.
 */

import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailNotesTextarea from './KanjiDetailNotesTextarea.vue'

describe('KanjiDetailNotesTextarea', () => {
  describe('display mode', () => {
    it('renders content when provided', () => {
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Some notes content' }
      })

      expect(screen.getByText('Some notes content')).toBeInTheDocument()
    })

    it('renders placeholder when content is empty', () => {
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: null, placeholder: 'Click to add notes' }
      })

      expect(screen.getByText('Click to add notes')).toBeInTheDocument()
    })

    it('renders default placeholder when none provided', () => {
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: null }
      })

      expect(screen.getByText('No notes')).toBeInTheDocument()
    })

    it('shows display area as clickable', () => {
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Content' }
      })

      const display = screen.getByTestId('notes-display')
      expect(display).toBeInTheDocument()
    })

    it('enters edit mode when clicked', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Content' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('shows textarea with current content', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Original content' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue('Original content')
    })

    it('shows Save and Cancel buttons', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Content' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument()
    })

    it('supports multi-line input', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: '' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Line 1{enter}Line 2')

      expect(textarea).toHaveValue('Line 1\nLine 2')
    })

    it('preserves whitespace and formatting', async () => {
      const contentWithWhitespace = '  Indented text\n\nDouble spaced'
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: contentWithWhitespace }
      })

      const user = userEvent.setup()
      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      expect(textarea).toHaveValue(contentWithWhitespace)
    })
  })

  describe('save behavior', () => {
    it('emits save event with current value on Save click', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Original', onSave: onSave }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onSave).toHaveBeenCalledWith('Updated content')
    })

    it('exits edit mode after save', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Content' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      await user.click(screen.getByRole('button', { name: /save/i }))
      await nextTick()

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByTestId('notes-display')).toBeInTheDocument()
    })

    it('emits null when saving empty content', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Has content', onSave: onSave }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onSave).toHaveBeenCalledWith(null)
    })
  })

  describe('cancel behavior', () => {
    it('reverts to original value on Cancel click', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Original value' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Changed value')

      await user.click(screen.getByRole('button', { name: /cancel/i }))
      await nextTick()

      // Should show original value in display mode
      expect(screen.getByText('Original value')).toBeInTheDocument()
    })

    it('exits edit mode after cancel', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Content' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      await user.click(screen.getByRole('button', { name: /cancel/i }))
      await nextTick()

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('cancels edit on Escape key press', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Original' }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, ' modified')
      await user.keyboard('{Escape}')
      await nextTick()

      // Should exit edit mode and show original
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
      expect(screen.getByText('Original')).toBeInTheDocument()
    })
  })

  describe('character count', () => {
    it('exposes character count for content', async () => {
      const onCharCount = vi.fn()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Hello', 'onUpdate:charCount': onCharCount }
      })

      // Initial character count should be emitted
      await waitFor(() => {
        expect(onCharCount).toHaveBeenCalledWith(5)
      })
    })

    it('exposes 0 for null content', async () => {
      const onCharCount = vi.fn()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: null, 'onUpdate:charCount': onCharCount }
      })

      await waitFor(() => {
        expect(onCharCount).toHaveBeenCalledWith(0)
      })
    })

    it('updates character count as user types', async () => {
      const user = userEvent.setup()
      const onCharCount = vi.fn()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Hi', 'onUpdate:charCount': onCharCount }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.type(textarea, '!')

      await waitFor(() => {
        expect(onCharCount).toHaveBeenCalledWith(3)
      })
    })
  })

  describe('disabled state', () => {
    it('does not enter edit mode when disabled', async () => {
      const user = userEvent.setup()
      render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Content', disabled: true }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('shows disabled styling', () => {
      const { container } = render(KanjiDetailNotesTextarea, {
        props: { modelValue: 'Content', disabled: true }
      })

      const display = container.querySelector('.notes-textarea-disabled')
      expect(display).toBeInTheDocument()
    })
  })
})
