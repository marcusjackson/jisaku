/**
 * Tests for useKanjiDetailNotesHandlers composable.
 *
 * TDD tests for notes save handlers.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailNotesHandlers } from './use-kanji-detail-notes-handlers'

import type { Kanji } from '@/api/kanji'

// Mock the kanji repository
const mockUpdateField = vi.fn()
vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    updateField: mockUpdateField
  })
}))

// Mock the toast composable
const mockToastSuccess = vi.fn()
const mockToastError = vi.fn()
vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    success: mockToastSuccess,
    error: mockToastError
  })
}))

describe('useKanjiDetailNotesHandlers', () => {
  const createKanji = (overrides: Partial<Kanji> = {}): Kanji => ({
    id: 1,
    character: '日',
    strokeCount: 4,
    shortMeaning: 'sun',
    searchKeywords: null,
    radicalId: null,
    jlptLevel: null,
    joyoLevel: null,
    kanjiKenteiLevel: null,
    strokeDiagramImage: null,
    strokeGifImage: null,
    notesEtymology: null,
    notesSemantic: null,
    notesEducationMnemonics: null,
    notesPersonal: null,
    identifier: null,
    radicalStrokeCount: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ...overrides
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('handleSemanticNotesSave', () => {
    it('calls repository updateField with correct field name', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(
        createKanji({ notesSemantic: 'New value' })
      )

      const { handleSemanticNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleSemanticNotesSave('New value')

      expect(mockUpdateField).toHaveBeenCalledWith(
        1,
        'notesSemantic',
        'New value'
      )
    })

    it('updates kanji ref on success', () => {
      const kanji = ref<Kanji | null>(createKanji())
      const updatedKanji = createKanji({ notesSemantic: 'Updated notes' })
      mockUpdateField.mockReturnValue(updatedKanji)

      const { handleSemanticNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleSemanticNotesSave('Updated notes')

      expect(kanji.value?.notesSemantic).toBe('Updated notes')
    })

    it('shows success toast on save', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(createKanji({ notesSemantic: 'New' }))

      const { handleSemanticNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleSemanticNotesSave('New')

      expect(mockToastSuccess).toHaveBeenCalledWith('Semantic notes saved')
    })

    it('shows error toast on failure', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockImplementation(() => {
        throw new Error('Database error')
      })

      const { handleSemanticNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleSemanticNotesSave('New')

      expect(mockToastError).toHaveBeenCalledWith('Database error')
    })

    it('does nothing if kanji is null', () => {
      const kanji = ref<Kanji | null>(null)

      const { handleSemanticNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleSemanticNotesSave('New')

      expect(mockUpdateField).not.toHaveBeenCalled()
    })
  })

  describe('handleEtymologyNotesSave', () => {
    it('calls repository updateField with correct field name', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(
        createKanji({ notesEtymology: 'Etymology' })
      )

      const { handleEtymologyNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleEtymologyNotesSave('Etymology')

      expect(mockUpdateField).toHaveBeenCalledWith(
        1,
        'notesEtymology',
        'Etymology'
      )
    })

    it('shows success toast on save', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(createKanji({ notesEtymology: 'New' }))

      const { handleEtymologyNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleEtymologyNotesSave('New')

      expect(mockToastSuccess).toHaveBeenCalledWith('Etymology notes saved')
    })
  })

  describe('handleEducationNotesSave', () => {
    it('calls repository updateField with correct field name', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(
        createKanji({ notesEducationMnemonics: 'Education' })
      )

      const { handleEducationNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleEducationNotesSave('Education')

      expect(mockUpdateField).toHaveBeenCalledWith(
        1,
        'notesEducationMnemonics',
        'Education'
      )
    })

    it('shows success toast on save', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(
        createKanji({ notesEducationMnemonics: 'New' })
      )

      const { handleEducationNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleEducationNotesSave('New')

      expect(mockToastSuccess).toHaveBeenCalledWith('Education notes saved')
    })
  })

  describe('handlePersonalNotesSave', () => {
    it('calls repository updateField with correct field name', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(
        createKanji({ notesPersonal: 'Personal' })
      )

      const { handlePersonalNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handlePersonalNotesSave('Personal')

      expect(mockUpdateField).toHaveBeenCalledWith(
        1,
        'notesPersonal',
        'Personal'
      )
    })

    it('shows success toast on save', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockReturnValue(createKanji({ notesPersonal: 'New' }))

      const { handlePersonalNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handlePersonalNotesSave('New')

      expect(mockToastSuccess).toHaveBeenCalledWith('Personal notes saved')
    })
  })

  describe('error handling', () => {
    it('handles non-Error exceptions', () => {
      const kanji = ref<Kanji | null>(createKanji())
      mockUpdateField.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'String error'
      })

      const { handleSemanticNotesSave } = useKanjiDetailNotesHandlers(kanji)
      handleSemanticNotesSave('New')

      expect(mockToastError).toHaveBeenCalledWith('Failed to save notes')
    })
  })
})
