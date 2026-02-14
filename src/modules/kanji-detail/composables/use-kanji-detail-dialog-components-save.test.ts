/**
 * Tests for use-kanji-detail-dialog-components-save
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useKanjiDetailDialogComponentsSave } from './use-kanji-detail-dialog-components-save'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'
import type { EditOccurrence } from '../utils/edit-occurrence-types'

describe('use-kanji-detail-dialog-components-save', () => {
  it('returns calculateSaveData function', () => {
    const editOccurrences = ref<EditOccurrence[]>([])
    const originalOccurrences = ref<ComponentOccurrenceWithDetails[]>([])

    const { calculateSaveData } = useKanjiDetailDialogComponentsSave(
      editOccurrences,
      originalOccurrences
    )

    expect(calculateSaveData).toBeDefined()
  })

  it('identifies new occurrences to link', () => {
    const editOccurrences = ref<EditOccurrence[]>([
      {
        id: null,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null
      }
    ])
    const originalOccurrences = ref<ComponentOccurrenceWithDetails[]>([])

    const { calculateSaveData } = useKanjiDetailDialogComponentsSave(
      editOccurrences,
      originalOccurrences
    )

    const result = calculateSaveData()

    expect(result.toLink).toHaveLength(1)
    expect(result.toLink[0]?.componentId).toBe(1)
    expect(result.toUpdate).toHaveLength(0)
    expect(result.toDelete).toHaveLength(0)
  })

  it('identifies updated occurrences', () => {
    const editOccurrences = ref<EditOccurrence[]>([
      {
        id: 1,
        componentId: 1,
        positionTypeId: 2,
        componentFormId: null,
        isRadical: true,
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: 'Left',
        form: null
      }
    ])
    const originalOccurrences = ref<ComponentOccurrenceWithDetails[]>([
      {
        id: 1,
        kanjiId: 1,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        analysisNotes: null,
        displayOrder: 0,
        createdAt: '',
        updatedAt: '',
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null
      }
    ])

    const { calculateSaveData } = useKanjiDetailDialogComponentsSave(
      editOccurrences,
      originalOccurrences
    )

    const result = calculateSaveData()

    expect(result.toLink).toHaveLength(0)
    expect(result.toUpdate).toHaveLength(1)
    expect(result.toUpdate[0]?.id).toBe(1)
    expect(result.toUpdate[0]?.isRadical).toBe(true)
    expect(result.toDelete).toHaveLength(0)
  })

  it('identifies deleted occurrences', () => {
    const editOccurrences = ref<EditOccurrence[]>([
      {
        id: 1,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        markedForDeletion: true,
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null
      }
    ])
    const originalOccurrences = ref<ComponentOccurrenceWithDetails[]>([
      {
        id: 1,
        kanjiId: 1,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        analysisNotes: null,
        displayOrder: 0,
        createdAt: '',
        updatedAt: '',
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null
      }
    ])

    const { calculateSaveData } = useKanjiDetailDialogComponentsSave(
      editOccurrences,
      originalOccurrences
    )

    const result = calculateSaveData()

    expect(result.toLink).toHaveLength(0)
    expect(result.toUpdate).toHaveLength(0)
    expect(result.toDelete).toHaveLength(1)
    expect(result.toDelete[0]).toBe(1)
  })

  it('handles multiple operation types simultaneously', () => {
    const editOccurrences = ref<EditOccurrence[]>([
      // New occurrence to link
      {
        id: null,
        componentId: 2,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        component: { id: 2, character: '月', shortMeaning: 'moon' },
        position: null,
        form: null
      },
      // Updated occurrence
      {
        id: 1,
        componentId: 1,
        positionTypeId: 1,
        componentFormId: null,
        isRadical: true,
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: 'Left',
        form: null
      },
      // Deleted occurrence
      {
        id: 3,
        componentId: 3,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        markedForDeletion: true,
        component: { id: 3, character: '山', shortMeaning: 'mountain' },
        position: null,
        form: null
      }
    ])
    const originalOccurrences = ref<ComponentOccurrenceWithDetails[]>([
      {
        id: 1,
        kanjiId: 1,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        analysisNotes: null,
        displayOrder: 0,
        createdAt: '',
        updatedAt: '',
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null
      },
      {
        id: 3,
        kanjiId: 1,
        componentId: 3,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        analysisNotes: null,
        displayOrder: 1,
        createdAt: '',
        updatedAt: '',
        component: { id: 3, character: '山', shortMeaning: 'mountain' },
        position: null,
        form: null
      }
    ])

    const { calculateSaveData } = useKanjiDetailDialogComponentsSave(
      editOccurrences,
      originalOccurrences
    )

    const result = calculateSaveData()

    expect(result.toLink).toHaveLength(1)
    expect(result.toLink[0]?.componentId).toBe(2)
    expect(result.toUpdate).toHaveLength(1)
    expect(result.toUpdate[0]?.id).toBe(1)
    expect(result.toDelete).toHaveLength(1)
    expect(result.toDelete[0]).toBe(3)
  })
})
