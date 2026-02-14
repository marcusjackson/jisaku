/**
 * Tests for use-kanji-detail-readings-handlers composable.
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailReadingsHandlers } from './use-kanji-detail-readings-handlers'

import type { ReadingsSaveData } from '../kanji-detail-types'
import type { KunReading, OnReading } from '@/api/kanji'
import type { Ref } from 'vue'

function mockOnReading(overrides: Partial<OnReading> = {}): OnReading {
  return {
    id: 1,
    kanjiId: 1,
    reading: 'メイ',
    readingLevel: '小',
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

function mockKunReading(overrides: Partial<KunReading> = {}): KunReading {
  return {
    id: 1,
    kanjiId: 1,
    reading: 'あか',
    okurigana: null,
    readingLevel: '小',
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    ...overrides
  }
}

describe('useKanjiDetailReadingsHandlers', () => {
  let kanjiId: Ref<number>
  let onReadings: Ref<OnReading[]>
  let kunReadings: Ref<KunReading[]>
  let mockOnReadingRepo: {
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
    reorder: ReturnType<typeof vi.fn>
    getByParentId: ReturnType<typeof vi.fn>
  }
  let mockKunReadingRepo: {
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    remove: ReturnType<typeof vi.fn>
    reorder: ReturnType<typeof vi.fn>
    getByParentId: ReturnType<typeof vi.fn>
  }

  beforeEach(() => {
    kanjiId = ref(1)
    onReadings = ref<OnReading[]>([mockOnReading({ id: 1 })])
    kunReadings = ref<KunReading[]>([mockKunReading({ id: 1 })])

    mockOnReadingRepo = {
      create: vi.fn().mockReturnValue(mockOnReading({ id: 2 })),
      update: vi.fn().mockReturnValue(mockOnReading()),
      remove: vi.fn(),
      reorder: vi.fn(),
      getByParentId: vi.fn().mockReturnValue([mockOnReading()])
    }

    mockKunReadingRepo = {
      create: vi.fn().mockReturnValue(mockKunReading({ id: 2 })),
      update: vi.fn().mockReturnValue(mockKunReading()),
      remove: vi.fn(),
      reorder: vi.fn(),
      getByParentId: vi.fn().mockReturnValue([mockKunReading()])
    }
  })

  describe('handleSaveReadings', () => {
    it('creates new on-readings', () => {
      const { handleSaveReadings } = useKanjiDetailReadingsHandlers(
        { kanjiId, onReadings, kunReadings },
        {
          onReadingRepo: mockOnReadingRepo as never,
          kunReadingRepo: mockKunReadingRepo as never
        }
      )

      const saveData: ReadingsSaveData = {
        onReadings: [
          { id: 1, reading: 'メイ', readingLevel: '小' },
          { id: -1, reading: 'ミョウ', readingLevel: '中', isNew: true }
        ],
        kunReadings: [
          { id: 1, reading: 'あか', okurigana: '', readingLevel: '小' }
        ]
      }

      handleSaveReadings(saveData)

      expect(mockOnReadingRepo.create).toHaveBeenCalledWith({
        kanjiId: 1,
        reading: 'ミョウ',
        readingLevel: '中',
        displayOrder: 1
      })
    })

    it('updates existing on-readings', () => {
      const { handleSaveReadings } = useKanjiDetailReadingsHandlers(
        { kanjiId, onReadings, kunReadings },
        {
          onReadingRepo: mockOnReadingRepo as never,
          kunReadingRepo: mockKunReadingRepo as never
        }
      )

      const saveData: ReadingsSaveData = {
        onReadings: [{ id: 1, reading: 'メイ', readingLevel: '中' }],
        kunReadings: [
          { id: 1, reading: 'あか', okurigana: '', readingLevel: '小' }
        ]
      }

      handleSaveReadings(saveData)

      expect(mockOnReadingRepo.update).toHaveBeenCalledWith(1, {
        reading: 'メイ',
        readingLevel: '中'
      })
    })

    it('removes deleted on-readings', () => {
      onReadings.value = [mockOnReading({ id: 1 }), mockOnReading({ id: 2 })]

      const { handleSaveReadings } = useKanjiDetailReadingsHandlers(
        { kanjiId, onReadings, kunReadings },
        {
          onReadingRepo: mockOnReadingRepo as never,
          kunReadingRepo: mockKunReadingRepo as never
        }
      )

      const saveData: ReadingsSaveData = {
        onReadings: [{ id: 1, reading: 'メイ', readingLevel: '小' }],
        kunReadings: [
          { id: 1, reading: 'あか', okurigana: '', readingLevel: '小' }
        ]
      }

      handleSaveReadings(saveData)

      expect(mockOnReadingRepo.remove).toHaveBeenCalledWith(2)
    })

    it('creates new kun-readings with okurigana', () => {
      const { handleSaveReadings } = useKanjiDetailReadingsHandlers(
        { kanjiId, onReadings, kunReadings },
        {
          onReadingRepo: mockOnReadingRepo as never,
          kunReadingRepo: mockKunReadingRepo as never
        }
      )

      const saveData: ReadingsSaveData = {
        onReadings: [{ id: 1, reading: 'メイ', readingLevel: '小' }],
        kunReadings: [
          { id: 1, reading: 'あか', okurigana: '', readingLevel: '小' },
          {
            id: -1,
            reading: 'あか',
            okurigana: 'り',
            readingLevel: '小',
            isNew: true
          }
        ]
      }

      handleSaveReadings(saveData)

      expect(mockKunReadingRepo.create).toHaveBeenCalledWith({
        kanjiId: 1,
        reading: 'あか',
        okurigana: 'り',
        readingLevel: '小',
        displayOrder: 1
      })
    })
  })

  describe('reloadReadings', () => {
    it('reloads readings from repository', () => {
      const newOnReadings = [mockOnReading({ id: 3, reading: 'NEW' })]
      const newKunReadings = [mockKunReading({ id: 3, reading: 'new' })]
      mockOnReadingRepo.getByParentId.mockReturnValue(newOnReadings)
      mockKunReadingRepo.getByParentId.mockReturnValue(newKunReadings)

      const { reloadReadings } = useKanjiDetailReadingsHandlers(
        { kanjiId, onReadings, kunReadings },
        {
          onReadingRepo: mockOnReadingRepo as never,
          kunReadingRepo: mockKunReadingRepo as never
        }
      )

      reloadReadings()

      expect(onReadings.value).toEqual(newOnReadings)
      expect(kunReadings.value).toEqual(newKunReadings)
    })
  })
})
