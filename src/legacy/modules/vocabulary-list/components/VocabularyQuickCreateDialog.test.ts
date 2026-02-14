/**
 * Tests for VocabularyQuickCreateDialog component
 *
 * Note: Reka UI Dialog uses teleport/portal which has limitations in jsdom.
 * These tests verify the component's structure and props but full rendering
 * is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import VocabularyQuickCreateDialog from './VocabularyQuickCreateDialog.vue'

describe('VocabularyQuickCreateDialog', () => {
  // Mount with stubs to avoid portal issues
  function mountDialog(props: { open?: boolean; initialWord?: string } = {}) {
    return mount(VocabularyQuickCreateDialog, {
      props: { open: true, ...props },
      global: {
        stubs: {
          // Stub reka-ui components to render inline
          DialogRoot: { template: '<div><slot /></div>' },
          DialogPortal: {
            template: '<div data-testid="portal"><slot /></div>'
          },
          DialogOverlay: { template: '<div class="overlay" />' },
          DialogContent: {
            template: '<div role="dialog" aria-modal="true"><slot /></div>'
          },
          DialogTitle: { template: '<h2><slot /></h2>' },
          DialogDescription: { template: '<p><slot /></p>' },
          DialogClose: {
            template: '<button aria-label="Close"><slot /></button>'
          }
        }
      }
    })
  }

  it('renders dialog structure', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('[role="dialog"]').exists()).toBe(true)
  })

  it('renders title', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('h2').text()).toBe('Quick Create Vocabulary')
  })

  it('renders description', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('p').text()).toContain(
      'Create vocabulary with minimal fields'
    )
  })

  it('displays word input field', () => {
    const wrapper = mountDialog()
    const wordInput = wrapper.find('input[name="word"]')
    expect(wordInput.exists()).toBe(true)
  })

  it('displays kana input field', () => {
    const wrapper = mountDialog()
    const kanaInput = wrapper.find('input[name="kana"]')
    expect(kanaInput.exists()).toBe(true)
  })

  it('displays short meaning input field', () => {
    const wrapper = mountDialog()
    const meaningInput = wrapper.find('input[name="shortMeaning"]')
    expect(meaningInput.exists()).toBe(true)
  })

  it('pre-fills word when initialWord prop is provided', async () => {
    const wrapper = mountDialog({ initialWord: '日本語' })
    await wrapper.vm.$nextTick()
    const wordInput = wrapper.find('input[name="word"]')
    expect((wordInput.element as HTMLInputElement).value).toBe('日本語')
  })

  it('renders cancel button', () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
    expect(cancelButton?.exists()).toBe(true)
  })

  it('renders submit button', () => {
    const wrapper = mountDialog()
    const submitButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Create & View')
    expect(submitButton?.exists()).toBe(true)
  })

  it('emits cancel event when cancel button is clicked', async () => {
    const wrapper = mountDialog()
    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
    await cancelButton?.trigger('click')
    expect(wrapper.emitted('cancel')).toBeTruthy()
  })
})
