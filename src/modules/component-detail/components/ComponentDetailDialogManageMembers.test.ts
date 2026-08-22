/**
 * Tests for ComponentDetailDialogManageMembers component.
 *
 * TDD tests for the manage members dialog.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailDialogManageMembers from './ComponentDetailDialogManageMembers.vue'

import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/api/component'

// ============================================================================
// Stubs
// ============================================================================

const BaseDialogStub = {
  name: 'BaseDialog',
  template: `<div v-if="open" data-testid="dialog">
    <h1>{{ title }}</h1>
    <slot />
  </div>`,
  props: ['open', 'title']
}

const BaseButtonStub = {
  name: 'BaseButton',
  template: `<button :disabled="disabled" @click="$emit('click')"><slot /></button>`,
  props: ['disabled', 'variant', 'size']
}

// ============================================================================
// Factories
// ============================================================================

function makeGrouping(
  overrides: Partial<ComponentGroupingWithMembers> = {}
): ComponentGroupingWithMembers {
  return {
    id: 1,
    componentId: 10,
    name: 'Left side',
    description: null,
    displayOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    occurrenceCount: 0,
    ...overrides
  }
}

function makeOccurrence(
  overrides: Partial<OccurrenceWithKanji> = {}
): OccurrenceWithKanji {
  return {
    id: 100,
    kanjiId: 200,
    componentId: 10,
    componentFormId: null,
    positionTypeId: null,
    isRadical: false,
    analysisNotes: null,
    displayOrder: 0,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    kanji: {
      id: 200,
      character: '木',
      shortMeaning: 'tree',
      strokeCount: 4
    },
    position: null,
    ...overrides
  }
}

function makeMember(
  overrides: Partial<ComponentGroupingMember> = {}
): ComponentGroupingMember {
  return {
    id: 1,
    groupingId: 1,
    occurrenceId: 100,
    displayOrder: 0,
    ...overrides
  }
}

// ============================================================================
// Tests
// ============================================================================

describe('ComponentDetailDialogManageMembers', () => {
  const occ1 = makeOccurrence({
    id: 100,
    kanji: { id: 200, character: '木', shortMeaning: 'tree', strokeCount: 4 }
  })
  const occ2 = makeOccurrence({
    id: 101,
    kanji: { id: 201, character: '林', shortMeaning: 'grove', strokeCount: 8 }
  })
  const occ3 = makeOccurrence({
    id: 102,
    kanji: { id: 202, character: '森', shortMeaning: 'forest', strokeCount: 12 }
  })

  const mem1 = makeMember({ id: 1, occurrenceId: 100, displayOrder: 0 })
  const mem2 = makeMember({ id: 2, occurrenceId: 101, displayOrder: 1 })

  const createWrapper = (props = {}) => {
    return mount(ComponentDetailDialogManageMembers, {
      props: {
        open: true,
        grouping: makeGrouping(),
        members: [],
        occurrences: [occ1, occ2, occ3],
        ...props
      },
      global: {
        stubs: {
          BaseDialog: BaseDialogStub,
          BaseButton: BaseButtonStub
        }
      }
    })
  }

  describe('rendering', () => {
    it('shows grouping name in title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h1').text()).toContain('Left side')
    })

    it('renders member list in displayOrder', () => {
      const wrapper = createWrapper({
        members: [mem2, mem1]
      })

      const memberItems = wrapper.findAll('[data-testid="member-item"]')
      expect(memberItems).toHaveLength(2)
      // mem1 (displayOrder 0) should be first
      expect(memberItems[0]!.text()).toContain('木')
      expect(memberItems[1]!.text()).toContain('林')
    })

    it('excludes already-added members from available list', () => {
      const wrapper = createWrapper({
        members: [mem1, mem2]
      })

      const availableItems = wrapper.findAll('[data-testid="available-item"]')
      // Only occ3 (森) should be available
      expect(availableItems).toHaveLength(1)
      expect(availableItems[0]!.text()).toContain('森')
    })

    it('shows empty state when no occurrences exist', () => {
      const wrapper = createWrapper({ occurrences: [] })

      expect(wrapper.text()).toContain('No kanji')
    })
  })

  describe('add member', () => {
    it('emits add-member with occurrenceId when Add clicked', async () => {
      const wrapper = createWrapper({ members: [] })

      const addButtons = wrapper.findAll('[data-testid^="add-member-"]')
      await addButtons[0]!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('add-member')).toBeDefined()
      expect(wrapper.emitted('add-member')![0]).toEqual([100])
    })
  })

  describe('remove member', () => {
    it('emits remove-member with occurrenceId when Remove clicked', async () => {
      const wrapper = createWrapper({ members: [mem1] })

      const removeBtn = wrapper.find('[data-testid="remove-member-100"]')
      await removeBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('remove-member')).toBeDefined()
      expect(wrapper.emitted('remove-member')![0]).toEqual([100])
    })
  })

  describe('reorder members', () => {
    it('disables up button for first member', () => {
      const wrapper = createWrapper({ members: [mem1, mem2] })

      const upBtn = wrapper.find('[data-testid="move-up-100"]')
      expect((upBtn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('disables down button for last member', () => {
      const wrapper = createWrapper({ members: [mem1, mem2] })

      const downBtn = wrapper.find('[data-testid="move-down-101"]')
      expect((downBtn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('emits reorder-members with swapped ids on move down', async () => {
      const wrapper = createWrapper({ members: [mem1, mem2] })

      const downBtn = wrapper.find('[data-testid="move-down-100"]')
      await downBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('reorder-members')).toBeDefined()
      // After moving first item down: [101, 100]
      expect(wrapper.emitted('reorder-members')![0]).toEqual([[101, 100]])
    })

    it('emits reorder-members with swapped ids on move up', async () => {
      const wrapper = createWrapper({ members: [mem1, mem2] })

      const upBtn = wrapper.find('[data-testid="move-up-101"]')
      await upBtn.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('reorder-members')).toBeDefined()
      // After moving second item up: [101, 100]
      expect(wrapper.emitted('reorder-members')![0]).toEqual([[101, 100]])
    })
  })
})
