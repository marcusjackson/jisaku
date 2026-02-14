/**
 * Tests for useKanjiDetailAllHandlers composable
 *
 * @vitest-environment jsdom
 */
import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailAllHandlers } from './use-kanji-detail-all-handlers'

import type { Kanji } from '@/api/kanji'

// Mock the notes and save handlers
vi.mock('./use-kanji-detail-notes-handlers', () => ({
  useKanjiDetailNotesHandlers: vi.fn(() => ({
    handleSemanticNotesSave: vi.fn(),
    handleEtymologyNotesSave: vi.fn(),
    handleEducationNotesSave: vi.fn(),
    handlePersonalNotesSave: vi.fn(),
    handleStrokeDiagramSave: vi.fn(),
    handleStrokeAnimationSave: vi.fn()
  }))
}))

vi.mock('./use-kanji-detail-save-handlers', () => ({
  useKanjiDetailSaveHandlers: vi.fn(() => ({
    handleBasicInfoSave: vi.fn(),
    handleMeaningsSave: vi.fn(),
    handleReadingsSave: vi.fn()
  }))
}))

describe('useKanjiDetailAllHandlers', () => {
  const mockKanji: Kanji = {
    id: 1,
    character: '日',
    strokeCount: 4,
    shortMeaning: null,
    searchKeywords: null,
    radicalId: null,
    jlptLevel: 'N5',
    joyoLevel: null,
    kanjiKenteiLevel: null,
    identifier: null,
    radicalStrokeCount: null,
    notesSemantic: null,
    notesEtymology: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return all handler functions', () => {
    const kanjiRef = ref<Kanji | null>(mockKanji)
    const saveBasicInfo = vi.fn()
    const handleSaveReadings = vi.fn()
    const handleSaveMeanings = vi.fn()

    const handlers = useKanjiDetailAllHandlers(
      kanjiRef,
      saveBasicInfo,
      handleSaveReadings,
      handleSaveMeanings
    )

    // Save handlers
    expect(handlers.handleBasicInfoSave).toBeDefined()
    expect(handlers.handleMeaningsSave).toBeDefined()
    expect(handlers.handleReadingsSave).toBeDefined()
    // Notes handlers
    expect(handlers.handleSemanticNotesSave).toBeDefined()
    expect(handlers.handleEtymologyNotesSave).toBeDefined()
    expect(handlers.handleEducationNotesSave).toBeDefined()
    expect(handlers.handlePersonalNotesSave).toBeDefined()
    // Stroke handlers
    expect(handlers.handleStrokeDiagramSave).toBeDefined()
    expect(handlers.handleStrokeAnimationSave).toBeDefined()
  })

  it('should have correct function types', () => {
    const kanjiRef = ref<Kanji | null>(mockKanji)
    const handlers = useKanjiDetailAllHandlers(
      kanjiRef,
      vi.fn(),
      vi.fn(),
      vi.fn()
    )

    expect(typeof handlers.handleBasicInfoSave).toBe('function')
    expect(typeof handlers.handleStrokeDiagramSave).toBe('function')
    expect(typeof handlers.handleSemanticNotesSave).toBe('function')
  })
})
