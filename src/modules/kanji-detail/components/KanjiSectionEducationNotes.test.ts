/**
 * Tests for KanjiSectionEducationNotes component.
 *
 * TDD tests for education & mnemonics notes section.
 */

import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionEducationNotes from './KanjiSectionEducationNotes.vue'

describe('KanjiSectionEducationNotes', () => {
  describe('section rendering', () => {
    it('renders with correct title', () => {
      render(KanjiSectionEducationNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('Education & Mnemonics')).toBeInTheDocument()
    })

    it('renders character count in header', () => {
      render(KanjiSectionEducationNotes, {
        props: { notes: 'Study notes' }
      })

      // 11 characters in "Study notes"
      expect(screen.getByText('11')).toBeInTheDocument()
    })

    it('renders zero character count for empty notes', () => {
      render(KanjiSectionEducationNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('has correct test ID', () => {
      render(KanjiSectionEducationNotes, {
        props: { notes: null }
      })

      expect(
        screen.getByTestId('kanji-detail-education-notes')
      ).toBeInTheDocument()
    })
  })

  describe('collapsible behavior', () => {
    it('defaults to collapsed when notes are empty', () => {
      render(KanjiSectionEducationNotes, {
        props: { notes: null }
      })

      const section = screen.getByTestId('kanji-detail-education-notes')
      expect(section).toHaveAttribute('data-state', 'closed')
    })

    it('defaults to expanded when notes have content', () => {
      render(KanjiSectionEducationNotes, {
        props: { notes: 'Some content' }
      })

      expect(screen.getByTestId('notes-display')).toBeInTheDocument()
    })
  })

  describe('save event emission', () => {
    it('emits save event when textarea saves', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(KanjiSectionEducationNotes, {
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
      render(KanjiSectionEducationNotes, {
        props: { notes: null }
      })

      await user.click(screen.getByText('Education & Mnemonics'))
      await nextTick()

      const display = screen.getByTestId('notes-display')
      expect(display).toHaveTextContent(/mnemonics.*learning tips/i)
    })
  })
})
