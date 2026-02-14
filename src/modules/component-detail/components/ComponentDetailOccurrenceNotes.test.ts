import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentDetailOccurrenceNotes from './ComponentDetailOccurrenceNotes.vue'

describe('ComponentDetailOccurrenceNotes', () => {
  describe('Display Logic', () => {
    it('renders nothing when notes is null', () => {
      const { container } = render(ComponentDetailOccurrenceNotes, {
        props: { notes: null }
      })
      expect(container.querySelector('.occurrence-notes')).toBeNull()
    })

    it('displays full text for short notes without toggle button', () => {
      const shortNotes = 'Short analysis notes'
      render(ComponentDetailOccurrenceNotes, {
        props: { notes: shortNotes }
      })

      expect(screen.getByText(shortNotes)).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('displays truncated text with ellipsis for long notes', () => {
      const longNotes = 'a'.repeat(150)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes, maxLength: 100 }
      })

      const noteText = screen.getByText(/^a+\.\.\.$/i)
      expect(noteText.textContent).toHaveLength(103) // 100 chars + "..."
      expect(
        screen.getByRole('button', { name: /show more/i })
      ).toBeInTheDocument()
    })

    it('uses custom maxLength prop', () => {
      const notes = 'a'.repeat(80)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes, maxLength: 50 }
      })

      const noteText = screen.getByText(/^a+\.\.\.$/i)
      expect(noteText.textContent).toHaveLength(53) // 50 chars + "..."
    })

    it('defaults to 100 character maxLength when not specified', () => {
      const notes = 'a'.repeat(150)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes }
      })

      const noteText = screen.getByText(/^a+\.\.\.$/i)
      expect(noteText.textContent).toHaveLength(103) // 100 chars + "..."
    })
  })

  describe('Toggle Interaction', () => {
    it('expands to show full text when "Show more" is clicked', async () => {
      const user = userEvent.setup()
      const longNotes = 'a'.repeat(150)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes, maxLength: 100 }
      })

      const showMoreButton = screen.getByRole('button', { name: /show more/i })
      await user.click(showMoreButton)

      const noteText = screen.getByText(/^a+$/i)
      expect(noteText.textContent).toHaveLength(150)
      expect(noteText.textContent).not.toContain('...')
      expect(
        screen.getByRole('button', { name: /show less/i })
      ).toBeInTheDocument()
    })

    it('collapses to show truncated text when "Show less" is clicked', async () => {
      const user = userEvent.setup()
      const longNotes = 'a'.repeat(150)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes, maxLength: 100 }
      })

      // Expand first
      const showMoreButton = screen.getByRole('button', { name: /show more/i })
      await user.click(showMoreButton)

      // Then collapse
      const showLessButton = screen.getByRole('button', { name: /show less/i })
      await user.click(showLessButton)

      const noteText = screen.getByText(/^a+\.\.\.$/i)
      expect(noteText.textContent).toHaveLength(103)
      expect(
        screen.getByRole('button', { name: /show more/i })
      ).toBeInTheDocument()
    })

    it('toggles multiple times correctly', async () => {
      const user = userEvent.setup()
      const longNotes = 'a'.repeat(150)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes, maxLength: 100 }
      })

      // Expand
      await user.click(screen.getByRole('button', { name: /show more/i }))
      expect(screen.getByText(/^a+$/i).textContent).toHaveLength(150)

      // Collapse
      await user.click(screen.getByRole('button', { name: /show less/i }))
      expect(screen.getByText(/^a+\.\.\.$/i).textContent).toHaveLength(103)

      // Expand again
      await user.click(screen.getByRole('button', { name: /show more/i }))
      expect(screen.getByText(/^a+$/i).textContent).toHaveLength(150)
    })
  })

  describe('Edge Cases', () => {
    it('handles notes exactly at maxLength threshold (no truncation)', () => {
      const notes = 'a'.repeat(100)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes, maxLength: 100 }
      })

      expect(screen.getByText(notes)).toBeInTheDocument()
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('truncates notes at maxLength + 1', () => {
      const notes = 'a'.repeat(101)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes, maxLength: 100 }
      })

      const noteText = screen.getByText(/^a+\.\.\.$/i)
      expect(noteText.textContent).toHaveLength(103)
      expect(
        screen.getByRole('button', { name: /show more/i })
      ).toBeInTheDocument()
    })

    it('preserves whitespace and newlines in notes', () => {
      const notes = 'Line 1\nLine 2\n\nLine 3 with  spaces'
      render(ComponentDetailOccurrenceNotes, {
        props: { notes }
      })

      const paragraph = screen.getByText((_, element) => {
        return element?.tagName === 'P' && element.textContent === notes
      })
      expect(paragraph).toBeInTheDocument()
    })

    it('handles empty string as null', () => {
      const { container } = render(ComponentDetailOccurrenceNotes, {
        props: { notes: '' }
      })
      expect(container.querySelector('.occurrence-notes')).toBeNull()
    })
  })

  describe('Accessibility', () => {
    it('has accessible button labels', () => {
      const longNotes = 'a'.repeat(150)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes }
      })

      const button = screen.getByRole('button')
      expect(button).toHaveAccessibleName(/show more/i)
    })

    it('button label changes correctly after toggle', async () => {
      const user = userEvent.setup()
      const longNotes = 'a'.repeat(150)
      render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes }
      })

      const button = screen.getByRole('button')
      expect(button).toHaveAccessibleName(/show more/i)

      await user.click(button)
      expect(button).toHaveAccessibleName(/show less/i)
    })

    it('applies proper semantic structure', () => {
      const notes = 'Analysis notes for component occurrence'
      const { container } = render(ComponentDetailOccurrenceNotes, {
        props: { notes }
      })

      const paragraph = container.querySelector('p')
      expect(paragraph).toBeInTheDocument()
      expect(paragraph).toHaveTextContent(notes)
    })
  })

  describe('CSS Classes', () => {
    it('applies is-expanded class when expanded', async () => {
      const user = userEvent.setup()
      const longNotes = 'a'.repeat(150)
      const { container } = render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes }
      })

      const paragraph = container.querySelector('.occurrence-notes-text')
      expect(paragraph).not.toHaveClass('is-expanded')

      await user.click(screen.getByRole('button', { name: /show more/i }))
      expect(paragraph).toHaveClass('is-expanded')
    })

    it('removes is-expanded class when collapsed', async () => {
      const user = userEvent.setup()
      const longNotes = 'a'.repeat(150)
      const { container } = render(ComponentDetailOccurrenceNotes, {
        props: { notes: longNotes }
      })

      // Expand
      await user.click(screen.getByRole('button', { name: /show more/i }))
      const paragraph = container.querySelector('.occurrence-notes-text')
      expect(paragraph).toHaveClass('is-expanded')

      // Collapse
      await user.click(screen.getByRole('button', { name: /show less/i }))
      expect(paragraph).not.toHaveClass('is-expanded')
    })
  })
})
