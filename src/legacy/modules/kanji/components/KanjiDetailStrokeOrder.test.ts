/**
 * Tests for KanjiDetailStrokeOrder component
 *
 * Note: Uses stubs to avoid issues with URL.createObjectURL in JSDOM.
 * Full behavior is tested via E2E tests.
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import KanjiDetailStrokeOrder from './KanjiDetailStrokeOrder.vue'

// Mock URL.createObjectURL and URL.revokeObjectURL
vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:mock-url'),
  revokeObjectURL: vi.fn()
})

function mountStrokeOrder(props = {}) {
  return mount(KanjiDetailStrokeOrder, {
    props: {
      strokeDiagram: null,
      strokeGif: null,
      ...props
    },
    global: {
      stubs: {
        BaseButton: {
          props: ['disabled', 'size', 'variant'],
          template: '<button :disabled="disabled"><slot /></button>'
        },
        BaseFileInput: {
          props: ['accept', 'label'],
          emits: ['change'],
          template: '<div class="file-input">{{ label }}</div>'
        }
      }
    }
  })
}

describe('KanjiDetailStrokeOrder', () => {
  it('renders empty state when no images provided', () => {
    const wrapper = mountStrokeOrder()

    expect(wrapper.text()).toContain('No stroke order images')
  })

  it('renders Edit button', () => {
    const wrapper = mountStrokeOrder()

    const button = wrapper.find('button')
    expect(button.text()).toContain('Edit')
  })

  it('switches to edit mode when Edit clicked', async () => {
    const wrapper = mountStrokeOrder()

    await wrapper.find('button').trigger('click')

    // Should show Save and Cancel buttons in edit mode
    expect(wrapper.text()).toContain('Save')
    expect(wrapper.text()).toContain('Cancel')
  })

  it('exits edit mode when Cancel clicked', async () => {
    const wrapper = mountStrokeOrder()

    // Enter edit mode
    await wrapper.find('button').trigger('click')

    // Find Cancel button and click it
    const cancelButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Cancel'))
    await cancelButton?.trigger('click')

    // Should be back in view mode
    expect(wrapper.text()).toContain('Edit')
  })

  it('renders images when provided as Uint8Array', () => {
    // Create a minimal PNG header
    const pngHeader = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a
    ])

    const wrapper = mountStrokeOrder({
      strokeDiagram: pngHeader
    })

    // Should show the image caption
    expect(wrapper.text()).toContain('Stroke Diagram')
  })
})
