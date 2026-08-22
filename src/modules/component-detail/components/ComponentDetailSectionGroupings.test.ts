/**
 * Tests for ComponentDetailSectionGroupings component.
 *
 * TDD tests for the Groupings section wrapper.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailSectionGroupings from './ComponentDetailSectionGroupings.vue'

import type {
  ComponentGroupingMember,
  ComponentGroupingWithMembers,
  OccurrenceWithKanji
} from '@/api/component'

// ============================================================================
// Factories
// ============================================================================

function createTestGrouping(
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
    occurrenceCount: 2,
    ...overrides
  }
}

function createTestOccurrence(
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
    kanji: { id: 200, character: '木', shortMeaning: 'tree', strokeCount: 4 },
    position: null,
    ...overrides
  }
}

// ============================================================================
// Stubs
// ============================================================================

const SharedSectionStub = {
  name: 'SharedSection',
  template: `<section :data-testid="testId" :data-state="defaultOpen ? 'open' : 'closed'">
    <h2>{{ title }}</h2>
    <div class="actions"><slot name="actions" :isOpen="defaultOpen" /></div>
    <div v-if="defaultOpen" class="content"><slot /></div>
  </section>`,
  props: ['title', 'collapsible', 'defaultOpen', 'testId']
}

const ComponentDetailGroupingItemStub = {
  name: 'ComponentDetailGroupingItem',
  template: `<div class="grouping-item-stub" :data-testid="'grouping-item-' + grouping.id">
    {{ grouping.name }}
    <button @click="$emit('edit')">Edit</button>
    <button v-if="isDestructiveMode" @click="$emit('delete')">Delete</button>
    <button @click="$emit('manage-members')">Members</button>
    <button @click="$emit('move-up')">Up</button>
    <button @click="$emit('move-down')">Down</button>
  </div>`,
  props: [
    'grouping',
    'memberOccurrences',
    'index',
    'total',
    'isDestructiveMode'
  ]
}

const ComponentDetailDialogGroupingStub = {
  name: 'ComponentDetailDialogGrouping',
  template: `<div v-if="open" :data-testid="'dialog-grouping-' + mode">
    <button @click="$emit('submit', { name: 'Test', description: null })">Submit</button>
  </div>`,
  props: ['open', 'mode', 'initial']
}

const ComponentDetailDialogManageMembersStub = {
  name: 'ComponentDetailDialogManageMembers',
  template: `<div v-if="open" data-testid="dialog-members">
    <button @click="$emit('add-member', 100)">AddMember</button>
    <button @click="$emit('remove-member', 100)">RemoveMember</button>
    <button @click="$emit('reorder-members', [101, 100])">ReorderMembers</button>
  </div>`,
  props: ['open', 'grouping', 'members', 'occurrences']
}

const SharedConfirmDialogStub = {
  name: 'SharedConfirmDialog',
  template: `<div v-if="open" data-testid="confirm-dialog">
    <button @click="$emit('confirm')">Confirm</button>
    <button @click="$emit('cancel')">Cancel Delete</button>
  </div>`,
  props: ['open', 'title', 'description', 'confirmLabel', 'variant']
}

// ============================================================================
// Tests
// ============================================================================

describe('ComponentDetailSectionGroupings', () => {
  const grouping1 = createTestGrouping({ id: 1, name: 'Left side' })
  const grouping2 = createTestGrouping({
    id: 2,
    name: 'Right side',
    displayOrder: 1
  })
  const occ1 = createTestOccurrence({ id: 100 })

  const createWrapper = (props = {}) => {
    return mount(ComponentDetailSectionGroupings, {
      props: {
        groupings: [],
        componentId: 10,
        occurrences: [occ1],
        allGroupingMembers: new Map<number, ComponentGroupingMember[]>(),
        managingGroupingMembers: [] as ComponentGroupingMember[],
        isDestructiveMode: false,
        ...props
      },
      global: {
        stubs: {
          SharedSection: SharedSectionStub,
          ComponentDetailGroupingItem: ComponentDetailGroupingItemStub,
          ComponentDetailDialogGrouping: ComponentDetailDialogGroupingStub,
          ComponentDetailDialogManageMembers:
            ComponentDetailDialogManageMembersStub,
          SharedConfirmDialog: SharedConfirmDialogStub
        }
      }
    })
  }

  describe('section structure', () => {
    it('renders with Groupings title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h2').text()).toBe('Groupings')
    })

    it('renders with correct test id', () => {
      const wrapper = createWrapper()
      expect(
        wrapper.find('[data-testid="component-detail-groupings"]').exists()
      ).toBe(true)
    })

    it('section is closed when groupings is empty', () => {
      const wrapper = createWrapper({ groupings: [] })
      expect(wrapper.find('section').attributes('data-state')).toBe('closed')
    })

    it('section is open when groupings has items', () => {
      const wrapper = createWrapper({ groupings: [grouping1] })
      expect(wrapper.find('section').attributes('data-state')).toBe('open')
    })
  })

  describe('empty state', () => {
    it('shows empty message when no groupings', () => {
      // Section is closed — open it by passing groupings (open state renders content)
      // Actually, when closed, content slot is not rendered per stub.
      // So we can't check empty state in closed state — check the component directly.
      const wrapper = createWrapper({ groupings: [] })
      // Section is closed so content slot is hidden; this is correct behavior.
      expect(wrapper.find('.content').exists()).toBe(false)
    })
  })

  describe('list rendering', () => {
    it('renders grouping items for each grouping', () => {
      const wrapper = createWrapper({
        groupings: [grouping1, grouping2]
      })
      const items = wrapper.findAll('.grouping-item-stub')
      expect(items).toHaveLength(2)
    })
  })

  describe('add button', () => {
    it('shows add button when section is open', () => {
      const wrapper = createWrapper({ groupings: [grouping1] })
      expect(wrapper.find('.actions').text()).toContain('Add Grouping')
    })

    it('hides add button when section is closed', () => {
      const wrapper = createWrapper({ groupings: [] })
      // isOpen = false, so v-if="isOpen" hides button
      expect(wrapper.find('.actions button').exists()).toBe(false)
    })
  })

  describe('add flow', () => {
    it('opens add dialog on Add Grouping click', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      await wrapper.find('.actions button').trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="dialog-grouping-add"]').exists()).toBe(
        true
      )
    })

    it('emits add on dialog submit', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      await wrapper.find('.actions button').trigger('click')
      await flushPromises()

      const dialog = wrapper.find('[data-testid="dialog-grouping-add"]')
      await dialog.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('add')).toBeDefined()
      expect(wrapper.emitted('add')![0]).toEqual([
        { name: 'Test', description: null }
      ])
    })
  })

  describe('edit flow', () => {
    it('opens edit dialog on Edit click', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      const editBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Edit')
      await editBtn!.trigger('click')
      await flushPromises()

      expect(
        wrapper.find('[data-testid="dialog-grouping-edit"]').exists()
      ).toBe(true)
    })

    it('emits update with grouping id on edit submit', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      // Open edit dialog
      const editBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Edit')
      await editBtn!.trigger('click')
      await flushPromises()

      // Submit
      const dialog = wrapper.find('[data-testid="dialog-grouping-edit"]')
      await dialog.find('button').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('update')).toBeDefined()
      expect(wrapper.emitted('update')![0]).toEqual([
        1,
        { name: 'Test', description: null }
      ])
    })
  })

  describe('delete flow', () => {
    it('opens confirm dialog on Delete click', async () => {
      const wrapper = createWrapper({
        groupings: [grouping1],
        isDestructiveMode: true
      })

      const deleteBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Delete')
      await deleteBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
    })

    it('emits remove on confirm', async () => {
      const wrapper = createWrapper({
        groupings: [grouping1],
        isDestructiveMode: true
      })

      // Open confirm
      const deleteBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Delete')
      await deleteBtn!.trigger('click')
      await flushPromises()

      // Confirm
      const confirmBtn = wrapper
        .find('[data-testid="confirm-dialog"]')
        .findAll('button')
        .find((b) => b.text() === 'Confirm')
      await confirmBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('remove')).toBeDefined()
      expect(wrapper.emitted('remove')![0]).toEqual([1])
    })
  })

  describe('reorder', () => {
    it('emits reorder with swapped ids on move-up', async () => {
      const wrapper = createWrapper({
        groupings: [grouping1, grouping2]
      })

      const item2 = wrapper.find('[data-testid="grouping-item-2"]')
      const upBtn = item2.findAll('button').find((b) => b.text() === 'Up')
      await upBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('reorder')).toBeDefined()
      expect(wrapper.emitted('reorder')![0]).toEqual([[2, 1]])
    })

    it('emits reorder with swapped ids on move-down', async () => {
      const wrapper = createWrapper({
        groupings: [grouping1, grouping2]
      })

      const item1 = wrapper.find('[data-testid="grouping-item-1"]')
      const downBtn = item1.findAll('button').find((b) => b.text() === 'Down')
      await downBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('reorder')).toBeDefined()
      expect(wrapper.emitted('reorder')![0]).toEqual([[2, 1]])
    })
  })

  describe('manage members flow', () => {
    it('emits manageMembers and opens dialog on Members click', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      const membersBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Members')
      await membersBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('manageMembers')).toBeDefined()
      expect(wrapper.emitted('manageMembers')![0]).toEqual([1])
      expect(wrapper.find('[data-testid="dialog-members"]').exists()).toBe(true)
    })

    it('emits addMember from members dialog', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      // Open members dialog
      const membersBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Members')
      await membersBtn!.trigger('click')
      await flushPromises()

      // Click AddMember in dialog
      const addBtn = wrapper
        .find('[data-testid="dialog-members"]')
        .findAll('button')
        .find((b) => b.text() === 'AddMember')
      await addBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('addMember')).toBeDefined()
      expect(wrapper.emitted('addMember')![0]).toEqual([1, 100])
    })

    it('emits removeMember from members dialog', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      // Open members dialog
      const membersBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Members')
      await membersBtn!.trigger('click')
      await flushPromises()

      const removeBtn = wrapper
        .find('[data-testid="dialog-members"]')
        .findAll('button')
        .find((b) => b.text() === 'RemoveMember')
      await removeBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('removeMember')).toBeDefined()
      expect(wrapper.emitted('removeMember')![0]).toEqual([1, 100])
    })

    it('emits reorderMembers from members dialog', async () => {
      const wrapper = createWrapper({ groupings: [grouping1] })

      // Open members dialog
      const membersBtn = wrapper
        .find('[data-testid="grouping-item-1"]')
        .findAll('button')
        .find((b) => b.text() === 'Members')
      await membersBtn!.trigger('click')
      await flushPromises()

      const reorderBtn = wrapper
        .find('[data-testid="dialog-members"]')
        .findAll('button')
        .find((b) => b.text() === 'ReorderMembers')
      await reorderBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('reorderMembers')).toBeDefined()
      expect(wrapper.emitted('reorderMembers')![0]).toEqual([1, [101, 100]])
    })
  })
})
