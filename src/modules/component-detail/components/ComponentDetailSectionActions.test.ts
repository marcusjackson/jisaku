/**
 * ComponentDetailSectionActions Tests
 *
 * Tests for the actions section component.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import ComponentDetailSectionActions from './ComponentDetailSectionActions.vue'

// Mock vue-router
vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    template: '<a><slot /></a>',
    props: ['to']
  }
}))

describe('ComponentDetailSectionActions', () => {
  const createWrapper = (props = {}) => {
    return mount(ComponentDetailSectionActions, {
      props: {
        destructiveMode: false,
        isDeleting: false,
        ...props
      },
      global: {
        stubs: {
          SharedBackButton: true,
          SharedConfirmDialog: true,
          BaseButton: {
            name: 'BaseButton',
            template: '<button :disabled="disabled"><slot /></button>',
            props: ['disabled', 'variant']
          },
          BaseSwitch: {
            name: 'BaseSwitch',
            template:
              '<input type="checkbox" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
            props: ['modelValue']
          }
        }
      }
    })
  }

  it('renders destructive mode toggle', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Destructive Mode')
  })

  it('renders delete button', () => {
    const wrapper = createWrapper()
    expect(wrapper.html()).toContain('Delete Component')
  })

  it('renders back button', () => {
    const wrapper = createWrapper()
    expect(wrapper.findComponent({ name: 'SharedBackButton' }).exists()).toBe(
      true
    )
  })

  it('disables delete button when destructive mode is off', () => {
    const wrapper = createWrapper({ destructiveMode: false })
    const deleteButton = wrapper.find('button')
    expect(deleteButton.attributes('disabled')).toBeDefined()
  })

  it('enables delete button when destructive mode is on', () => {
    const wrapper = createWrapper({ destructiveMode: true })
    const deleteButton = wrapper.find('button')
    expect(deleteButton.attributes('disabled')).toBeUndefined()
  })

  it('disables delete button when deleting', () => {
    const wrapper = createWrapper({ destructiveMode: true, isDeleting: true })
    const deleteButton = wrapper.find('button')
    expect(deleteButton.attributes('disabled')).toBeDefined()
  })

  it('shows deleting text when deleting', () => {
    const wrapper = createWrapper({ isDeleting: true })
    expect(wrapper.html()).toContain('Deleting...')
  })

  it('emits update:destructiveMode when switch is toggled', async () => {
    const wrapper = createWrapper()
    const switchInput = wrapper.find('input[type="checkbox"]')
    await switchInput.setValue(true)
    expect(wrapper.emitted('update:destructiveMode')).toBeTruthy()
  })
})
