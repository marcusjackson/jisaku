import { defineComponent } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailDialogVocabulary from './KanjiDetailDialogVocabulary.vue'

import type { VocabularyListItem } from '../kanji-detail-types'

// Mock BaseDialog to render without teleport
vi.mock('@/base/components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  const MockDialog = defineComponent({
    name: 'BaseDialog',
    props: {
      open: { type: Boolean, required: true },
      title: { type: String, default: '' }
    },
    emits: ['update:open'],
    setup(_props, { emit }) {
      const handleClose = () => {
        emit('update:open', false)
      }
      return { handleClose }
    },
    template: `
      <div v-if="open" role="dialog">
        <h2>{{ title }}</h2>
        <slot></slot>
      </div>
    `
  })
  return {
    ...original,
    BaseDialog: MockDialog
  }
})

const mockAllVocabulary: VocabularyListItem[] = [
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
    word: '木',
    kana: 'き',
    shortMeaning: 'tree'
  }
]

const mockLinkedVocabulary: VocabularyListItem[] = [
  {
    linkId: 1,
    vocabularyId: 1,
    word: '水',
    kana: 'みず',
    shortMeaning: 'water'
  }
]

describe('KanjiDetailDialogVocabulary', () => {
  describe('rendering', () => {
    it('renders when open', () => {
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      expect(screen.getByText('Link Vocabulary')).toBeInTheDocument()
    })

    it('shows search component', () => {
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText(
          'Search vocabulary by word, kana, or meaning...'
        )
      ).toBeInTheDocument()
    })

    it('shows close button', () => {
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    })
  })

  describe('vocabulary search integration', () => {
    it('excludes linked vocabulary from search results', async () => {
      const user = userEvent.setup()
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '水')

      // Should not show 水 because it's already linked
      expect(screen.queryByText('水')).not.toBeInTheDocument()
    })

    it('shows unlinked vocabulary in search results', async () => {
      const user = userEvent.setup()
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '火')

      // Should show 火 because it's not linked
      expect(screen.getByText('火')).toBeInTheDocument()
    })
  })

  describe('event emission', () => {
    it('emits link event when vocabulary selected', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '火')

      const result = screen.getByTestId('vocabulary-search-result-2')
      await user.click(result)

      expect(emitted()).toHaveProperty('link')
      expect(emitted()['link']?.[0]).toEqual([2])
    })

    it('closes dialog after successful link', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '火')

      const result = screen.getByTestId('vocabulary-search-result-2')
      await user.click(result)

      expect(emitted()).toHaveProperty('update:open')
      expect(emitted()['update:open']?.[0]).toEqual([false])
    })

    it('shows quick-create form when create button clicked', async () => {
      const user = userEvent.setup()
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'unknown')

      const createButton = screen.getByTestId('vocabulary-search-create-button')
      await user.click(createButton)

      // Quick-create form should appear
      await waitFor(() => {
        expect(screen.getByLabelText(/^word$/i)).toBeInTheDocument()
      })
      expect(screen.getByLabelText(/kana.*optional/i)).toBeInTheDocument()
    })

    it('keeps dialog open when showing quick-create form', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, 'unknown')

      const createButton = screen.getByTestId('vocabulary-search-create-button')
      await user.click(createButton)

      // Should NOT emit update:open when showing quick-create form
      expect(emitted()['update:open']).toBeUndefined()
    })

    it('emits update:open false when close button clicked', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      const closeButton = screen.getByRole('button', { name: 'Close' })
      await user.click(closeButton)

      expect(emitted()).toHaveProperty('update:open')
      expect(emitted()['update:open']?.[0]).toEqual([false])
    })
  })

  describe('quick-create integration', () => {
    it('pre-fills word in quick-create form with search term', async () => {
      const user = userEvent.setup()
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      const input = screen.getByRole('textbox')
      await user.type(input, '新語')

      const createButton = screen.getByTestId('vocabulary-search-create-button')
      await user.click(createButton)

      await waitFor(() => {
        const wordInput = screen.getByLabelText(/^word$/i)
        expect((wordInput as HTMLInputElement).value).toBe('新語')
      })
    })

    it('emits create event with form data when quick-create submitted', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      // Enter search mode and click create
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, '新語')
      const createButton = screen.getByTestId('vocabulary-search-create-button')
      await user.click(createButton)

      // Fill quick-create form
      await waitFor(() => {
        expect(screen.getByLabelText(/^word$/i)).toBeInTheDocument()
      })

      const kanaInput = screen.getByLabelText(/kana.*optional/i)
      await user.type(kanaInput, 'しんご')

      const submitButton = screen.getByRole('button', {
        name: /create & link/i
      })
      await user.click(submitButton)

      await waitFor(() => {
        expect(emitted()).toHaveProperty('create')
      })

      const createEvents = emitted()['create'] as unknown[][] | undefined
      const firstEvent = createEvents?.[0]
      expect(firstEvent?.[0]).toMatchObject({
        word: '新語',
        kana: 'しんご'
      })
    })

    it('closes dialog after quick-create submission', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      // Enter quick-create mode
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, '新語')
      const createButton = screen.getByTestId('vocabulary-search-create-button')
      await user.click(createButton)

      // Fill and submit form
      await waitFor(() => {
        expect(screen.getByLabelText(/^word$/i)).toBeInTheDocument()
      })
      const submitButton = screen.getByRole('button', {
        name: /create & link/i
      })
      await user.click(submitButton)

      // Should emit create and update:open events
      await waitFor(() => {
        expect(emitted()['create']).toBeTruthy()
      })
      expect(emitted()['update:open']).toContainEqual([false])
    })

    it('returns to search mode when quick-create is cancelled', async () => {
      const user = userEvent.setup()
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: []
        }
      })

      // Enter quick-create mode
      const searchInput = screen.getByRole('textbox')
      await user.type(searchInput, '新語')
      const createButton = screen.getByTestId('vocabulary-search-create-button')
      await user.click(createButton)

      // Cancel quick-create
      await waitFor(() => {
        expect(screen.getByLabelText(/^word$/i)).toBeInTheDocument()
      })
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Should be back in search mode
      await waitFor(() => {
        expect(
          screen.getByPlaceholderText(
            /search vocabulary by word, kana, or meaning/i
          )
        ).toBeInTheDocument()
      })
    })
  })

  describe('destructive mode', () => {
    it('does not show linked vocabulary list when destructiveMode is false', () => {
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary,
          destructiveMode: false
        }
      })

      expect(
        screen.queryByTestId('linked-vocabulary-list')
      ).not.toBeInTheDocument()
    })

    it('shows linked vocabulary list when destructiveMode is true', () => {
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary,
          destructiveMode: true
        }
      })

      expect(screen.getByTestId('linked-vocabulary-list')).toBeInTheDocument()
      expect(screen.getByText('水')).toBeInTheDocument()
    })

    it('shows remove button on linked vocabulary when destructiveMode is true', () => {
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary,
          destructiveMode: true
        }
      })

      expect(screen.getByTestId('vocabulary-remove-button')).toBeInTheDocument()
    })

    it('shows confirmation dialog when remove button is clicked', async () => {
      const user = userEvent.setup()
      render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary,
          destructiveMode: true
        }
      })

      const removeButton = screen.getByTestId('vocabulary-remove-button')
      await user.click(removeButton)

      // Confirmation dialog should appear
      await waitFor(() => {
        expect(screen.getByText(/remove vocabulary link/i)).toBeInTheDocument()
      })
    })

    it('emits unlink event when removal is confirmed', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary,
          destructiveMode: true
        }
      })

      // Click remove button
      const removeButton = screen.getByTestId('vocabulary-remove-button')
      await user.click(removeButton)

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/remove vocabulary link/i)).toBeInTheDocument()
      })

      // Confirm removal
      const confirmButton = screen.getByRole('button', { name: /remove/i })
      await user.click(confirmButton)

      // Should emit unlink event with vocabulary ID
      await waitFor(() => {
        expect(emitted()['unlink']).toBeTruthy()
      })
      const unlinkEvents = emitted()['unlink']
      expect(unlinkEvents).toHaveLength(1)
      expect(unlinkEvents?.[0]).toEqual([1]) // vocabularyId
    })

    it('does not emit unlink event when removal is cancelled', async () => {
      const user = userEvent.setup()
      const { emitted } = render(KanjiDetailDialogVocabulary, {
        props: {
          open: true,
          allVocabulary: mockAllVocabulary,
          linkedVocabulary: mockLinkedVocabulary,
          destructiveMode: true
        }
      })

      // Click remove button
      const removeButton = screen.getByTestId('vocabulary-remove-button')
      await user.click(removeButton)

      // Wait for confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/remove vocabulary link/i)).toBeInTheDocument()
      })

      // Cancel removal
      const cancelButton = screen.getByRole('button', { name: /cancel/i })
      await user.click(cancelButton)

      // Should not emit unlink event
      expect(emitted()['unlink']).toBeFalsy()
    })
  })
})
