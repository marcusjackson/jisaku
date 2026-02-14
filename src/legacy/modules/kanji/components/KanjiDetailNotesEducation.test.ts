/**
 * Tests for KanjiDetailNotesEducation component
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailNotesEducation from './KanjiDetailNotesEducation.vue'

describe('KanjiDetailNotesEducation', () => {
  it('renders placeholder when notes is null', () => {
    renderWithProviders(KanjiDetailNotesEducation, {
      props: { notes: null }
    })

    expect(
      screen.getByText(/add education & mnemonics notes/i)
    ).toBeInTheDocument()
  })

  it('renders notes content when provided', () => {
    renderWithProviders(KanjiDetailNotesEducation, {
      props: { notes: 'Teaching this kanji in school.' }
    })

    expect(
      screen.getByText('Teaching this kanji in school.')
    ).toBeInTheDocument()
  })

  it('emits update event when edited', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    renderWithProviders(KanjiDetailNotesEducation, {
      props: { notes: null, onUpdate }
    })

    // Click to edit
    await user.click(screen.getByRole('button'))

    // Type new notes
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Education notes')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('Education notes')
    })
  })
})
