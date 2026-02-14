/**
 * Tests for KanjiDetailComponentSearch component
 */

import { renderWithProviders as render } from '@test/helpers/render'
import { userEvent } from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailComponentSearch from './KanjiDetailComponentSearch.vue'

import type { Component } from '@/api/component/component-types'

const mockComponents: Component[] = [
  {
    id: 1,
    character: 'δΊΊ',
    shortMeaning: 'person',
    strokeCount: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 2,
    character: 'ζœ¨',
    shortMeaning: 'tree, wood',
    strokeCount: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: ''
  },
  {
    id: 3,
    character: 'ζ°΄',
    shortMeaning: 'water',
    strokeCount: null,
    searchKeywords: null,
    sourceKanjiId: null,
    description: null,
    canBeRadical: false,
    kangxiNumber: null,
    kangxiMeaning: null,
    radicalNameJapanese: null,
    createdAt: '',
    updatedAt: ''
  }
]

describe('KanjiDetailComponentSearch', () => {
  describe('search filtering', () => {
    it('shows results matching character', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'δΊΊ')

      expect(screen.getByText('δΊΊ')).toBeInTheDocument()
      expect(screen.queryByText('ζœ¨')).not.toBeInTheDocument()
    })

    it('shows results matching short meaning', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'water')

      expect(screen.getByText('ζ°΄')).toBeInTheDocument()
      expect(screen.getByText('water')).toBeInTheDocument()
    })

    it('filters case-insensitively', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'TREE')

      expect(screen.getByText('ζœ¨')).toBeInTheDocument()
    })

    it('shows all components when search is empty', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      expect(screen.getByText('δΊΊ')).toBeInTheDocument()
      expect(screen.getByText('ζœ¨')).toBeInTheDocument()
      expect(screen.getByText('ζ°΄')).toBeInTheDocument()
    })

    it('shows no results when no matches', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'xyz')

      expect(screen.queryByText('δΊΊ')).not.toBeInTheDocument()
      expect(screen.queryByText('ζœ¨')).not.toBeInTheDocument()
    })
  })

  describe('create new button', () => {
    it('shows create button when no results found', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'xyz')

      expect(
        screen.getByText('Create New Component: "xyz"')
      ).toBeInTheDocument()
    })

    it('does not show create button when results exist', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'person')

      expect(screen.queryByText(/Create New Component/)).not.toBeInTheDocument()
    })

    it('does not show create button when search is empty', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      expect(screen.queryByText(/Create New Component/)).not.toBeInTheDocument()
    })
  })

  describe('event emission', () => {
    it('emits select event when result clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'δΊΊ')

      const resultButton = screen.getByRole('button', { name: /δΊΊ.*person/ })
      await user.click(resultButton)

      expect(emitted()).toHaveProperty('select')
      expect(emitted()['select']?.[0]).toEqual([1])
    })

    it('emits create event when create button clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'xyz')

      const createButton = screen.getByRole('button', {
        name: 'Create New Component: "xyz"'
      })
      await user.click(createButton)

      expect(emitted()).toHaveProperty('create')
      expect(emitted()['create']?.[0]).toEqual(['xyz'])
    })

    it('clears search term after selection', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'δΊΊ')

      const resultButton = screen.getByRole('button', { name: /δΊΊ.*person/ })
      await user.click(resultButton)

      expect((input as HTMLInputElement).value).toBe('')
    })

    it('clears search term after create', async () => {
      const user = userEvent.setup()
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'xyz')

      const createButton = screen.getByRole('button', {
        name: 'Create New Component: "xyz"'
      })
      await user.click(createButton)

      expect((input as HTMLInputElement).value).toBe('')
    })
  })

  describe('props', () => {
    it('uses custom label', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
          label: 'Find Component'
        }
      })

      expect(screen.getByText('Find Component')).toBeInTheDocument()
    })

    it('uses custom placeholder', () => {
      render(KanjiDetailComponentSearch, {
        props: {
          availableComponents: mockComponents,
          placeholder: 'Type to search...'
        }
      })

      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('placeholder', 'Type to search...')
    })
  })
})
