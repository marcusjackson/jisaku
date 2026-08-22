/**
 * VocabDetailDialogBasicInfo Tests
 *
 * Tests for the basic information edit dialog component.
 */

import { createTestVocabulary } from '@test/helpers/vocabulary-test-helpers'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VocabDetailDialogBasicInfo from './VocabDetailDialogBasicInfo.vue'

const defaultVocab = createTestVocabulary({
  jlptLevel: 'N3',
  isCommon: true,
  description: 'A test description'
})

describe('VocabDetailDialogBasicInfo', () => {
  const createWrapper = (props = {}) => {
    return mount(VocabDetailDialogBasicInfo, {
      props: {
        open: true,
        vocab: defaultVocab,
        ...props
      },
      global: {
        stubs: {
          BaseDialog: {
            name: 'BaseDialog',
            template: '<div v-if="open" data-testid="dialog"><slot /></div>',
            props: ['open', 'title']
          },
          BaseSelect: {
            name: 'BaseSelect',
            template: `<div class="select-stub">
              <label>{{ label }}</label>
              <select
                :value="modelValue"
                @change="$emit('update:modelValue', $event.target.value)"
                data-testid="jlpt-select"
              >
                <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </div>`,
            props: ['modelValue', 'label', 'options'],
            emits: ['update:modelValue']
          },
          BaseSwitch: {
            name: 'BaseSwitch',
            template: `<div class="switch-stub">
              <label>{{ label }}</label>
              <input
                type="checkbox"
                :checked="modelValue"
                @change="$emit('update:modelValue', $event.target.checked)"
                data-testid="common-switch"
              />
            </div>`,
            props: ['modelValue', 'label'],
            emits: ['update:modelValue']
          },
          BaseTextarea: {
            name: 'BaseTextarea',
            template: `<div class="textarea-stub">
              <label>{{ label }}</label>
              <textarea
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                data-testid="description-textarea"
              ></textarea>
            </div>`,
            props: ['modelValue', 'label', 'placeholder', 'rows'],
            emits: ['update:modelValue']
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
    expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(true)
  })

  it('does not render when open is false', () => {
    const wrapper = createWrapper({ open: false })
    expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(false)
  })

  it('pre-populates JLPT select with current value', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    const select = wrapper.find('[data-testid="jlpt-select"]')
    expect((select.element as HTMLSelectElement).value).toBe('N3')
  })

  it('pre-populates JLPT select with None sentinel when null', async () => {
    const wrapper = createWrapper({
      vocab: createTestVocabulary({ jlptLevel: null })
    })
    await flushPromises()
    const select = wrapper.find('[data-testid="jlpt-select"]')
    expect((select.element as HTMLSelectElement).value).toBe('__none__')
  })

  it('pre-populates common switch with current value', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    const checkbox = wrapper.find('[data-testid="common-switch"]')
    expect((checkbox.element as HTMLInputElement).checked).toBe(true)
  })

  it('pre-populates description textarea with current value', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    const textarea = wrapper.find('[data-testid="description-textarea"]')
    expect((textarea.element as HTMLTextAreaElement).value).toBe(
      'A test description'
    )
  })

  it('emits save with correct BasicInfoSaveData on submit', async () => {
    const wrapper = createWrapper()
    await flushPromises()
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents).toBeTruthy()
    expect(saveEvents?.[0]?.[0]).toEqual({
      jlptLevel: 'N3',
      isCommon: true,
      description: 'A test description'
    })
  })

  it('converts JLPT None sentinel to null on save', async () => {
    const wrapper = createWrapper({
      vocab: createTestVocabulary({ jlptLevel: null })
    })
    await flushPromises()
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents?.[0]?.[0]).toMatchObject({ jlptLevel: null })
  })

  it('trims empty description to null on save', async () => {
    const wrapper = createWrapper({
      vocab: createTestVocabulary({ description: null })
    })
    await flushPromises()
    const form = wrapper.find('form')
    await form.trigger('submit')
    await flushPromises()
    const saveEvents = wrapper.emitted('save')
    expect(saveEvents?.[0]?.[0]).toMatchObject({ description: null })
  })

  it('emits update:open false on cancel', async () => {
    const wrapper = createWrapper()
    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
    await cancelButton?.trigger('click')
    expect(wrapper.emitted('update:open')).toBeTruthy()
    expect(wrapper.emitted('update:open')?.[0]).toEqual([false])
  })

  it('resets to saved values when reopened after cancel', async () => {
    // Start open with N3
    const wrapper = createWrapper()
    await flushPromises()

    // Change JLPT to N1
    const select = wrapper.find('[data-testid="jlpt-select"]')
    await select.setValue('N1')
    await flushPromises()

    // Cancel (close dialog)
    await wrapper.setProps({ open: false })
    await flushPromises()

    // Reopen
    await wrapper.setProps({ open: true })
    await flushPromises()

    // Should be back to N3 (the saved value), not N1
    const selectAfter = wrapper.find('[data-testid="jlpt-select"]')
    expect((selectAfter.element as HTMLSelectElement).value).toBe('N3')
  })
})
