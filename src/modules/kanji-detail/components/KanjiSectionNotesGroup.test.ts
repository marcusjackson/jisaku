/**
 * Tests for KanjiSectionNotesGroup
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionNotesGroup from './KanjiSectionNotesGroup.vue'

// Mock child components to simplify testing
vi.mock('./KanjiSectionEtymologyNotes.vue', () => ({
  default: {
    name: 'KanjiSectionEtymologyNotes',
    props: ['notes'],
    emits: ['save'],
    template: `
      <div data-testid="etymology-section">
        <span data-testid="etymology-notes">{{ notes }}</span>
        <button data-testid="etymology-save" @click="$emit('save', 'etymology value')">Save Etymology</button>
      </div>
    `
  }
}))

vi.mock('./KanjiSectionEducationNotes.vue', () => ({
  default: {
    name: 'KanjiSectionEducationNotes',
    props: ['notes'],
    emits: ['save'],
    template: `
      <div data-testid="education-section">
        <span data-testid="education-notes">{{ notes }}</span>
        <button data-testid="education-save" @click="$emit('save', 'education value')">Save Education</button>
      </div>
    `
  }
}))

vi.mock('./KanjiSectionPersonalNotes.vue', () => ({
  default: {
    name: 'KanjiSectionPersonalNotes',
    props: ['notes'],
    emits: ['save'],
    template: `
      <div data-testid="personal-section">
        <span data-testid="personal-notes">{{ notes }}</span>
        <button data-testid="personal-save" @click="$emit('save', 'personal value')">Save Personal</button>
      </div>
    `
  }
}))

describe('KanjiSectionNotesGroup', () => {
  it('renders all three notes sections', () => {
    render(KanjiSectionNotesGroup, {
      props: {
        notesEtymology: 'Etymology content',
        notesEducation: 'Education content',
        notesPersonal: 'Personal content'
      }
    })

    expect(screen.getByTestId('etymology-section')).toBeInTheDocument()
    expect(screen.getByTestId('education-section')).toBeInTheDocument()
    expect(screen.getByTestId('personal-section')).toBeInTheDocument()
  })

  it('passes notes props to child sections', () => {
    render(KanjiSectionNotesGroup, {
      props: {
        notesEtymology: 'Etymology content',
        notesEducation: 'Education content',
        notesPersonal: 'Personal content'
      }
    })

    expect(screen.getByTestId('etymology-notes')).toHaveTextContent(
      'Etymology content'
    )
    expect(screen.getByTestId('education-notes')).toHaveTextContent(
      'Education content'
    )
    expect(screen.getByTestId('personal-notes')).toHaveTextContent(
      'Personal content'
    )
  })

  it('emits save:etymology when etymology section saves', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiSectionNotesGroup, {
      props: {
        notesEtymology: null,
        notesEducation: null,
        notesPersonal: null
      }
    })

    await user.click(screen.getByTestId('etymology-save'))

    expect(emitted()).toHaveProperty('save:etymology')
    expect(emitted()['save:etymology']?.[0]).toEqual(['etymology value'])
  })

  it('emits save:education when education section saves', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiSectionNotesGroup, {
      props: {
        notesEtymology: null,
        notesEducation: null,
        notesPersonal: null
      }
    })

    await user.click(screen.getByTestId('education-save'))

    expect(emitted()).toHaveProperty('save:education')
    expect(emitted()['save:education']?.[0]).toEqual(['education value'])
  })

  it('emits save:personal when personal section saves', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiSectionNotesGroup, {
      props: {
        notesEtymology: null,
        notesEducation: null,
        notesPersonal: null
      }
    })

    await user.click(screen.getByTestId('personal-save'))

    expect(emitted()).toHaveProperty('save:personal')
    expect(emitted()['save:personal']?.[0]).toEqual(['personal value'])
  })

  it('handles null notes values', () => {
    render(KanjiSectionNotesGroup, {
      props: {
        notesEtymology: null,
        notesEducation: null,
        notesPersonal: null
      }
    })

    // Sections should still render even with null values
    expect(screen.getByTestId('etymology-section')).toBeInTheDocument()
    expect(screen.getByTestId('education-section')).toBeInTheDocument()
    expect(screen.getByTestId('personal-section')).toBeInTheDocument()
  })
})
