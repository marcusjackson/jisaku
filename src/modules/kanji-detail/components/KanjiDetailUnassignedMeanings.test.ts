/**
 * Tests for KanjiDetailUnassignedMeanings component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailUnassignedMeanings from './KanjiDetailUnassignedMeanings.vue'

import type { EditMeaning } from '../kanji-detail-types'

function mockMeaning(overrides: Partial<EditMeaning> = {}): EditMeaning {
  return {
    additionalInfo: '',
    id: 1,
    meaningText: 'bright',
    ...overrides
  }
}

describe('KanjiDetailUnassignedMeanings', () => {
  const defaultProps = {
    meanings: [] as EditMeaning[]
  }

  describe('Empty state', () => {
    it('does not render notice when no meanings', () => {
      render(KanjiDetailUnassignedMeanings, {
        props: defaultProps
      })

      expect(screen.queryByText(/unassigned meanings/i)).not.toBeInTheDocument()
    })
  })

  describe('Displaying unassigned meanings', () => {
    it('renders notice when meanings exist', () => {
      render(KanjiDetailUnassignedMeanings, {
        props: {
          meanings: [mockMeaning()]
        }
      })

      expect(screen.getByText(/unassigned meanings/i)).toBeInTheDocument()
    })

    it('renders single meaning', () => {
      render(KanjiDetailUnassignedMeanings, {
        props: {
          meanings: [mockMeaning({ meaningText: 'bright' })]
        }
      })

      expect(screen.getByText('bright')).toBeInTheDocument()
    })

    it('renders multiple meanings', () => {
      render(KanjiDetailUnassignedMeanings, {
        props: {
          meanings: [
            mockMeaning({ id: 1, meaningText: 'bright' }),
            mockMeaning({ id: 2, meaningText: 'light' }),
            mockMeaning({ id: 3, meaningText: 'clear' })
          ]
        }
      })

      expect(screen.getByText('bright')).toBeInTheDocument()
      expect(screen.getByText('light')).toBeInTheDocument()
      expect(screen.getByText('clear')).toBeInTheDocument()
    })

    it('renders meanings in ordered list', () => {
      const { container } = render(KanjiDetailUnassignedMeanings, {
        props: {
          meanings: [
            mockMeaning({ id: 1, meaningText: 'bright' }),
            mockMeaning({ id: 2, meaningText: 'light' })
          ]
        }
      })

      const list = container.querySelector('ol')
      expect(list).toBeInTheDocument()
      expect(list?.querySelectorAll('li')).toHaveLength(2)
    })
  })
})
