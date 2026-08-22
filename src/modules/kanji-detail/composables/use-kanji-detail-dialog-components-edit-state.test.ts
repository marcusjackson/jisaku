/**
 * Tests for use-kanji-detail-dialog-components-edit-state
 */

import { ref } from 'vue'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useKanjiDetailDialogComponentsEditState } from './use-kanji-detail-dialog-components-edit-state'

import type {
  ComponentOccurrenceWithDetails,
  DialogComponentChanges
} from '../kanji-detail-types'

const mockCalculateSaveData = vi.fn()

vi.mock('./use-kanji-detail-dialog-components-save', () => ({
  useKanjiDetailDialogComponentsSave: () => ({
    calculateSaveData: mockCalculateSaveData
  })
}))

const sampleOccurrence: ComponentOccurrenceWithDetails = {
  id: 1,
  kanjiId: 5,
  componentId: 10,
  positionTypeId: 2,
  componentFormId: null,
  isRadical: false,
  analysisNotes: null,
  displayOrder: 0,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  component: { id: 10, character: '木', shortMeaning: null },
  position: {
    id: 2,
    positionName: 'left',
    nameJapanese: null,
    nameEnglish: null,
    description: null,
    displayOrder: 1,
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00'
  },
  form: null
}

describe('useKanjiDetailDialogComponentsEditState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const changes: DialogComponentChanges = {
      toLink: [],
      toUpdate: [],
      toDelete: []
    }
    mockCalculateSaveData.mockReturnValue(changes)
  })

  it('initializes editOccurrences from linkedOccurrences when isOpen is true', () => {
    const linkedOccurrences = ref<ComponentOccurrenceWithDetails[]>([
      sampleOccurrence
    ])
    const isOpen = ref(true)
    const emit = vi.fn()

    const { editOccurrences } = useKanjiDetailDialogComponentsEditState(
      linkedOccurrences,
      isOpen,
      emit
    )

    // watch is immediate, so editOccurrences should be set synchronously
    expect(editOccurrences.value).toHaveLength(1)
    expect(editOccurrences.value[0]?.componentId).toBe(10)
    expect(editOccurrences.value[0]?.positionTypeId).toBe(2)
    expect(editOccurrences.value[0]?.position).toBe('left')
  })

  it('does not initialize editOccurrences when isOpen is false', () => {
    const linkedOccurrences = ref<ComponentOccurrenceWithDetails[]>([
      sampleOccurrence
    ])
    const isOpen = ref(false)
    const emit = vi.fn()

    const { editOccurrences } = useKanjiDetailDialogComponentsEditState(
      linkedOccurrences,
      isOpen,
      emit
    )

    expect(editOccurrences.value).toHaveLength(0)
  })

  it('handleSave emits save event with calculateSaveData result and closes dialog', () => {
    const changes: DialogComponentChanges = {
      toLink: [
        {
          componentId: 5,
          positionTypeId: 1,
          componentFormId: null,
          isRadical: false
        }
      ],
      toUpdate: [],
      toDelete: []
    }
    mockCalculateSaveData.mockReturnValue(changes)

    const linkedOccurrences = ref<ComponentOccurrenceWithDetails[]>([])
    const isOpen = ref(false)
    const emit = vi.fn()

    const { handleSave } = useKanjiDetailDialogComponentsEditState(
      linkedOccurrences,
      isOpen,
      emit
    )

    handleSave()

    expect(emit).toHaveBeenCalledWith('save', changes)
    expect(emit).toHaveBeenCalledWith('update:open', false)
    expect(mockCalculateSaveData).toHaveBeenCalledTimes(1)
  })

  it('handleCancel emits update:open false', () => {
    const linkedOccurrences = ref<ComponentOccurrenceWithDetails[]>([])
    const isOpen = ref(false)
    const emit = vi.fn()

    const { handleCancel } = useKanjiDetailDialogComponentsEditState(
      linkedOccurrences,
      isOpen,
      emit
    )

    handleCancel()

    expect(emit).toHaveBeenCalledWith('update:open', false)
    expect(emit).toHaveBeenCalledTimes(1)
  })

  it('maps null position to null string', () => {
    const occWithNullPosition: ComponentOccurrenceWithDetails = {
      ...sampleOccurrence,
      position: null
    }
    const linkedOccurrences = ref<ComponentOccurrenceWithDetails[]>([
      occWithNullPosition
    ])
    const isOpen = ref(true)
    const emit = vi.fn()

    const { editOccurrences } = useKanjiDetailDialogComponentsEditState(
      linkedOccurrences,
      isOpen,
      emit
    )

    expect(editOccurrences.value[0]?.position).toBeNull()
  })
})
