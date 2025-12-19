/**
 * Tests for VocabularyDetailBasicInfo component
 */

import {
  cleanup,
  fireEvent,
  render,
  screen,
  within
} from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vitest'

import VocabularyDetailBasicInfo from './VocabularyDetailBasicInfo.vue'

import type { Vocabulary } from '@/shared/types/database-types'

const mockVocabulary: Vocabulary = {
  id: 1,
  word: '日本',
  kana: 'にほん',
  shortMeaning: 'Japan',
  searchKeywords: 'nippon',
  jlptLevel: 'N5',
  isCommon: true,
  description: 'The country of Japan',
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

describe('VocabularyDetailBasicInfo', () => {
  afterEach(() => {
    cleanup()
  })

  describe('view mode', () => {
    it('renders JLPT level display', () => {
      const { container } = render(VocabularyDetailBasicInfo, {
        props: { vocabulary: mockVocabulary }
      })
      expect(
        within(container as HTMLElement).getByText(/JLPT Level/)
      ).toBeInTheDocument()
      expect(
        within(container as HTMLElement).getByText('N5')
      ).toBeInTheDocument()
    })

    it('renders common word status', () => {
      const { container } = render(VocabularyDetailBasicInfo, {
        props: { vocabulary: mockVocabulary }
      })
      expect(
        within(container as HTMLElement).getByText(/Common Word/)
      ).toBeInTheDocument()
      expect(
        within(container as HTMLElement).getByText('Yes')
      ).toBeInTheDocument()
    })

    it('renders description', () => {
      const { container } = render(VocabularyDetailBasicInfo, {
        props: { vocabulary: mockVocabulary }
      })
      expect(
        within(container as HTMLElement).getByText(/Description/)
      ).toBeInTheDocument()
      expect(
        within(container as HTMLElement).getByText('The country of Japan')
      ).toBeInTheDocument()
    })

    it('shows dash for missing values', () => {
      const vocab: Vocabulary = {
        ...mockVocabulary,
        jlptLevel: null,
        isCommon: false,
        description: null
      }
      const { container } = render(VocabularyDetailBasicInfo, {
        props: { vocabulary: vocab }
      })
      const dashes = within(container as HTMLElement).getAllByText('—')
      // Should have dashes for JLPT and description
      expect(dashes.length).toBeGreaterThanOrEqual(2)
    })

    it('shows Edit button in view mode', () => {
      render(VocabularyDetailBasicInfo, {
        props: { vocabulary: mockVocabulary }
      })
      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })

  describe('edit mode', () => {
    it('shows Save and Cancel buttons after clicking Edit', async () => {
      render(VocabularyDetailBasicInfo, {
        props: { vocabulary: mockVocabulary }
      })

      await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
    })

    it('returns to view mode on Cancel', async () => {
      render(VocabularyDetailBasicInfo, {
        props: { vocabulary: mockVocabulary }
      })

      await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
      await fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })

    it('emits update events on Save for changed values', async () => {
      const updateHandler = vi.fn()
      render(VocabularyDetailBasicInfo, {
        props: {
          vocabulary: {
            ...mockVocabulary,
            description: null
          }
        },
        attrs: {
          onUpdate: updateHandler
        }
      })

      await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))

      // Find and update the description textarea
      const textarea = screen.getByRole('textbox')
      await fireEvent.update(textarea, 'New description')

      await fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      expect(updateHandler).toHaveBeenCalledWith(
        'description',
        'New description'
      )
    })

    it('returns to view mode on Save', async () => {
      render(VocabularyDetailBasicInfo, {
        props: { vocabulary: mockVocabulary }
      })

      await fireEvent.click(screen.getByRole('button', { name: 'Edit' }))
      await fireEvent.click(screen.getByRole('button', { name: 'Save' }))

      expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
    })
  })
})
