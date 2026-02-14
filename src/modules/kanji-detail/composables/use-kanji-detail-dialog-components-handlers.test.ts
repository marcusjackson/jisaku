/**
 * Tests for use-kanji-detail-dialog-components-handlers
 */

import { ref } from 'vue'

import { describe, expect, it } from 'vitest'

import { useKanjiDetailDialogComponentsHandlers } from './use-kanji-detail-dialog-components-handlers'

import type { EditOccurrence } from '../utils/edit-occurrence-types'
import type { Component } from '@/api/component/component-types'

describe('use-kanji-detail-dialog-components-handlers', () => {
  const mockComponents: Component[] = [
    {
      id: 1,
      character: '日',
      shortMeaning: 'sun',
      strokeCount: 4,
      searchKeywords: '',
      sourceKanjiId: null,
      description: null,
      canBeRadical: false,
      kangxiNumber: null,
      kangxiMeaning: null,
      radicalNameJapanese: null,
      createdAt: '',
      updatedAt: ''
    }
  ]

  it('returns handler functions', () => {
    const editOccurrences = ref<EditOccurrence[]>([])
    const pendingRemoveOccurrenceId = ref<number | null>(null)
    const showConfirmDialog = ref(false)

    const handlers = useKanjiDetailDialogComponentsHandlers(
      editOccurrences,
      mockComponents,
      pendingRemoveOccurrenceId,
      showConfirmDialog
    )

    expect(handlers.handleComponentSelect).toBeDefined()
    expect(handlers.handleOccurrenceUpdate).toBeDefined()
    expect(handlers.handleUnlinkRequest).toBeDefined()
    expect(handlers.handleUnlinkConfirm).toBeDefined()
    expect(handlers.getVisibleOccurrences).toBeDefined()
  })

  it('handleComponentSelect adds new occurrence', () => {
    const editOccurrences = ref<EditOccurrence[]>([])
    const pendingRemoveOccurrenceId = ref<number | null>(null)
    const showConfirmDialog = ref(false)

    const handlers = useKanjiDetailDialogComponentsHandlers(
      editOccurrences,
      mockComponents,
      pendingRemoveOccurrenceId,
      showConfirmDialog
    )

    handlers.handleComponentSelect(1)

    expect(editOccurrences.value).toHaveLength(1)
    expect(editOccurrences.value[0]?.componentId).toBe(1)
    expect(editOccurrences.value[0]?.id).toBeNull()
  })

  it('handleOccurrenceUpdate updates occurrence fields', () => {
    const editOccurrences = ref<EditOccurrence[]>([
      {
        id: 1,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null
      }
    ])
    const pendingRemoveOccurrenceId = ref<number | null>(null)
    const showConfirmDialog = ref(false)

    const handlers = useKanjiDetailDialogComponentsHandlers(
      editOccurrences,
      mockComponents,
      pendingRemoveOccurrenceId,
      showConfirmDialog
    )

    handlers.handleOccurrenceUpdate(1, 1, 'isRadical', true)

    expect(editOccurrences.value[0]?.isRadical).toBe(true)
  })

  it('handleUnlinkRequest removes new occurrence immediately', () => {
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
    const pendingRemoveOccurrenceId = ref<number | null>(null)
    const showConfirmDialog = ref(false)

    const handlers = useKanjiDetailDialogComponentsHandlers(
      editOccurrences,
      mockComponents,
      pendingRemoveOccurrenceId,
      showConfirmDialog
    )

    handlers.handleUnlinkRequest(null, 1)

    expect(editOccurrences.value).toHaveLength(0)
  })

  it('handleUnlinkRequest shows confirmation for existing occurrence', () => {
    const editOccurrences = ref<EditOccurrence[]>([
      {
        id: 1,
        componentId: 1,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        component: { id: 1, character: '日', shortMeaning: 'sun' },
        position: null,
        form: null
      }
    ])
    const pendingRemoveOccurrenceId = ref<number | null>(null)
    const showConfirmDialog = ref(false)

    const handlers = useKanjiDetailDialogComponentsHandlers(
      editOccurrences,
      mockComponents,
      pendingRemoveOccurrenceId,
      showConfirmDialog
    )

    handlers.handleUnlinkRequest(1, 1)

    expect(showConfirmDialog.value).toBe(true)
    expect(pendingRemoveOccurrenceId.value).toBe(1)
  })

  it('getVisibleOccurrences filters out marked for deletion', () => {
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
      },
      {
        id: 2,
        componentId: 2,
        positionTypeId: null,
        componentFormId: null,
        isRadical: false,
        component: { id: 2, character: '月', shortMeaning: 'moon' },
        position: null,
        form: null
      }
    ])
    const pendingRemoveOccurrenceId = ref<number | null>(null)
    const showConfirmDialog = ref(false)

    const handlers = useKanjiDetailDialogComponentsHandlers(
      editOccurrences,
      mockComponents,
      pendingRemoveOccurrenceId,
      showConfirmDialog
    )

    const visible = handlers.getVisibleOccurrences()

    expect(visible).toHaveLength(1)
    expect(visible[0]?.id).toBe(2)
  })
})
