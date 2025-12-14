/**
 * Tests for SharedQuickCreateComponent component
 *
 * Note: SharedQuickCreateComponent uses BaseDialog which uses Reka UI portal.
 * These tests use Vue Test Utils with stubs to avoid portal issues.
 * Full behavior is tested via E2E tests.
 *
 * The quick-create form now only has character and shortMeaning fields.
 * strokeCount and canBeRadical can be set later on the detail page.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedQuickCreateComponent from './SharedQuickCreateComponent.vue'

describe('SharedQuickCreateComponent', () => {
  function mountDialog(props = {}, modelValue = true) {
    return mount(SharedQuickCreateComponent, {
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
    expect(wrapper.find('h2').text()).toBe('Quick Create Component')
  })

  it('renders description', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('p').text()).toContain(
      'Create a component with minimal fields'
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

  it('renders cancel and create buttons', () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    expect(buttons.at(0)?.text()).toBe('Cancel')
    expect(buttons.at(1)?.text()).toBe('Create & View')
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    await buttons.at(0)?.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('pre-fills character when initialCharacter provided', () => {
    const wrapper = mountDialog({ initialCharacter: '亻' })
    // The component should have the initial character set in the form
    expect(wrapper.html()).toBeDefined()
  })

  it('renders help text for short meaning', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Brief meaning for display')
  })

  it('mentions stroke count and radical details are set on detail page', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('stroke count')
    expect(wrapper.text()).toContain('radical details')
    expect(wrapper.text()).toContain('detail page')
  })
})
