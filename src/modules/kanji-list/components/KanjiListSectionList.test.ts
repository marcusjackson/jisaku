/**
 * KanjiListSectionList Tests
 *
 * Tests for the kanji list section component.
 */

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiListSectionList from './KanjiListSectionList.vue'

import type { Kanji } from '@/api/kanji'

// Mock seed data composable
vi.mock('@/shared/composables', () => ({
  useSeedData: () => ({
    isSeeding: { value: false },
    seed: vi.fn()
  }),
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn()
  })
}))

const mockKanji: Kanji[] = [
  {
    id: 1,
    character: '山',
    shortMeaning: 'mountain',
    searchKeywords: null,
    strokeCount: 3,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kanjiKenteiLevel: '10',
    radicalId: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    character: '川',
    shortMeaning: 'river',
    searchKeywords: null,
    strokeCount: 3,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kanjiKenteiLevel: '10',
    radicalId: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }
]

describe('KanjiListSectionList', () => {
  it('renders title and add button', () => {
    renderWithProviders(KanjiListSectionList, {
      props: { kanjiList: mockKanji }
    })

    expect(
      screen.getByRole('heading', { name: /kanji list/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add new/i })).toBeInTheDocument()
  })

  it('renders kanji cards', () => {
    renderWithProviders(KanjiListSectionList, {
      props: { kanjiList: mockKanji }
    })

    expect(screen.getByText('山')).toBeInTheDocument()
    expect(screen.getByText('川')).toBeInTheDocument()
  })

  it('shows filter empty state when no results', () => {
    renderWithProviders(KanjiListSectionList, {
      props: { kanjiList: [], hasActiveFilters: true }
    })

    expect(screen.getByText(/no kanji match your filters/i)).toBeInTheDocument()
  })

  it('renders kentei level badges with kanji cards', () => {
    renderWithProviders(KanjiListSectionList, {
      props: { kanjiList: mockKanji }
    })

    // Both mockKanji have kanjiKenteiLevel: '10', which maps to '10級'
    const badges = screen.getAllByText('10級')
    expect(badges.length).toBe(2)
  })

  it('emits addKanji when add button clicked', async () => {
    const user = userEvent.setup()
    const wrapper = renderWithProviders(KanjiListSectionList, {
      props: {
        kanjiList: mockKanji,
        onAddKanji: vi.fn()
      }
    })

    await user.click(screen.getByRole('button', { name: /add new/i }))

    expect(wrapper.emitted('addKanji')).toBeTruthy()
  })
})
