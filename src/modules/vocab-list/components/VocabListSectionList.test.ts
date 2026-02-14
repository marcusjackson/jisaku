/**
 * VocabListSectionList Tests
 */

import { createMemoryHistory, createRouter } from 'vue-router'

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import VocabListSectionList from './VocabListSectionList.vue'

import type { Vocabulary } from '@/api/vocabulary'

const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>Home</div>' } },
      { path: '/vocabulary/:id', component: { template: '<div>Detail</div>' } }
    ]
  })

const mockVocabulary: Vocabulary[] = [
  {
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
]

describe('VocabListSectionList', () => {
  it('renders heading', () => {
    const router = createTestRouter()
    render(VocabListSectionList, {
      props: { vocabList: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(
      screen.getByRole('heading', { name: /vocabulary/i })
    ).toBeInTheDocument()
  })

  it('renders vocabulary cards', () => {
    const router = createTestRouter()
    render(VocabListSectionList, {
      props: { vocabList: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(screen.getByText('日本')).toBeInTheDocument()
  })

  it('shows empty state when no vocabulary', () => {
    const router = createTestRouter()
    render(VocabListSectionList, {
      props: { vocabList: [] },
      global: { plugins: [router] }
    })

    expect(screen.getByText(/no vocabulary yet/i)).toBeInTheDocument()
  })

  it('renders add vocabulary button', () => {
    const router = createTestRouter()
    render(VocabListSectionList, {
      props: { vocabList: mockVocabulary },
      global: { plugins: [router] }
    })

    expect(screen.getByRole('button', { name: /add new/i })).toBeInTheDocument()
  })
})
