/**
 * Tests for SharedQuickCreateKanji component
 *
 * Note: SharedQuickCreateKanji uses BaseDialog which uses Reka UI portal.
 * These tests use Vue Test Utils with stubs to avoid portal issues.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedQuickCreateKanji from './SharedQuickCreateKanji.vue'

describe('SharedQuickCreateKanji', () => {
  function mountDialog(props = {}, modelValue = true) {
    return mount(SharedQuickCreateKanji, {
      props: {
        open: modelValue,
        'onUpdate:open': (e: boolean) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          e
        },
        ...props
      },
      global: {
        stubs: {
          BaseDialog: {
            props: ['open', 'title', 'description'],
            template: `
              <div v-if="open" role="dialog" data-testid="dialog">
                <h2>{{ title }}</h2>
                <p>{{ description }}</p>
                <slot />
                <slot name="footer" />
              </div>
            `
          },
          BaseButton: {
            props: ['disabled', 'loading', 'variant', 'type', 'form'],
            template:
              '<button :disabled="disabled || loading" :type="type" :form="form"><slot /></button>'
          },
          BaseInput: {
            props: [
              'modelValue',
              'error',
              'label',
              'name',
              'required',
              'type',
              'placeholder'
            ],
            emits: ['update:modelValue'],
            template: `
              <div class="base-input">
                <label>{{ label }}</label>
                <input 
                  :value="modelValue" 
                  :type="type || 'text'"
                  :name="name"
                  @input="$emit('update:modelValue', $event.target.value)"
                  data-testid="input-{{ name }}"
                />
                <span v-if="error" class="error">{{ error }}</span>
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
    const wrapper = mountDialog({}, false)
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('renders title', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('h2').text()).toBe('Quick Create Kanji')
  })

  it('renders description', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('p').text()).toContain(
      'Create a kanji with minimal fields'
    )
  })

  it('renders character input field', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Character')
  })

  it('renders short meaning input field', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Short Meaning')
  })

  it('renders search keywords input field', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Search Keywords')
  })

  it('renders cancel button', () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper.findAll('button').find((b) => {
      return b.text() === 'Cancel'
    })
    expect(cancelButton?.exists()).toBe(true)
  })

  it('renders create button', () => {
    const wrapper = mountDialog()
    const createButton = wrapper.findAll('button').find((b) => {
      return b.text() === 'Create'
    })
    expect(createButton?.exists()).toBe(true)
  })

  it('emits cancel when cancel button is clicked', async () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper.findAll('button').find((b) => {
      return b.text() === 'Cancel'
    })
    await cancelButton?.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})
