import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailVocabularySearch from './KanjiDetailVocabularySearch.vue'

import type { VocabularyListItem } from '../kanji-detail-types'

const mockVocabulary: VocabularyListItem[] = [
  {
    linkId: 1,
    vocabularyId: 1,
    word: '水',
    kana: 'みず',
    shortMeaning: 'water'
  },
  {
    linkId: 2,
    vocabularyId: 2,
    word: '火',
    kana: 'ひ',
    shortMeaning: 'fire'
  },
  {
    linkId: 3,
    vocabularyId: 3,
    word: '火曜日',
    kana: 'かようび',
    shortMeaning: 'Tuesday'
  }
]

describe('KanjiDetailVocabularySearch', () => {
  describe('search filtering', () => {
    it('shows results matching word', async () => {
      const user = userEvent.setup()
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '火')

      expect(
        screen.getByTestId('vocabulary-search-results')
      ).toBeInTheDocument()
      expect(screen.getByText('火')).toBeInTheDocument()
      expect(screen.getByText('火曜日')).toBeInTheDocument()
    })

    it('shows results matching kana', async () => {
      const user = userEvent.setup()
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'みず')

      expect(screen.getByText('水')).toBeInTheDocument()
    })

    it('shows results matching meaning', async () => {
      const user = userEvent.setup()
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'water')

      expect(screen.getByText('水')).toBeInTheDocument()
    })

    it('excludes vocabulary by ID', async () => {
      const user = userEvent.setup()
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: [1]
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '水')

      expect(screen.queryByText('水')).not.toBeInTheDocument()
    })

    it('limits results to 10 items', async () => {
      const user = userEvent.setup()
      const manyVocab: VocabularyListItem[] = Array.from(
        { length: 20 },
        (_, i) => ({
          linkId: i,
          vocabularyId: i,
          word: `word${String(i)}`,
          kana: 'kana',
          shortMeaning: null
        })
      )

      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: manyVocab,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'word')

      const results = screen.getByTestId('vocabulary-search-results')
      expect(results.querySelectorAll('button')).toHaveLength(10)
    })
  })

  describe('event emission', () => {
    it('emits select event when result clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '水')

      const result = screen.getByTestId('vocabulary-search-result-1')
      await user.click(result)

      expect(emitted()).toHaveProperty('select')
      expect(emitted()['select']?.[0]).toEqual([1])
    })

    it('emits create event when create button clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'unknown')

      const createButton = screen.getByTestId('vocabulary-search-create-button')
      await user.click(createButton)

      expect(emitted()).toHaveProperty('create')
      expect(emitted()['create']?.[0]).toEqual(['unknown'])
    })

    it('clears search term after selection', async () => {
      const user = userEvent.setup()
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '水')

      const result = screen.getByTestId('vocabulary-search-result-1')
      await user.click(result)

      expect((input as HTMLInputElement).value).toBe('')
    })
  })

  describe('no results state', () => {
    it('shows create button when no results found', async () => {
      const user = userEvent.setup()
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'xyz')

      expect(screen.getByText('No vocabulary found')).toBeInTheDocument()
      expect(
        screen.getByTestId('vocabulary-search-create-button')
      ).toBeInTheDocument()
    })

    it('shows no create button when search is empty', () => {
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: []
        }
      })

      expect(
        screen.queryByTestId('vocabulary-search-create-button')
      ).not.toBeInTheDocument()
    })
  })

  describe('props', () => {
    it('respects custom placeholder', () => {
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: [],
          placeholder: 'Custom placeholder'
        }
      })

      expect(
        screen.getByPlaceholderText('Custom placeholder')
      ).toBeInTheDocument()
    })

    it('pre-fills initial search term', () => {
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: [],
          initialSearchTerm: '水'
        }
      })

      const input = screen.getByRole('textbox')
      expect(input).toHaveValue('水')
    })

    it('disables input when disabled prop is true', () => {
      render(KanjiDetailVocabularySearch, {
        props: {
          allVocabulary: mockVocabulary,
          excludeIds: [],
          disabled: true
        }
      })

      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })
})
