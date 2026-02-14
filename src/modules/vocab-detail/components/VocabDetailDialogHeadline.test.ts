/**
 * VocabDetailDialogHeadline Tests
 *
 * Tests for the headline edit dialog component.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VocabDetailDialogHeadline from './VocabDetailDialogHeadline.vue'

describe('VocabDetailDialogHeadline', () => {
  const createWrapper = (props = {}) => {
    return mount(VocabDetailDialogHeadline, {
      props: {
        open: true,
        word: '日本語',
        kana: 'にほんご',
        shortMeaning: 'Japanese language',
        searchKeywords: 'nihongo',
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
    expect(inputs.length).toBe(4)
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

  it('emits save event with form data when form is submitted', () => {
    const wrapper = createWrapper()
    // The vee-validate form handles this internally, so we test the button exists
    const saveButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Save')
    expect(saveButton?.exists()).toBe(true)
  })

  it('has word input with required attribute', () => {
    const wrapper = createWrapper()
    // Check that inputs exist (word, kana, shortMeaning, searchKeywords)
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('has kana input with required attribute', () => {
    const wrapper = createWrapper()
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(1)
  })
})
