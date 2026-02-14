/**
 * Tests for edit-occurrence-types
 *
 * This file only exports TypeScript interfaces, so we test type compatibility
 */

import { describe, expect, it } from 'vitest'

import type { EditOccurrence } from './edit-occurrence-types'

describe('edit-occurrence-types', () => {
  it('EditOccurrence type allows null id for new occurrences', () => {
    const newOccurrence: EditOccurrence = {
      id: null,
      componentId: 1,
      positionTypeId: null,
      componentFormId: null,
      isRadical: false,
      component: {
        id: 1,
        character: '日',
        shortMeaning: 'sun'
      },
      position: null,
      form: null
    }

    expect(newOccurrence.id).toBeNull()
  })

  it('EditOccurrence type allows number id for existing occurrences', () => {
    const existingOccurrence: EditOccurrence = {
      id: 1,
      componentId: 1,
      positionTypeId: null,
      componentFormId: null,
      isRadical: false,
      component: {
        id: 1,
        character: '日',
        shortMeaning: 'sun'
      },
      position: null,
      form: null
    }

    expect(existingOccurrence.id).toBe(1)
  })

  it('EditOccurrence type allows markedForDeletion flag', () => {
    const markedOccurrence: EditOccurrence = {
      id: 1,
      componentId: 1,
      positionTypeId: null,
      componentFormId: null,
      isRadical: false,
      markedForDeletion: true,
      component: {
        id: 1,
        character: '日',
        shortMeaning: 'sun'
      },
      position: null,
      form: null
    }

    expect(markedOccurrence.markedForDeletion).toBe(true)
  })

  it('EditOccurrence type allows position as string', () => {
    const occurrence: EditOccurrence = {
      id: 1,
      componentId: 1,
      positionTypeId: 1,
      componentFormId: null,
      isRadical: false,
      component: {
        id: 1,
        character: '日',
        shortMeaning: 'sun'
      },
      position: 'Left',
      form: null
    }

    expect(occurrence.position).toBe('Left')
  })
})
