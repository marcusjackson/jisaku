/**
 * Tests for KanjiDetailComponentOccurrenceEditor
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailComponentOccurrenceEditor from './KanjiDetailComponentOccurrenceEditor.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { PositionType } from '@/api/position/position-types'

const mockOccurrence: ComponentOccurrenceWithDetails = {
  id: 1,
  kanjiId: 1,
  componentId: 2,
  positionTypeId: null,
  componentFormId: null,
  isRadical: false,
  analysisNotes: null,
  displayOrder: 0,
  createdAt: '',
  updatedAt: '',
  component: {
    id: 2,
    character: '山',
    shortMeaning: 'mountain'
  },
  position: null,
  form: null
}

const mockPositionTypes: PositionType[] = [
  {
    id: 1,
    positionName: 'Left',
    nameJapanese: '左',
    nameEnglish: 'Left',
    description: 'Left side',
    displayOrder: 1
  }
]

const mockComponentForms = [
  { id: 1, formCharacter: '山', formName: 'Standard' }
]

describe('KanjiDetailComponentOccurrenceEditor', () => {
  it('renders component character and meaning', () => {
    render(KanjiDetailComponentOccurrenceEditor, {
      props: {
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        componentForms: mockComponentForms,
        destructiveMode: false
      }
    })

    expect(screen.getByText('山')).toBeInTheDocument()
    expect(screen.getByText('mountain')).toBeInTheDocument()
  })

  it('renders position select', () => {
    render(KanjiDetailComponentOccurrenceEditor, {
      props: {
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        componentForms: mockComponentForms,
        destructiveMode: false
      }
    })

    expect(screen.getByLabelText('Position')).toBeInTheDocument()
  })

  it('renders form select', () => {
    render(KanjiDetailComponentOccurrenceEditor, {
      props: {
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        componentForms: mockComponentForms,
        destructiveMode: false
      }
    })

    expect(screen.getByLabelText('Form')).toBeInTheDocument()
  })

  it('renders radical switch', () => {
    render(KanjiDetailComponentOccurrenceEditor, {
      props: {
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        componentForms: mockComponentForms,
        destructiveMode: false
      }
    })

    expect(screen.getByText('Is Radical')).toBeInTheDocument()
  })

  it('does not render unlink button when destructiveMode is false', () => {
    render(KanjiDetailComponentOccurrenceEditor, {
      props: {
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        componentForms: mockComponentForms,
        destructiveMode: false
      }
    })

    expect(screen.queryByText('Unlink')).not.toBeInTheDocument()
  })

  it('renders unlink button when destructiveMode is true', () => {
    render(KanjiDetailComponentOccurrenceEditor, {
      props: {
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        componentForms: mockComponentForms,
        destructiveMode: true
      }
    })

    expect(screen.getByText('Unlink')).toBeInTheDocument()
  })

  it('emits unlink when unlink button clicked', async () => {
    const { emitted } = render(KanjiDetailComponentOccurrenceEditor, {
      props: {
        occurrence: mockOccurrence,
        positionTypes: mockPositionTypes,
        componentForms: mockComponentForms,
        destructiveMode: true
      }
    })

    const user = userEvent.setup()
    await user.click(screen.getByText('Unlink'))

    expect(emitted()['unlink']).toBeTruthy()
  })
})
