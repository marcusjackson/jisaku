/**
 * Tests for use-kanji-detail-save-handlers
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailSaveHandlers } from './use-kanji-detail-save-handlers'

import type {
  BasicInfoSaveData,
  MeaningsSaveData,
  ReadingsSaveData
} from '../kanji-detail-types'

const mockToast = {
  success: vi.fn(),
  error: vi.fn()
}

vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => mockToast
}))

describe('use-kanji-detail-save-handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handleBasicInfoSave calls save function and shows success toast', () => {
    const mockSaveBasicInfo = vi.fn()
    const mockSaveReadings = vi.fn()
    const mockSaveMeanings = vi.fn()

    const handlers = useKanjiDetailSaveHandlers(
      mockSaveBasicInfo,
      mockSaveReadings,
      mockSaveMeanings
    )

    const data: BasicInfoSaveData = {
      strokeCount: 5,
      jlptLevel: null,
      joyoLevel: null,
      kanjiKenteiLevel: null,
      radicalId: null,
      classifications: []
    }

    handlers.handleBasicInfoSave(data)

    expect(mockSaveBasicInfo).toHaveBeenCalledWith(data)
    expect(mockToast.success).toHaveBeenCalledWith('Basic info updated')
  })

  it('handleBasicInfoSave shows error toast on failure', () => {
    const mockSaveBasicInfo = vi.fn(() => {
      throw new Error('Save failed')
    })
    const mockSaveReadings = vi.fn()
    const mockSaveMeanings = vi.fn()

    const handlers = useKanjiDetailSaveHandlers(
      mockSaveBasicInfo,
      mockSaveReadings,
      mockSaveMeanings
    )

    const data: BasicInfoSaveData = {
      strokeCount: 5,
      jlptLevel: null,
      joyoLevel: null,
      kanjiKenteiLevel: null,
      radicalId: null,
      classifications: []
    }

    handlers.handleBasicInfoSave(data)

    expect(mockToast.error).toHaveBeenCalledWith('Save failed')
  })

  it('handleReadingsSave calls save function and shows success toast', () => {
    const mockSaveBasicInfo = vi.fn()
    const mockSaveReadings = vi.fn()
    const mockSaveMeanings = vi.fn()

    const handlers = useKanjiDetailSaveHandlers(
      mockSaveBasicInfo,
      mockSaveReadings,
      mockSaveMeanings
    )

    const data: ReadingsSaveData = {
      onReadings: [],
      kunReadings: []
    }

    handlers.handleReadingsSave(data)

    expect(mockSaveReadings).toHaveBeenCalledWith(data)
    expect(mockToast.success).toHaveBeenCalledWith('Readings updated')
  })

  it('handleMeaningsSave calls save function and shows success toast', () => {
    const mockSaveBasicInfo = vi.fn()
    const mockSaveReadings = vi.fn()
    const mockSaveMeanings = vi.fn()

    const handlers = useKanjiDetailSaveHandlers(
      mockSaveBasicInfo,
      mockSaveReadings,
      mockSaveMeanings
    )

    const data: MeaningsSaveData = {
      meanings: [],
      readingGroups: [],
      groupMembers: [],
      groupingEnabled: false,
      groupingDisabled: false
    }

    handlers.handleMeaningsSave(data)

    expect(mockSaveMeanings).toHaveBeenCalledWith(data)
    expect(mockToast.success).toHaveBeenCalledWith('Meanings updated')
  })
})
