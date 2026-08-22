/**
 * Tests for KanjiDetailSectionEtymologyNotes component.
 *
 * TDD tests for etymology notes section.
 */

import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailSectionEtymologyNotes from './KanjiDetailSectionEtymologyNotes.vue'

describe('KanjiDetailSectionEtymologyNotes', () => {
  describe('section rendering', () => {
    it('renders with correct title', () => {
      render(KanjiDetailSectionEtymologyNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('Etymology Notes')).toBeInTheDocument()
    })

    it('renders character count in header', () => {
      render(KanjiDetailSectionEtymologyNotes, {
        props: { notes: 'Etymology info' }
      })

      // 14 characters in "Etymology info"
      expect(screen.getByText('14')).toBeInTheDocument()
    })

    it('renders zero character count for empty notes', () => {
      render(KanjiDetailSectionEtymologyNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('has correct test ID', () => {
      render(KanjiDetailSectionEtymologyNotes, {
        props: { notes: null }
      })

      expect(
        screen.getByTestId('kanji-detail-etymology-notes')
      ).toBeInTheDocument()
    })
  })

  describe('collapsible behavior', () => {
    it('defaults to collapsed when notes are empty', () => {
      render(KanjiDetailSectionEtymologyNotes, {
        props: { notes: null }
      })

      const section = screen.getByTestId('kanji-detail-etymology-notes')
      expect(section).toHaveAttribute('data-state', 'closed')
    })

    it('defaults to expanded when notes have content', () => {
      render(KanjiDetailSectionEtymologyNotes, {
        props: { notes: 'Some content' }
      })

      expect(screen.getByTestId('notes-display')).toBeInTheDocument()
    })
  })

  describe('save event emission', () => {
    it('emits save event when textarea saves', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(KanjiDetailSectionEtymologyNotes, {
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
      render(KanjiDetailSectionEtymologyNotes, {
        props: { notes: null }
      })

      await user.click(screen.getByText('Etymology Notes'))
      await nextTick()

      expect(screen.getByText(/document etymology/i)).toBeInTheDocument()
    })
  })
})
