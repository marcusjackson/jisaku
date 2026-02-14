/**
 * Tests for KanjiDetailNotesEtymology component
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailNotesEtymology from './KanjiDetailNotesEtymology.vue'

describe('KanjiDetailNotesEtymology', () => {
  it('renders placeholder when notes is null', () => {
    renderWithProviders(KanjiDetailNotesEtymology, {
      props: { notes: null }
    })

    expect(screen.getByText(/add etymology notes/i)).toBeInTheDocument()
  })

  it('renders notes content when provided', () => {
    renderWithProviders(KanjiDetailNotesEtymology, {
      props: { notes: 'Historical origins of this kanji.' }
    })

    expect(
      screen.getByText('Historical origins of this kanji.')
    ).toBeInTheDocument()
  })

  it('emits update event when edited', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    renderWithProviders(KanjiDetailNotesEtymology, {
      props: { notes: null, onUpdate }
    })

    // Click to edit
    await user.click(screen.getByRole('button'))

    // Type new notes
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'New etymology notes')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('New etymology notes')
    })
  })

  it('emits null when saving empty notes', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    renderWithProviders(KanjiDetailNotesEtymology, {
      props: { notes: 'Some notes', onUpdate }
    })

    // Click to edit
    await user.click(screen.getByRole('button'))

    // Clear the textarea
    const textarea = screen.getByRole('textbox')
    await user.clear(textarea)

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(null)
    })
  })
})
