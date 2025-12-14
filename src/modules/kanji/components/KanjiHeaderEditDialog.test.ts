/**
 * Tests for KanjiHeaderEditDialog component
 *
 * Note: Uses stubs for BaseDialog since it uses Reka UI portal.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import KanjiHeaderEditDialog from './KanjiHeaderEditDialog.vue'

describe('KanjiHeaderEditDialog', () => {
  const defaultProps = {
    open: true,
    character: '日',
    shortMeaning: 'sun, day',
    searchKeywords: 'sun day hi'
  }

  function mountDialog(props = {}) {
    return mount(KanjiHeaderEditDialog, {
      props: { ...defaultProps, ...props },
      global: {
        stubs: {
          BaseDialog: {
            props: ['open', 'title', 'description'],
            template: `
              <div v-if="open" role="dialog">
                <h2>{{ title }}</h2>
                <p>{{ description }}</p>
                <slot />
              </div>
            `
          },
          BaseButton: {
            props: ['disabled', 'loading', 'variant', 'type'],
            template:
              '<button :disabled="disabled || loading" :type="type"><slot /></button>'
          },
          BaseInput: {
            props: [
              'modelValue',
              'label',
              'error',
              'maxlength',
              'required',
              'placeholder'
            ],
            emits: ['update:modelValue'],
            template: `
              <div>
                <label :for="label">{{ label }}</label>
                <input
                  :id="label"
                  :value="modelValue"
                  @input="$emit('update:modelValue', $event.target.value)"
                />
              </div>
            `
          }
        }
      }
    })
  }

  it('renders dialog when open', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('does not render when closed', () => {
    const wrapper = mountDialog({ open: false })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('renders form fields', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('label[for="Character"]').exists()).toBe(true)
    expect(wrapper.find('label[for="Short Meaning"]').exists()).toBe(true)
    expect(wrapper.find('label[for="Search Keywords"]').exists()).toBe(true)
  })

  it('populates form with initial values', () => {
    const wrapper = mountDialog()
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(3)
    expect((inputs.at(0)?.element as HTMLInputElement).value).toBe('日')
    expect((inputs.at(1)?.element as HTMLInputElement).value).toBe('sun, day')
    expect((inputs.at(2)?.element as HTMLInputElement).value).toBe('sun day hi')
  })

  it('renders form with submit button', () => {
    const wrapper = mountDialog()

    // Submit the form should exist
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)

    // Save button should exist
    const saveButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Save'))
    expect(saveButton?.exists()).toBe(true)
  })

  it('emits update:open false on cancel', async () => {
    const onUpdateOpen = vi.fn()
    const wrapper = mountDialog({ 'onUpdate:open': onUpdateOpen })

    // Click cancel button (first button)
    const buttons = wrapper.findAll('button')
    await buttons.at(0)?.trigger('click')

    expect(onUpdateOpen).toHaveBeenCalledWith(false)
  })
})
