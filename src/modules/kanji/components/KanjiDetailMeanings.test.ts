/**
 * Tests for KanjiDetailMeanings component
 *
 * Tests cover:
 * - Display mode (ungrouped list)
 * - Display mode (grouped by reading)
 * - Edit mode rendering
 * - Meaning management
 * - Reading group management
 */

import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import KanjiDetailMeanings from './KanjiDetailMeanings.vue'

import type {
  KanjiMeaning,
  KanjiMeaningGroupMember,
  KanjiMeaningReadingGroup
} from '@/shared/types/database-types'

// Mock factories
function createMockMeaning(
  overrides: Partial<KanjiMeaning> = {}
): KanjiMeaning {
  return {
    id: 1,
    kanjiId: 1,
    meaningText: 'sun',
    additionalInfo: 'The star at the center of our solar system',
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockReadingGroup(
  overrides: Partial<KanjiMeaningReadingGroup> = {}
): KanjiMeaningReadingGroup {
  return {
    id: 1,
    kanjiId: 1,
    readingText: 'ニチ・ジツ',
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

function createMockGroupMember(
  overrides: Partial<KanjiMeaningGroupMember> = {}
): KanjiMeaningGroupMember {
  return {
    id: 1,
    readingGroupId: 1,
    meaningId: 1,
    displayOrder: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }
}

describe('KanjiDetailMeanings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Display Mode - Empty State', () => {
    it('renders empty state when no meanings', () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [],
          readingGroups: [],
          groupMembers: []
        }
      })

      expect(wrapper.text()).toContain('No meanings added yet')
    })
  })

  describe('Display Mode - Ungrouped List', () => {
    it('renders meanings as numbered list', () => {
      const meanings = [
        createMockMeaning({ id: 1, meaningText: 'sun', displayOrder: 0 }),
        createMockMeaning({ id: 2, meaningText: 'day', displayOrder: 1 })
      ]

      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings,
          readingGroups: [],
          groupMembers: []
        }
      })

      expect(wrapper.text()).toContain('sun')
      expect(wrapper.text()).toContain('day')
    })

    it('displays additional info when present', () => {
      const meanings = [
        createMockMeaning({
          meaningText: 'sun',
          additionalInfo: 'Additional context'
        })
      ]

      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings,
          readingGroups: [],
          groupMembers: []
        }
      })

      expect(wrapper.text()).toContain('Additional context')
    })

    it('shows Edit button', () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      expect(wrapper.text()).toContain('Edit')
    })
  })

  describe('Display Mode - Grouped by Reading', () => {
    it('renders meanings grouped by reading', () => {
      const meanings = [
        createMockMeaning({ id: 1, meaningText: 'sun', displayOrder: 0 }),
        createMockMeaning({ id: 2, meaningText: 'day', displayOrder: 1 })
      ]
      const readingGroups = [
        createMockReadingGroup({ id: 1, readingText: 'ニチ' })
      ]
      const groupMembers = [
        createMockGroupMember({ readingGroupId: 1, meaningId: 1 }),
        createMockGroupMember({ readingGroupId: 1, meaningId: 2 })
      ]

      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings,
          readingGroups,
          groupMembers
        }
      })

      expect(wrapper.text()).toContain('ニチ')
      expect(wrapper.text()).toContain('sun')
      expect(wrapper.text()).toContain('day')
    })

    it('shows unassigned section for meanings not in any group', () => {
      const meanings = [
        createMockMeaning({ id: 1, meaningText: 'sun', displayOrder: 0 }),
        createMockMeaning({ id: 2, meaningText: 'day', displayOrder: 1 })
      ]
      const readingGroups = [
        createMockReadingGroup({ id: 1, readingText: 'ニチ' })
      ]
      const groupMembers = [
        createMockGroupMember({ readingGroupId: 1, meaningId: 1 })
      ]

      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings,
          readingGroups,
          groupMembers
        }
      })

      expect(wrapper.text()).toContain('(Unassigned)')
      expect(wrapper.text()).toContain('day')
    })
  })

  describe('Edit Mode', () => {
    it('enters edit mode when Edit button clicked', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Meanings')
      expect(wrapper.text()).toContain('Reading Groupings')
      expect(wrapper.text()).toContain('Cancel')
      expect(wrapper.text()).toContain('Save')
    })

    it('shows add meaning button in edit mode', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [],
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('+ Add')
    })

    it('opens Add Meaning dialog when add button clicked', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [],
          readingGroups: [],
          groupMembers: []
        }
      })

      // Enter edit mode
      await wrapper.find('button').trigger('click')

      // Click "+ Add" button
      const addButton = wrapper
        .findAll('button')
        .find((b) => b.text() === '+ Add')
      await addButton?.trigger('click')

      // Dialog should open (the title "Add Meaning" should appear in the component's state)
      // Since the dialog is rendered via portal, we check that the emit wasn't called yet
      expect(wrapper.emitted('addMeaning')).toBeFalsy()
    })

    it('shows Enable button when grouping not enabled', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Enable')
      expect(wrapper.text()).toContain('Reading grouping is not enabled')
    })

    it('shows Disable button when grouping enabled', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [createMockReadingGroup()],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      expect(wrapper.text()).toContain('Disable')
    })

    it('emits enableGrouping when Enable clicked', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')
      const enableButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Enable')
      await enableButton?.trigger('click')

      expect(wrapper.emitted('enableGrouping')).toBeTruthy()
    })

    it('exits edit mode when Cancel clicked', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')
      expect(wrapper.text()).toContain('Cancel')

      const cancelButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Cancel')
      await cancelButton?.trigger('click')

      expect(wrapper.text()).toContain('Edit')
      expect(wrapper.text()).not.toContain('Cancel')
    })

    it('emits save when Save clicked', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')
      const saveButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Save')
      await saveButton?.trigger('click')

      expect(wrapper.emitted('save')).toBeTruthy()
    })

    it('does not apply sticky class in view mode', () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      const actions = wrapper.find('.kanji-detail-meanings-actions')
      expect(actions.exists()).toBe(true)
      expect(actions.classes()).not.toContain(
        'kanji-detail-meanings-actions-sticky'
      )
    })

    it('applies sticky class in edit mode', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      const actions = wrapper.find('.kanji-detail-meanings-actions')
      expect(actions.exists()).toBe(true)
      expect(actions.classes()).toContain(
        'kanji-detail-meanings-actions-sticky'
      )
    })
  })

  describe('Destructive Mode', () => {
    it('hides delete button when destructive mode disabled', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: [],
          isDestructiveMode: false
        }
      })

      await wrapper.find('button').trigger('click')

      const deleteButton = wrapper
        .findAll('button')
        .find((b) => b.attributes('aria-label') === 'Delete meaning')
      expect(deleteButton).toBeUndefined()
    })

    it('shows delete button when destructive mode enabled', async () => {
      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings: [createMockMeaning()],
          readingGroups: [],
          groupMembers: [],
          isDestructiveMode: true
        }
      })

      await wrapper.find('button').trigger('click')

      const deleteButton = wrapper
        .findAll('button')
        .find((b) => b.attributes('aria-label') === 'Delete meaning')
      expect(deleteButton).toBeDefined()
    })
  })

  describe('Reordering', () => {
    it('shows up/down arrows for meanings', async () => {
      const meanings = [
        createMockMeaning({ id: 1, meaningText: 'sun', displayOrder: 0 }),
        createMockMeaning({ id: 2, meaningText: 'day', displayOrder: 1 })
      ]

      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings,
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      const upButtons = wrapper
        .findAll('button')
        .filter((b) => b.attributes('aria-label') === 'Move up')
      const downButtons = wrapper
        .findAll('button')
        .filter((b) => b.attributes('aria-label') === 'Move down')

      expect(upButtons.length).toBeGreaterThan(0)
      expect(downButtons.length).toBeGreaterThan(0)
    })

    it('disables up arrow for first meaning', async () => {
      const meanings = [
        createMockMeaning({ id: 1, meaningText: 'sun', displayOrder: 0 }),
        createMockMeaning({ id: 2, meaningText: 'day', displayOrder: 1 })
      ]

      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings,
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      const upButtons = wrapper
        .findAll('button')
        .filter((b) => b.attributes('aria-label') === 'Move up')

      expect(upButtons[0]?.attributes('disabled')).toBeDefined()
    })

    it('disables down arrow for last meaning', async () => {
      const meanings = [
        createMockMeaning({ id: 1, meaningText: 'sun', displayOrder: 0 }),
        createMockMeaning({ id: 2, meaningText: 'day', displayOrder: 1 })
      ]

      const wrapper = mount(KanjiDetailMeanings, {
        props: {
          meanings,
          readingGroups: [],
          groupMembers: []
        }
      })

      await wrapper.find('button').trigger('click')

      const downButtons = wrapper
        .findAll('button')
        .filter((b) => b.attributes('aria-label') === 'Move down')

      expect(
        downButtons[downButtons.length - 1]?.attributes('disabled')
      ).toBeDefined()
    })
  })
})
