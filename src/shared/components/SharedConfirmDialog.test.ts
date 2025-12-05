/**
 * Tests for SharedConfirmDialog component
 *
 * Note: SharedConfirmDialog uses BaseDialog which uses Reka UI portal.
 * These tests use Vue Test Utils with stubs to avoid portal issues.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedConfirmDialog from './SharedConfirmDialog.vue'

describe('SharedConfirmDialog', () => {
  const defaultProps = {
    description: 'Are you sure you want to proceed?',
    isOpen: true,
    title: 'Confirm Action'
  }

  function mountDialog(props = {}) {
    return mount(SharedConfirmDialog, {
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
                <slot name="footer" />
              </div>
            `
          },
          BaseButton: {
            props: ['disabled', 'loading', 'variant', 'type'],
            template:
              '<button :disabled="disabled || loading" :type="type"><slot /></button>'
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
    const wrapper = mountDialog({ isOpen: false })
    expect(wrapper.find('[role="dialog"]').exists()).toBe(false)
  })

  it('renders title', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('h2').text()).toBe('Confirm Action')
  })

  it('renders description', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('p').text()).toBe('Are you sure you want to proceed?')
  })

  it('renders default button labels', () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    expect(buttons.at(0)?.text()).toBe('Cancel')
    expect(buttons.at(1)?.text()).toBe('Confirm')
  })

  it('renders custom button labels', () => {
    const wrapper = mountDialog({
      cancelLabel: 'No, go back',
      confirmLabel: 'Yes, delete'
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.at(0)?.text()).toBe('No, go back')
    expect(buttons.at(1)?.text()).toBe('Yes, delete')
  })

  it('emits confirm event when confirm button clicked', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    await buttons.at(1)?.trigger('click')
    expect(wrapper.emitted('confirm')).toBeTruthy()
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    await buttons.at(0)?.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('disables buttons when loading', () => {
    const wrapper = mountDialog({ isLoading: true })
    const buttons = wrapper.findAll('button')
    expect(buttons.at(0)?.element.disabled).toBe(true)
    expect(buttons.at(1)?.element.disabled).toBe(true)
  })

  it('shows loading state on confirm button', () => {
    const wrapper = mountDialog({ isLoading: true })
    const buttons = wrapper.findAll('button')
    // Confirm button should be disabled when loading
    expect(buttons.at(1)?.element.disabled).toBe(true)
  })
})
