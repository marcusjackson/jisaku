/**
 * Tests for KanjiDetailNotesPersonal component
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailNotesPersonal from './KanjiDetailNotesPersonal.vue'

describe('KanjiDetailNotesPersonal', () => {
  it('renders placeholder when notes is null', () => {
    renderWithProviders(KanjiDetailNotesPersonal, {
      props: { notes: null }
    })

    expect(screen.getByText(/add personal notes/i)).toBeInTheDocument()
  })

  it('renders notes content when provided', () => {
    renderWithProviders(KanjiDetailNotesPersonal, {
      props: { notes: 'My personal observations.' }
    })

    expect(screen.getByText('My personal observations.')).toBeInTheDocument()
  })

  it('emits update event when edited', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    renderWithProviders(KanjiDetailNotesPersonal, {
      props: { notes: null, onUpdate }
    })

    // Click to edit
    await user.click(screen.getByRole('button'))

    // Type new notes
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Personal notes')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('Personal notes')
    })
  })
})
