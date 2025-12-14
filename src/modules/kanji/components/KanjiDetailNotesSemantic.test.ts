/**
 * Tests for KanjiDetailNotesSemantic component
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailNotesSemantic from './KanjiDetailNotesSemantic.vue'

describe('KanjiDetailNotesSemantic', () => {
  it('renders placeholder when notes is null', () => {
    renderWithProviders(KanjiDetailNotesSemantic, {
      props: { notes: null }
    })

    expect(screen.getByText(/add semantic analysis/i)).toBeInTheDocument()
  })

  it('renders notes content when provided', () => {
    renderWithProviders(KanjiDetailNotesSemantic, {
      props: { notes: 'Modern usage patterns.' }
    })

    expect(screen.getByText('Modern usage patterns.')).toBeInTheDocument()
  })

  it('emits update event when edited', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()

    renderWithProviders(KanjiDetailNotesSemantic, {
      props: { notes: null, onUpdate }
    })

    // Click to edit
    await user.click(screen.getByRole('button'))

    // Type new notes
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Semantic notes')

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('Semantic notes')
    })
  })
})
