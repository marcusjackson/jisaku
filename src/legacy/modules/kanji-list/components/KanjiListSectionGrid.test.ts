/**
 * Tests for KanjiListSectionGrid component
 */

import { ref } from 'vue'

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import KanjiListSectionGrid from './KanjiListSectionGrid.vue'

import type { Kanji } from '@/legacy/shared/types/database-types'

// Mock useSeedData
const mockSeed = vi.fn()
const mockIsSeeding = ref(false)

vi.mock('@/legacy/shared/composables/use-seed-data', () => ({
  useSeedData: () => ({
    isSeeding: mockIsSeeding,
    seed: mockSeed,
    seedDataCounts: { kanji: 18, components: 8, positionTypes: 8 }
  })
}))

// Mock useToast
const mockShowSuccess = vi.fn()
const mockShowError = vi.fn()

vi.mock('@/legacy/shared/composables/use-toast', () => ({
  useToast: () => ({
    error: mockShowError,
    success: mockShowSuccess
  })
}))

function createMockKanji(overrides: Partial<Kanji> = {}): Kanji {
  return {
    id: 1,
    character: '日',
    strokeCount: 4,
    shortMeaning: null,
    searchKeywords: null,
    radicalId: null,
    jlptLevel: 'N5',
    joyoLevel: 'elementary1',
    kenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiListSectionGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSeeding.value = false
  })

  it('renders the page title', () => {
    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    expect(
      screen.getByRole('heading', { name: /kanji list/i })
    ).toBeInTheDocument()
  })

  it('renders empty state when no kanji', () => {
    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    expect(screen.getByText(/no kanji yet/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /add your first kanji/i })
    ).toBeInTheDocument()
  })

  it('renders kanji cards when kanji exist', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '日' }),
      createMockKanji({ id: 2, character: '月' }),
      createMockKanji({ id: 3, character: '水' })
    ]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(screen.getByText('日')).toBeInTheDocument()
    expect(screen.getByText('月')).toBeInTheDocument()
    expect(screen.getByText('水')).toBeInTheDocument()
  })

  it('renders Add Kanji button in header', () => {
    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    // Should have Add Kanji button in header
    expect(
      screen.getByRole('button', { name: /add kanji/i })
    ).toBeInTheDocument()
  })

  it('displays JLPT level badge on kanji cards', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '日', jlptLevel: 'N5' })
    ]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(screen.getByText('N5')).toBeInTheDocument()
  })

  it('displays Joyo level badge on kanji cards', () => {
    const kanjiList = [
      createMockKanji({ id: 1, character: '日', joyoLevel: 'elementary1' })
    ]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(screen.getByText('小1')).toBeInTheDocument()
  })

  // Seed button tests - only visible in development mode
  // Note: import.meta.env.DEV is true in test environment
  it('shows seed button when database is empty in dev mode', () => {
    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    expect(
      screen.getByRole('button', { name: /seed data/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/load example kanji and components for testing/i)
    ).toBeInTheDocument()
  })

  it('does not show seed button when kanji exist', () => {
    const kanjiList = [createMockKanji({ id: 1, character: '日' })]

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList }
    })

    expect(
      screen.queryByRole('button', { name: /seed data/i })
    ).not.toBeInTheDocument()
  })

  it('calls seed function when seed button is clicked', async () => {
    const user = userEvent.setup()
    mockSeed.mockResolvedValue(undefined)

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    const seedButton = screen.getByRole('button', { name: /seed data/i })
    await user.click(seedButton)

    expect(mockSeed).toHaveBeenCalled()
  })

  it('shows success message after seeding', async () => {
    const user = userEvent.setup()
    mockSeed.mockResolvedValue(undefined)

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    const seedButton = screen.getByRole('button', { name: /seed data/i })
    await user.click(seedButton)

    expect(mockShowSuccess).toHaveBeenCalledWith(
      'Database seeded successfully! Refresh to see data.'
    )
  })

  it('emits refresh event after successful seeding', async () => {
    const user = userEvent.setup()
    mockSeed.mockResolvedValue(undefined)

    const result = renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    const seedButton = screen.getByRole('button', { name: /seed data/i })
    await user.click(seedButton)

    expect(result.emitted()).toHaveProperty('refresh')
  })

  it('disables seed button while seeding', () => {
    mockIsSeeding.value = true

    renderWithProviders(KanjiListSectionGrid, {
      props: { kanjiList: [] }
    })

    const seedButton = screen.getByRole('button', { name: /seeding/i })
    expect(seedButton).toBeDisabled()
  })
})
