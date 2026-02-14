/**
 * VocabListDialogCreate Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import VocabListDialogCreate from './VocabListDialogCreate.vue'

// Mock vocabulary repository
vi.mock('@/api/vocabulary', () => ({
  useVocabularyRepository: () => ({
    create: vi.fn().mockReturnValue({ id: 1, word: 'test' }),
    getByWord: vi.fn().mockReturnValue(null)
  })
}))

// Mock toast
vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn()
  })
}))

describe('VocabListDialogCreate', () => {
  it('renders word input', () => {
    render(VocabListDialogCreate)

    expect(screen.getByRole('textbox', { name: /word/i })).toBeInTheDocument()
  })

  it('renders kana input', () => {
    render(VocabListDialogCreate)

    expect(screen.getByRole('textbox', { name: /kana/i })).toBeInTheDocument()
  })

  it('renders add button', () => {
    render(VocabListDialogCreate)

    expect(screen.getByRole('button', { name: /^add$/i })).toBeInTheDocument()
  })

  it('renders cancel button', () => {
    render(VocabListDialogCreate)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })
})
