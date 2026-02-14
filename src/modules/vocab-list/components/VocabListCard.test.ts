/**
 * VocabListCard Tests
 */

import { createMemoryHistory, createRouter } from 'vue-router'

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListCard from './VocabListCard.vue'

import type { Vocabulary } from '@/api/vocabulary'

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      {
        path: '/vocabulary/:id',
        component: { template: '<div>Detail</div>' },
        name: 'vocabulary-detail'
      }
    ]
  })

const mockVocabulary: Vocabulary = {
  id: 1,
  word: '日本',
  kana: 'にほん',

  shortMeaning: 'Japan',
  jlptLevel: 'N5',
  isCommon: true,
  searchKeywords: null,
  description: null,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01'
}

describe('VocabListCard', () => {
  it('renders vocabulary word', () => {
    const router = createTestRouter()
    render(VocabListCard, {
      props: { vocabulary: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(screen.getByText('日本')).toBeInTheDocument()
  })

  it('renders kana', () => {
    const router = createTestRouter()
    render(VocabListCard, {
      props: { vocabulary: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(screen.getByText('にほん')).toBeInTheDocument()
  })

  it('renders short meaning', () => {
    const router = createTestRouter()
    render(VocabListCard, {
      props: { vocabulary: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(screen.getByText('Japan')).toBeInTheDocument()
  })

  it('renders JLPT level badge', () => {
    const router = createTestRouter()
    render(VocabListCard, {
      props: { vocabulary: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
  })

  it('renders common badge when isCommon is true', () => {
    const router = createTestRouter()
    render(VocabListCard, {
      props: { vocabulary: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(screen.getByText('常用')).toBeInTheDocument()
  })

  it('links to vocabulary detail page', () => {
    const router = createTestRouter()
    render(VocabListCard, {
      props: { vocabulary: mockVocabulary },
      global: { plugins: [router] }
    })

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/vocabulary/1')
  })
})
