/**
 * Tests for KanjiDetailMeaningsList component.
 */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailMeaningsList from './KanjiDetailMeaningsList.vue'

import type { EditMeaning } from '../kanji-detail-types'

function mockMeaning(overrides: Partial<EditMeaning> = {}): EditMeaning {
  return {
    additionalInfo: '',
    id: 1,
    meaningText: 'bright',
    ...overrides
  }
}

describe('KanjiDetailMeaningsList', () => {
  const defaultProps = {
    meanings: [mockMeaning()]
  }

  it('renders list title', () => {
    render(KanjiDetailMeaningsList, { props: defaultProps })
    expect(screen.getByText('Meanings')).toBeInTheDocument()
  })

  it('renders empty state when no meanings', () => {
    render(KanjiDetailMeaningsList, {
      props: { meanings: [] }
    })
    expect(screen.getByText('No meanings')).toBeInTheDocument()
  })

  it('renders meaning items', () => {
    render(KanjiDetailMeaningsList, { props: defaultProps })
    expect(screen.getByDisplayValue('bright')).toBeInTheDocument()
  })

  it('emits add event when Add button clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailMeaningsList, { props: defaultProps })

    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(emitted()['add']).toBeTruthy()
  })

  it('emits move event when reorder buttons clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(KanjiDetailMeaningsList, {
      props: {
        meanings: [
          mockMeaning({ id: 1 }),
          mockMeaning({ id: 2, meaningText: 'light' })
        ]
      }
    })

    await user.click(screen.getAllByRole('button', { name: 'Move down' })[0]!)

    expect(emitted()['move']).toBeTruthy()
  })
})
