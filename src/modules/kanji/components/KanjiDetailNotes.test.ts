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
        notesSemantic: null,
        notesEducationMnemonics: null,
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
        notesSemantic: null,
        notesEducationMnemonics: null,
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
        notesSemantic: null,
        notesEducationMnemonics: null,
        notesPersonal: null
      }
    })

    expect(screen.getByText(/no notes added yet/i)).toBeInTheDocument()
  })

  it('renders etymology notes with category title', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: 'Historical origins of this character.',
        notesSemantic: null,
        notesEducationMnemonics: null,
        notesPersonal: null
      }
    })

    expect(screen.getByText('Etymology')).toBeInTheDocument()
    expect(
      screen.getByText('Historical origins of this character.')
    ).toBeInTheDocument()
  })

  it('renders semantic notes with category title', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesSemantic: 'Semantic significance.',
        notesEducationMnemonics: null,
        notesPersonal: null
      }
    })

    expect(screen.getByText('Semantic Analysis')).toBeInTheDocument()
    expect(screen.getByText('Semantic significance.')).toBeInTheDocument()
  })

  it('renders multiple note categories', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: 'Historical origin.',
        notesSemantic: 'Semantic usage.',
        notesEducationMnemonics: null,
        notesPersonal: 'My personal mnemonic.'
      }
    })

    expect(screen.getByText('Etymology')).toBeInTheDocument()
    expect(screen.getByText('Semantic Analysis')).toBeInTheDocument()
    expect(screen.getByText('Personal Notes')).toBeInTheDocument()
    expect(screen.getByText('Historical origin.')).toBeInTheDocument()
    expect(screen.getByText('Semantic usage.')).toBeInTheDocument()
    expect(screen.getByText('My personal mnemonic.')).toBeInTheDocument()
  })

  it('preserves special characters in notes', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesSemantic: null,
        notesEducationMnemonics: null,
        notesPersonal: 'Reading: にほん (nihon) - Japan'
      }
    })

    expect(screen.getByText(/にほん/)).toBeInTheDocument()
  })

  it('renders education mnemonics with category title', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: null,
        notesSemantic: null,
        notesEducationMnemonics: 'Taught in grade 1 with mnemonic imagery.',
        notesPersonal: null
      }
    })

    expect(screen.getByText('Education & Mnemonics')).toBeInTheDocument()
    expect(
      screen.getByText('Taught in grade 1 with mnemonic imagery.')
    ).toBeInTheDocument()
  })

  it('renders all four note categories', () => {
    render(KanjiDetailNotes, {
      props: {
        notesEtymology: 'Historical origin.',
        notesSemantic: 'Semantic usage.',
        notesEducationMnemonics: 'Teaching method.',
        notesPersonal: 'My personal mnemonic.'
      }
    })

    expect(screen.getByText('Etymology')).toBeInTheDocument()
    expect(screen.getByText('Semantic Analysis')).toBeInTheDocument()
    expect(screen.getByText('Education & Mnemonics')).toBeInTheDocument()
    expect(screen.getByText('Personal Notes')).toBeInTheDocument()
    expect(screen.getByText('Historical origin.')).toBeInTheDocument()
    expect(screen.getByText('Semantic usage.')).toBeInTheDocument()
    expect(screen.getByText('Teaching method.')).toBeInTheDocument()
    expect(screen.getByText('My personal mnemonic.')).toBeInTheDocument()
  })
})
