/**
 * Tests for ComponentDetailDialogForm component.
 *
 * TDD tests for the add/edit form dialog.
 */

import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailDialogForm from './ComponentDetailDialogForm.vue'

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

// Stub for BaseDialog to avoid teleport issues in tests
const BaseDialogStub = {
  name: 'BaseDialog',
  template: `<div v-if="open" data-testid="dialog">
    <h1>{{ title }}</h1>
    <slot />
  </div>`,
  props: ['open', 'title']
}

// Stub for BaseInput to make testing easier
// Generates test-id from label for selection
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
    <span v-if="error" class="error">{{ error }}</span>
  </div>`,
  props: [
    'modelValue',
    'disabled',
    'error',
    'placeholder',
    'inputmode',
    'type',
    'label'
  ]
}

// Stub for BaseTextarea to make testing easier
// Generates test-id from label for selection
const BaseTextareaStub = {
  name: 'BaseTextarea',
  template: `<div class="base-textarea-stub">
    <label v-if="label">{{ label }}</label>
    <input 
      :data-testid="'input-' + label?.toLowerCase().replace(/ /g, '-')"
      :value="modelValue" 
      :disabled="disabled" 
      @input="$emit('update:modelValue', $event.target.value)" 
    />
    <span v-if="error" class="error">{{ error }}</span>
  </div>`,
  props: ['modelValue', 'disabled', 'error', 'placeholder', 'rows', 'label']
}

describe('ComponentDetailDialogForm', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailDialogForm, {
      props: {
        open: true,
        form: null,
        ...props
      },
      global: {
        stubs: {
          BaseDialog: BaseDialogStub,
          BaseInput: BaseInputStub,
          BaseTextarea: BaseTextareaStub
        }
      }
    })
  }

  describe('add mode', () => {
    it('shows "Add Form Variant" title when form is null', () => {
      const wrapper = createWrapper({ form: null })
      expect(wrapper.find('h1').text()).toBe('Add Form Variant')
    })

    it('shows editable character field when adding', () => {
      const wrapper = createWrapper({ form: null })
      const charInput = wrapper.find('[data-testid="input-character"]')
      expect(charInput.exists()).toBe(true)
      expect((charInput.element as HTMLInputElement).disabled).toBe(false)
    })

    it('shows empty form fields', () => {
      const wrapper = createWrapper({ form: null })
      expect(
        (
          wrapper.find('[data-testid="input-character"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
      expect(
        (
          wrapper.find('[data-testid="input-form-name"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
      expect(
        (
          wrapper.find('[data-testid="input-stroke-count"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
      expect(
        (
          wrapper.find('[data-testid="input-usage-notes"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
    })
  })

  describe('edit mode', () => {
    it('shows "Edit Form Variant" title when form is provided', () => {
      const wrapper = createWrapper({ form: createTestForm() })
      expect(wrapper.find('h1').text()).toBe('Edit Form Variant')
    })

    it('shows disabled character field with existing value', () => {
      const wrapper = createWrapper({
        form: createTestForm({ formCharacter: '氵' })
      })
      const charInput = wrapper.find('[data-testid="input-character"]')
      expect((charInput.element as HTMLInputElement).value).toBe('氵')
      expect((charInput.element as HTMLInputElement).disabled).toBe(true)
    })

    it('pre-populates form fields with existing values', () => {
      const wrapper = createWrapper({
        form: createTestForm({
          formCharacter: '氵',
          formName: 'water radical',
          strokeCount: 3,
          usageNotes: 'Used in water-related kanji'
        })
      })

      expect(
        (
          wrapper.find('[data-testid="input-character"]')
            .element as HTMLInputElement
        ).value
      ).toBe('氵')
      expect(
        (
          wrapper.find('[data-testid="input-form-name"]')
            .element as HTMLInputElement
        ).value
      ).toBe('water radical')
      expect(
        (
          wrapper.find('[data-testid="input-stroke-count"]')
            .element as HTMLInputElement
        ).value
      ).toBe('3')
      expect(
        (
          wrapper.find('[data-testid="input-usage-notes"]')
            .element as HTMLInputElement
        ).value
      ).toBe('Used in water-related kanji')
    })

    it('handles null optional fields', () => {
      const wrapper = createWrapper({
        form: createTestForm({
          formName: null,
          strokeCount: null,
          usageNotes: null
        })
      })

      expect(
        (
          wrapper.find('[data-testid="input-form-name"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
      expect(
        (
          wrapper.find('[data-testid="input-stroke-count"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
      expect(
        (
          wrapper.find('[data-testid="input-usage-notes"]')
            .element as HTMLInputElement
        ).value
      ).toBe('')
    })
  })

  describe('validation', () => {
    it('validates character is required', async () => {
      const wrapper = createWrapper({ form: null })

      // Submit without entering character
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.text()).toContain('Character is required')
      expect(wrapper.emitted('submit')).toBeUndefined()
    })
  })

  describe('submit behavior', () => {
    it('emits submit with form data on valid submission', async () => {
      const wrapper = createWrapper({ form: null })

      await wrapper.find('[data-testid="input-character"]').setValue('氵')
      await wrapper
        .find('[data-testid="input-form-name"]')
        .setValue('water radical')
      await wrapper.find('[data-testid="input-stroke-count"]').setValue('3')
      await wrapper
        .find('[data-testid="input-usage-notes"]')
        .setValue('Test notes')

      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.emitted('submit')).toBeDefined()
      expect(wrapper.emitted('submit')![0]).toEqual([
        {
          formCharacter: '氵',
          formName: 'water radical',
          strokeCount: 3,
          usageNotes: 'Test notes'
        }
      ])
    })

    it('converts empty optional fields to null', async () => {
      const wrapper = createWrapper({ form: null })

      await wrapper.find('[data-testid="input-character"]').setValue('氵')
      // Leave other fields empty

      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.emitted('submit')).toBeDefined()
      expect(wrapper.emitted('submit')![0]).toEqual([
        {
          formCharacter: '氵',
          formName: null,
          strokeCount: null,
          usageNotes: null
        }
      ])
    })

    it('parses stroke count string to number', async () => {
      const wrapper = createWrapper({ form: null })

      await wrapper.find('[data-testid="input-character"]').setValue('氵')
      await wrapper.find('[data-testid="input-stroke-count"]').setValue('5')

      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.emitted('submit')).toBeDefined()
      const submitData = wrapper.emitted('submit')![0]![0] as Record<
        string,
        unknown
      >
      expect(submitData['strokeCount']).toBe(5)
    })
  })

  describe('cancel behavior', () => {
    it('emits cancel when cancel button is clicked', async () => {
      const wrapper = createWrapper({ form: null })

      const cancelButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Cancel')
      await cancelButton!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('cancel')).toBeDefined()
    })

    it('closes dialog via update:open when canceling', async () => {
      const wrapper = createWrapper({ form: null })

      const cancelButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Cancel')
      await cancelButton!.trigger('click')
      await flushPromises()

      expect(wrapper.emitted('update:open')).toBeDefined()
      expect(wrapper.emitted('update:open')![0]).toEqual([false])
    })
  })

  describe('dialog visibility', () => {
    it('renders nothing when closed', () => {
      const wrapper = createWrapper({ open: false })
      expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(false)
    })

    it('renders dialog content when open', () => {
      const wrapper = createWrapper({ open: true })
      expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(true)
    })
  })
})
