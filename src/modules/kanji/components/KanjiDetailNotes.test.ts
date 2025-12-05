/**
 * Tests for KanjiDetailNotes component
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailNotes from './KanjiDetailNotes.vue'

describe('KanjiDetailNotes', () => {
  it('renders section title', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesCultural: null,
        notesPersonal: 'Some notes'
      }
    })

    expect(
      screen.getByRole('heading', { level: 2, name: /notes/i })
    ).toBeInTheDocument()
  })

  it('renders personal notes content when provided', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesCultural: null,
        notesPersonal: 'This is a test note about the kanji.'
      }
    })

    expect(
      screen.getByText('This is a test note about the kanji.')
    ).toBeInTheDocument()
    expect(screen.getByText('Personal Notes')).toBeInTheDocument()
  })

  it('renders empty state when all notes are null', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesCultural: null,
        notesPersonal: null
      }
    })

    expect(screen.getByText(/no notes added yet/i)).toBeInTheDocument()
  })

  it('renders etymology notes with category title', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: 'Historical origins of this character.',
        notesCultural: null,
        notesPersonal: null
      }
    })

    expect(screen.getByText('Etymology')).toBeInTheDocument()
    expect(
      screen.getByText('Historical origins of this character.')
    ).toBeInTheDocument()
  })

  it('renders cultural notes with category title', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesCultural: 'Cultural significance in Japan.',
        notesPersonal: null
      }
    })

    expect(screen.getByText('Cultural Context')).toBeInTheDocument()
    expect(
      screen.getByText('Cultural significance in Japan.')
    ).toBeInTheDocument()
  })

  it('renders multiple note categories', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: 'Historical origin.',
        notesCultural: 'Cultural usage.',
        notesPersonal: 'My personal mnemonic.'
      }
    })

    expect(screen.getByText('Etymology')).toBeInTheDocument()
    expect(screen.getByText('Cultural Context')).toBeInTheDocument()
    expect(screen.getByText('Personal Notes')).toBeInTheDocument()
    expect(screen.getByText('Historical origin.')).toBeInTheDocument()
    expect(screen.getByText('Cultural usage.')).toBeInTheDocument()
    expect(screen.getByText('My personal mnemonic.')).toBeInTheDocument()
  })

  it('preserves special characters in notes', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesCultural: null,
        notesPersonal: 'Reading: にほん (nihon) - Japan'
      }
    })

    expect(screen.getByText(/にほん/)).toBeInTheDocument()
  })
})
