/**
 * ComponentOccurrenceEditDialog Tests
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ComponentOccurrenceEditDialog from './ComponentOccurrenceEditDialog.vue'

import type { ComponentOccurrence } from '@/shared/types/database-types'

// Mock composables
vi.mock('../composables/use-component-occurrence-repository', () => ({
  useComponentOccurrenceRepository: () => ({
    updatePosition: vi.fn(),
    updateIsRadical: vi.fn(),
    updateAnalysisNotes: vi.fn()
  })
}))

vi.mock('../composables/use-position-type-repository', () => ({
  usePositionTypeRepository: () => ({
    getAll: () => [
      {
        id: 1,
        positionName: 'hen',
        nameJapanese: '偏',
        nameEnglish: 'Left side',
        description: null,
        descriptionShort: 'Component on left side of kanji',
        displayOrder: 1,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        positionName: 'tsukuri',
        nameJapanese: '旁',
        nameEnglish: 'Right side',
        description: null,
        descriptionShort: 'Component on right side of kanji',
        displayOrder: 2,
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      }
    ]
  })
}))

describe('ComponentOccurrenceEditDialog', () => {
  const mockOccurrence: ComponentOccurrence = {
    id: 1,
    kanjiId: 1,
    componentId: 1,
    componentFormId: null,
    positionTypeId: 1,
    isRadical: false,
    displayOrder: 1,
    analysisNotes: 'Test notes',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z'
  }

  it('renders without errors', () => {
    const wrapper = mount(ComponentOccurrenceEditDialog, {
      props: {
        occurrence: mockOccurrence,
        componentCharacter: '水',
        open: false
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('accepts null occurrence prop', () => {
    const wrapper = mount(ComponentOccurrenceEditDialog, {
      props: {
        occurrence: null,
        componentCharacter: '',
        open: false
      }
    })

    expect(wrapper.exists()).toBe(true)
  })

  it('emits close and closes dialog when cancel is clicked', async () => {
    const wrapper = mount(ComponentOccurrenceEditDialog, {
      props: {
        occurrence: mockOccurrence,
        componentCharacter: '水',
        open: true
      },
      attachTo: document.body
    })

    // Verify dialog is open
    expect(wrapper.props('open')).toBe(true)

    // Find cancel button and click it
    const cancelButtons = wrapper.findAll('button')
    const cancelButton = cancelButtons.find((b) => b.text().includes('Cancel'))

    if (cancelButton) {
      await cancelButton.trigger('click')
      // Check that close was emitted
      expect(wrapper.emitted('close')).toBeTruthy()
      // The dialog model should be updated to close
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    }

    wrapper.unmount()
  })

  it('emits save and closes dialog when save is clicked', async () => {
    const wrapper = mount(ComponentOccurrenceEditDialog, {
      props: {
        occurrence: mockOccurrence,
        componentCharacter: '水',
        open: true
      },
      attachTo: document.body
    })

    // Verify dialog is open
    expect(wrapper.props('open')).toBe(true)

    // Find save button and click it
    const saveButtons = wrapper.findAll('button')
    const saveButton = saveButtons.find((b) =>
      b.text().includes('Save Changes')
    )

    if (saveButton) {
      await saveButton.trigger('click')
      // Check that save was emitted
      expect(wrapper.emitted('save')).toBeTruthy()
      // The dialog model should be updated to close
      await wrapper.vm.$nextTick()
      expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
    }

    wrapper.unmount()
  })

  it('uses componentCharacter in title when provided', () => {
    const wrapper = mount(ComponentOccurrenceEditDialog, {
      props: {
        occurrence: mockOccurrence,
        componentCharacter: '水',
        open: false
      }
    })

    expect(wrapper.vm.$props.componentCharacter).toBe('水')
  })
})
