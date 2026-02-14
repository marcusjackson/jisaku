/**
 * SharedConfirmDialog tests
 *
 * Note: Reka UI Dialog uses teleport/portal with limitations in jsdom.
 * Tests verify component structure and props; full rendering via E2E.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SharedConfirmDialog from './SharedConfirmDialog.vue'

describe('SharedConfirmDialog', () => {
  function mountDialog(
    props: Record<string, unknown> = {},
    slots: Record<string, string> = {}
  ) {
    return mount(SharedConfirmDialog, {
      props: {
        open: true,
        title: 'Confirm Action',
        description: 'Are you sure?',
        ...props
      },
      slots,
      global: {
        stubs: {
          BaseDialog: {
            template: `
              <div role="dialog" v-if="open">
                <h2>{{ title }}</h2>
                <p>{{ description }}</p>
                <slot />
                <slot name="footer" />
              </div>
            `,
            props: ['open', 'title', 'description']
          },
          BaseButton: {
            template:
              '<button :class="`base-button-${variant ?? \'primary\'}`" :disabled="disabled"><slot /></button>',
            props: ['variant', 'disabled', 'loading']
          }
        }
      }
    })
  }

  it('renders dialog structure when open', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('renders title and description', () => {
    const wrapper = mountDialog({
      title: 'Delete Item',
      description: 'This cannot be undone'
    })
    expect(wrapper.find('h2').text()).toBe('Delete Item')
    expect(wrapper.find('p').text()).toBe('This cannot be undone')
  })

  it('renders default button labels', () => {
    const wrapper = mountDialog()
    expect(wrapper.text()).toContain('Cancel')
    expect(wrapper.text()).toContain('Confirm')
  })

  it('renders custom button labels', () => {
    const wrapper = mountDialog({
      confirmLabel: 'Delete',
      cancelLabel: 'Keep'
    })
    expect(wrapper.text()).toContain('Keep')
    expect(wrapper.text()).toContain('Delete')
  })

  it('emits confirm event when confirm button clicked', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    const confirmBtn = buttons.find((b) => b.text() === 'Confirm')
    await confirmBtn?.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('confirm')
  })

  it('emits cancel event when cancel button clicked', async () => {
    const wrapper = mountDialog()
    const buttons = wrapper.findAll('button')
    const cancelBtn = buttons.find((b) => b.text() === 'Cancel')
    await cancelBtn?.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('cancel')
    expect(wrapper.emitted()).toHaveProperty('update:open')
  })

  it('applies danger variant to confirm button', () => {
    const wrapper = mountDialog({ variant: 'danger' })
    const buttons = wrapper.findAll('button')
    const confirmBtn = buttons.find((b) => b.text() === 'Confirm')
    expect(confirmBtn?.classes()).toContain('base-button-danger')
  })

  it('renders slot content', () => {
    const wrapper = mountDialog(
      {},
      { default: '<div class="custom">Extra</div>' }
    )
    expect(wrapper.find('.custom').exists()).toBe(true)
    expect(wrapper.text()).toContain('Extra')
  })
})
