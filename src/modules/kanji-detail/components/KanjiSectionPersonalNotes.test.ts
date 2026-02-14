/**
 * Tests for KanjiSectionPersonalNotes component.
 *
 * TDD tests for personal notes section.
 */

import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionPersonalNotes from './KanjiSectionPersonalNotes.vue'

describe('KanjiSectionPersonalNotes', () => {
  describe('section rendering', () => {
    it('renders with correct title', () => {
      render(KanjiSectionPersonalNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('Personal Notes')).toBeInTheDocument()
    })

    it('renders character count in header', () => {
      render(KanjiSectionPersonalNotes, {
        props: { notes: 'My notes' }
      })

      // 8 characters in "My notes"
      expect(screen.getByText('8')).toBeInTheDocument()
    })

    it('renders zero character count for empty notes', () => {
      render(KanjiSectionPersonalNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('has correct test ID', () => {
      render(KanjiSectionPersonalNotes, {
        props: { notes: null }
      })

      expect(
        screen.getByTestId('kanji-detail-personal-notes')
      ).toBeInTheDocument()
    })
  })

  describe('collapsible behavior', () => {
    it('defaults to collapsed when notes are empty', () => {
      render(KanjiSectionPersonalNotes, {
        props: { notes: null }
      })

      const section = screen.getByTestId('kanji-detail-personal-notes')
      expect(section).toHaveAttribute('data-state', 'closed')
    })

    it('defaults to expanded when notes have content', () => {
      render(KanjiSectionPersonalNotes, {
        props: { notes: 'Some content' }
      })

      expect(screen.getByTestId('notes-display')).toBeInTheDocument()
    })
  })

  describe('save event emission', () => {
    it('emits save event when textarea saves', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(KanjiSectionPersonalNotes, {
        props: { notes: 'Original', onSave }
      })

      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onSave).toHaveBeenCalledWith('Updated content')
    })
  })

  describe('placeholder text', () => {
    it('shows appropriate placeholder text', async () => {
      const user = userEvent.setup()
      render(KanjiSectionPersonalNotes, {
        props: { notes: null }
      })

      await user.click(screen.getByText('Personal Notes'))
      await nextTick()

      const display = screen.getByTestId('notes-display')
      expect(display).toHaveTextContent(/personal observations/i)
    })
  })
})
