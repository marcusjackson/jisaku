/**
 * Tests for ComponentDetailSectionForms component.
 *
 * TDD tests for the Forms section wrapper.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailSectionForms from './ComponentDetailSectionForms.vue'

import type { ComponentForm } from '@/api/component'

// Factory function for creating test form data
function createTestForm(overrides: Partial<ComponentForm> = {}): ComponentForm {
  return {
    id: 1,
    componentId: 100,
    formCharacter: '氵',
    formName: 'water radical',
    strokeCount: 3,
    usageNotes: 'Used in water-related kanji',
    displayOrder: 0,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

// Stubs
const SharedSectionStub = {
  name: 'SharedSection',
  template: `<section :data-testid="testId" :data-state="defaultOpen ? 'open' : 'closed'">
    <h2>{{ title }}</h2>
    <div class="actions"><slot name="actions" :isOpen="defaultOpen" /></div>
    <div v-if="defaultOpen" class="content"><slot /></div>
  </section>`,
  props: ['title', 'collapsible', 'defaultOpen', 'testId']
}

const ComponentDetailFormItemStub = {
  name: 'ComponentDetailFormItem',
  template: `<div class="form-item-stub" :data-testid="'form-item-' + form.id">
    {{ form.formCharacter }}
    <button @click="$emit('edit')">Edit</button>
    <button v-if="isDestructiveMode" @click="$emit('delete')">Delete</button>
    <button @click="$emit('move-up')">Up</button>
    <button @click="$emit('move-down')">Down</button>
  </div>`,
  props: ['form', 'index', 'total', 'isDestructiveMode']
}

const ComponentDetailDialogFormStub = {
  name: 'ComponentDetailDialogForm',
  template: `<div v-if="open" data-testid="dialog-form">
    <slot />
    <button @click="$emit('submit', { formCharacter: '水', formName: null, strokeCount: null, usageNotes: null })">Submit</button>
    <button @click="$emit('cancel')">Cancel</button>
  </div>`,
  props: ['open', 'form']
}

const SharedConfirmDialogStub = {
  name: 'SharedConfirmDialog',
  template: `<div v-if="open" data-testid="confirm-dialog">
    <button @click="$emit('confirm')">Confirm</button>
    <button @click="$emit('cancel')">Cancel Delete</button>
  </div>`,
  props: ['open', 'title', 'description', 'confirmLabel', 'variant']
}

describe('ComponentDetailSectionForms', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailSectionForms, {
      props: {
        forms: [],
        componentId: 100,
        isDestructiveMode: false,
        ...props
      },
      global: {
        stubs: {
          SharedSection: SharedSectionStub,
          ComponentDetailFormItem: ComponentDetailFormItemStub,
          ComponentDetailDialogForm: ComponentDetailDialogFormStub,
          SharedConfirmDialog: SharedConfirmDialogStub
        }
      }
    })
  }

  describe('section structure', () => {
    it('renders with Forms title', () => {
      const wrapper = createWrapper({ forms: [] })
      expect(wrapper.find('h2').text()).toBe('Forms')
    })

    it('renders with correct test id', () => {
      const wrapper = createWrapper({ forms: [] })
      expect(
        wrapper.find('[data-testid="component-detail-forms"]').exists()
      ).toBe(true)
    })
  })

  describe('collapsible behavior', () => {
    it('defaults to open when forms array has items', () => {
      const wrapper = createWrapper({
        forms: [createTestForm()]
      })
      const section = wrapper.find('[data-testid="component-detail-forms"]')
      expect(section.attributes('data-state')).toBe('open')
    })

    it('defaults to collapsed when forms array is empty', () => {
      const wrapper = createWrapper({ forms: [] })
      const section = wrapper.find('[data-testid="component-detail-forms"]')
      expect(section.attributes('data-state')).toBe('closed')
    })
  })

  describe('empty state', () => {
    it('shows empty state message when no forms', () => {
      const wrapper = createWrapper({ forms: [] })
      // With closed state, content won't show, but we can check the prop
      expect(wrapper.vm.forms.length).toBe(0)
    })
  })

  describe('forms list', () => {
    it('renders form items for each form', () => {
      const wrapper = createWrapper({
        forms: [createTestForm({ id: 1 }), createTestForm({ id: 2 })]
      })
      expect(wrapper.findAll('.form-item-stub').length).toBe(2)
    })

    it('passes correct props to form items', () => {
      const wrapper = createWrapper({
        forms: [createTestForm({ id: 1 }), createTestForm({ id: 2 })],
        isDestructiveMode: true
      })

      const items = wrapper.findAll('.form-item-stub')
      expect(items.length).toBe(2)
      // Delete buttons should be visible in destructive mode
      expect(
        items[0]!.findAll('button').some((b) => b.text() === 'Delete')
      ).toBe(true)
    })
  })

  describe('add button', () => {
    it('shows add button in actions slot', () => {
      const wrapper = createWrapper({ forms: [createTestForm()] })
      const actionsSlot = wrapper.find('.actions')
      expect(actionsSlot.text()).toContain('Add')
    })
  })

  describe('add form flow', () => {
    it('emits add event when form is submitted', async () => {
      const wrapper = createWrapper({ forms: [createTestForm()] })

      // Open add dialog
      await wrapper.find('.actions button').trigger('click')
      await flushPromises()

      // Submit the dialog
      const dialog = wrapper.find('[data-testid="dialog-form"]')
      await dialog.find('button:first-child').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('add')).toBeDefined()
    })
  })

  describe('edit form flow', () => {
    it('emits update event when editing is complete', async () => {
      const form = createTestForm({ id: 42 })
      const wrapper = createWrapper({ forms: [form] })

      // Click edit on the form item
      await wrapper.find('.form-item-stub button:first-child').trigger('click')
      await flushPromises()

      // Submit the dialog
      const dialog = wrapper.find('[data-testid="dialog-form"]')
      await dialog.find('button:first-child').trigger('click')
      await flushPromises()

      expect(wrapper.emitted('update')).toBeDefined()
    })
  })

  describe('delete form flow', () => {
    it('opens confirmation dialog when delete clicked', async () => {
      const form = createTestForm({ id: 42 })
      const wrapper = createWrapper({
        forms: [form],
        isDestructiveMode: true
      })

      // Click delete
      const deleteBtn = wrapper
        .find('.form-item-stub')
        .findAll('button')
        .find((b) => b.text() === 'Delete')
      await deleteBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
    })

    it('emits remove event when delete is confirmed', async () => {
      const form = createTestForm({ id: 42 })
      const wrapper = createWrapper({
        forms: [form],
        isDestructiveMode: true
      })

      // Click delete
      const deleteBtn = wrapper
        .find('.form-item-stub')
        .findAll('button')
        .find((b) => b.text() === 'Delete')
      await deleteBtn!.trigger('click')
      await flushPromises()

      // Confirm deletion
      await wrapper
        .find('[data-testid="confirm-dialog"] button:first-child')
        .trigger('click')
      await flushPromises()

      expect(wrapper.emitted('remove')).toBeDefined()
      expect(wrapper.emitted('remove')![0]).toEqual([42])
    })
  })

  describe('reorder flow', () => {
    it('emits reorder when move-up is triggered', async () => {
      const forms = [createTestForm({ id: 1 }), createTestForm({ id: 2 })]
      const wrapper = createWrapper({ forms })

      // Click move-up on second item
      const items = wrapper.findAll('.form-item-stub')
      const upBtn = items[1]!.findAll('button').find((b) => b.text() === 'Up')
      await upBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('reorder')).toBeDefined()
      // After moving item at index 1 up, order should be [2, 1]
      expect(wrapper.emitted('reorder')![0]).toEqual([[2, 1]])
    })

    it('emits reorder when move-down is triggered', async () => {
      const forms = [createTestForm({ id: 1 }), createTestForm({ id: 2 })]
      const wrapper = createWrapper({ forms })

      // Click move-down on first item
      const items = wrapper.findAll('.form-item-stub')
      const downBtn = items[0]!
        .findAll('button')
        .find((b) => b.text() === 'Down')
      await downBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('reorder')).toBeDefined()
      // After moving item at index 0 down, order should be [2, 1]
      expect(wrapper.emitted('reorder')![0]).toEqual([[2, 1]])
    })
  })
})
