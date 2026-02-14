/**
 * Tests for KanjiSectionSemanticNotes component.
 *
 * TDD tests for semantic analysis notes section.
 */

import { nextTick } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionSemanticNotes from './KanjiSectionSemanticNotes.vue'

describe('KanjiSectionSemanticNotes', () => {
  describe('section rendering', () => {
    it('renders with correct title', () => {
      render(KanjiSectionSemanticNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('Semantic Analysis')).toBeInTheDocument()
    })

    it('renders character count in header', () => {
      render(KanjiSectionSemanticNotes, {
        props: { notes: 'Some notes here' }
      })

      // 15 characters in "Some notes here"
      expect(screen.getByText('15')).toBeInTheDocument()
    })

    it('renders zero character count for empty notes', () => {
      render(KanjiSectionSemanticNotes, {
        props: { notes: null }
      })

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('has correct test ID', () => {
      render(KanjiSectionSemanticNotes, {
        props: { notes: null }
      })

      expect(
        screen.getByTestId('kanji-detail-semantic-notes')
      ).toBeInTheDocument()
    })
  })

  describe('collapsible behavior', () => {
    it('defaults to collapsed when notes are empty', () => {
      render(KanjiSectionSemanticNotes, {
        props: { notes: null }
      })

      // When collapsed, content is hidden via CSS but still in DOM (unmount-on-hide=false)
      // The section should be collapsed (not open)
      const section = screen.getByTestId('kanji-detail-semantic-notes')
      expect(section).toHaveAttribute('data-state', 'closed')
    })

    it('defaults to expanded when notes have content', () => {
      render(KanjiSectionSemanticNotes, {
        props: { notes: 'Some content' }
      })

      // The textarea should be visible when there's content
      expect(screen.getByTestId('notes-display')).toBeInTheDocument()
    })

    it('shows textarea after expanding', async () => {
      const user = userEvent.setup()
      render(KanjiSectionSemanticNotes, {
        props: { notes: null }
      })

      // Click to expand
      await user.click(screen.getByText('Semantic Analysis'))
      await nextTick()

      expect(screen.getByTestId('notes-display')).toBeInTheDocument()
    })
  })

  describe('save event emission', () => {
    it('emits save event when textarea saves', async () => {
      const user = userEvent.setup()
      const onSave = vi.fn()
      render(KanjiSectionSemanticNotes, {
        props: { notes: 'Original', onSave }
      })

      // Click to enter edit mode
      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      // Type new content
      const textarea = screen.getByRole('textbox')
      await user.clear(textarea)
      await user.type(textarea, 'Updated content')

      // Save
      await user.click(screen.getByRole('button', { name: /save/i }))

      expect(onSave).toHaveBeenCalledWith('Updated content')
    })
  })

  describe('placeholder text', () => {
    it('shows appropriate placeholder text', async () => {
      const user = userEvent.setup()
      render(KanjiSectionSemanticNotes, {
        props: { notes: null }
      })

      // Expand the section
      await user.click(screen.getByText('Semantic Analysis'))
      await nextTick()

      expect(
        screen.getByText(/document semantic analysis/i)
      ).toBeInTheDocument()
    })
  })

  describe('character count updates', () => {
    it('updates character count as content changes', async () => {
      const user = userEvent.setup()
      render(KanjiSectionSemanticNotes, {
        props: { notes: 'abc' } // 3 characters
      })

      // Initial count should be 3
      expect(screen.getByText('3')).toBeInTheDocument()

      // Enter edit mode
      await user.click(screen.getByTestId('notes-display'))
      await nextTick()

      // Type more content
      const textarea = screen.getByRole('textbox')
      await user.type(textarea, 'def')

      // Count should update to 6
      expect(screen.getByText('6')).toBeInTheDocument()
    })
  })
})
