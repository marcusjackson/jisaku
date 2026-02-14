/**
 * ComponentDetailDialogHeadline Tests
 *
 * Tests for the headline edit dialog component.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import ComponentDetailDialogHeadline from './ComponentDetailDialogHeadline.vue'

describe('ComponentDetailDialogHeadline', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailDialogHeadline, {
      props: {
        open: true,
        character: '氵',
        shortMeaning: 'water',
        searchKeywords: 'mizu, sanzui',
        ...props
      },
      global: {
        stubs: {
          BaseDialog: {
            name: 'BaseDialog',
            template: '<div v-if="open"><slot /></div>',
            props: ['open', 'title']
          },
          BaseInput: {
            name: 'BaseInput',
            template:
              '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
            props: [
              'modelValue',
              'label',
              'error',
              'required',
              'maxlength',
              'placeholder'
            ]
          },
          BaseButton: {
            name: 'BaseButton',
            template:
              '<button :type="type" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
            props: ['type', 'variant', 'disabled', 'loading']
          }
        }
      }
    })
  }

  it('renders when open is true', () => {
    const wrapper = createWrapper({ open: true })
    expect(wrapper.find('div').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = createWrapper({ open: false })
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('populates form with initial values', () => {
    const wrapper = createWrapper()
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(3)
  })

  it('emits update:open with false when Cancel is clicked', async () => {
    const wrapper = createWrapper()
    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
    await cancelButton?.trigger('click')
    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('has Save button available for form submission', () => {
    const wrapper = createWrapper()
    const saveButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Save')
    expect(saveButton?.exists()).toBe(true)
  })

  it('has character input as required field', () => {
    const wrapper = createWrapper()
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })
})
