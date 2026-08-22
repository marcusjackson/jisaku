/**
 * Tests for ComponentDetailDialogGrouping component.
 *
 * TDD tests for the add/edit grouping dialog.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailDialogGrouping from './ComponentDetailDialogGrouping.vue'

import type { GroupingFormData } from '../component-detail-types'

// Stub for BaseDialog to avoid teleport issues in tests
const BaseDialogStub = {
  name: 'BaseDialog',
  template: `<div v-if="open" data-testid="dialog">
    <h1>{{ title }}</h1>
    <slot />
  </div>`,
  props: ['open', 'title']
}

// Stub for BaseInput
const BaseInputStub = {
  name: 'BaseInput',
  template: `<div class="base-input-stub">
    <label v-if="label">{{ label }}</label>
    <input
      :data-testid="'input-' + label?.toLowerCase().replace(/ /g, '-')"
      :value="modelValue"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>`,
  props: ['modelValue', 'disabled', 'error', 'placeholder', 'label']
}

// Stub for BaseTextarea
const BaseTextareaStub = {
  name: 'BaseTextarea',
  template: `<div class="base-textarea-stub">
    <label v-if="label">{{ label }}</label>
    <input
      :data-testid="'input-' + label?.toLowerCase().replace(/ /g, '-')"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>`,
  props: ['modelValue', 'placeholder', 'rows', 'label']
}

// Stub for BaseButton
const BaseButtonStub = {
  name: 'BaseButton',
  template: `<button :disabled="disabled" :type="type || 'button'" @click="$emit('click')"><slot /></button>`,
  props: ['disabled', 'variant', 'type', 'size']
}

describe('ComponentDetailDialogGrouping', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailDialogGrouping, {
      props: {
        open: true,
        mode: 'add' as const,
        ...props
      },
      global: {
        stubs: {
          BaseDialog: BaseDialogStub,
          BaseInput: BaseInputStub,
          BaseTextarea: BaseTextareaStub,
          BaseButton: BaseButtonStub
        }
      }
    })
  }

  describe('add mode', () => {
    it('renders empty form fields on open', () => {
      const wrapper = createWrapper()
      const nameInput = wrapper.find('[data-testid="input-name"]')
      expect((nameInput.element as HTMLInputElement).value).toBe('')
    })

    it('shows "Add Grouping" as title', () => {
      const wrapper = createWrapper()
      expect(wrapper.find('h1').text()).toBe('Add Grouping')
    })

    it('has submit button disabled when name is empty', () => {
      const wrapper = createWrapper()
      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(true)
    })

    it('enables submit button when name has value', async () => {
      const wrapper = createWrapper()
      const nameInput = wrapper.find('[data-testid="input-name"]')

      await nameInput.setValue('Left side')
      await flushPromises()

      const submitBtn = wrapper.find('button[type="submit"]')
      expect((submitBtn.element as HTMLButtonElement).disabled).toBe(false)
    })

    it('emits submit with trimmed form data on valid submission', async () => {
      const wrapper = createWrapper()
      const nameInput = wrapper.find('[data-testid="input-name"]')

      await nameInput.setValue('  Left side  ')
      await flushPromises()

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      expect(wrapper.emitted('submit')).toBeDefined()
      const emitted = wrapper.emitted('submit')![0]![0] as GroupingFormData
      expect(emitted.name).toBe('Left side')
      expect(emitted.description).toBeNull()
    })

    it('emits submit with description when provided', async () => {
      const wrapper = createWrapper()

      await wrapper.find('[data-testid="input-name"]').setValue('Left side')
      await wrapper
        .find('[data-testid="input-description"]')
        .setValue('Appears on the left')
      await flushPromises()

      await wrapper.find('form').trigger('submit.prevent')
      await flushPromises()

      const emitted = wrapper.emitted('submit')![0]![0] as GroupingFormData
      expect(emitted.name).toBe('Left side')
      expect(emitted.description).toBe('Appears on the left')
    })
  })

  describe('edit mode', () => {
    const initial: GroupingFormData = {
      name: 'Left side',
      description: 'Appears on the left'
    }

    it('shows "Edit Grouping" as title', () => {
      const wrapper = createWrapper({ mode: 'edit', initial })
      expect(wrapper.find('h1').text()).toBe('Edit Grouping')
    })

    it('pre-populates fields from initial prop', () => {
      const wrapper = createWrapper({ mode: 'edit', initial })

      expect(
        (wrapper.find('[data-testid="input-name"]').element as HTMLInputElement)
          .value
      ).toBe('Left side')
      expect(
        (
          wrapper.find('[data-testid="input-description"]')
            .element as HTMLInputElement
        ).value
      ).toBe('Appears on the left')
    })

    it('pre-populates name only when description is null', () => {
      const wrapper = createWrapper({
        mode: 'edit',
        initial: { name: 'Test', description: null }
      })

      expect(
        (wrapper.find('[data-testid="input-name"]').element as HTMLInputElement)
          .value
      ).toBe('Test')
      expect(
        (
          wrapper.find('[data-testid="input-description"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
    })
  })

  describe('cancel', () => {
    it('emits update:open false on cancel', async () => {
      const wrapper = createWrapper()

      // Cancel button is the one with "Cancel" text
      const cancelBtn = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Cancel')
      await cancelBtn!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('update:open')).toBeDefined()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })
  })
})
