/**
 * SettingsSectionDevTools tests
 *
 * Tests for the developer tools settings section.
 */

import { ref } from 'vue'

import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock values
const mockSeed = vi.fn()
const mockClear = vi.fn()
const mockIsSeeding = ref(false)
const mockIsClearing = ref(false)

vi.mock('@/legacy/shared/composables/use-seed-data', () => ({
  useSeedData: () => ({
    clear: mockClear,
    isClearing: mockIsClearing,
    isSeeding: mockIsSeeding,
    seed: mockSeed
  })
}))

import SettingsSectionDevTools from './SettingsSectionDevTools.vue'

describe('SettingsSectionDevTools', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsSeeding.value = false
    mockIsClearing.value = false
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(SettingsSectionDevTools, {
      global: {
        stubs: {
          BaseButton: {
            props: ['disabled', 'loading', 'variant'],
            template:
              '<button :disabled="disabled || loading"><slot /></button>'
          },
          SharedConfirmDialog: {
            props: ['isOpen', 'title', 'description'],
            template: `
              <div v-if="isOpen" data-testid="confirm-dialog">
                <span>{{ title }}</span>
                <span>{{ description }}</span>
                <button @click="$emit('confirm')">Clear</button>
                <button @click="$emit('cancel')">Cancel</button>
              </div>
            `,
            emits: ['confirm', 'cancel']
          }
        }
      }
    })
  }

  it('renders seed database action', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Seed Database')
    expect(wrapper.text()).toContain('Add sample kanji data')
    expect(wrapper.text()).toContain('Seed Data')
  })

  it('renders clear database action', () => {
    const wrapper = mountComponent()

    expect(wrapper.text()).toContain('Clear Database')
    expect(wrapper.text()).toContain('Remove all kanji data')
    expect(wrapper.text()).toContain('Clear All Data')
  })

  it('calls seed when seed button is clicked', async () => {
    const wrapper = mountComponent()

    const seedButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Seed Data'))
    await seedButton?.trigger('click')

    expect(mockSeed).toHaveBeenCalled()
  })

  it('shows confirmation dialog when clear button is clicked', async () => {
    const wrapper = mountComponent()

    const clearButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Clear All Data'))
    await clearButton?.trigger('click')

    expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
    // The dialog shows with title "Clear All Data" (see SettingsSectionDevTools.vue)
    expect(wrapper.find('[data-testid="confirm-dialog"]').text()).toContain(
      'permanently delete'
    )
  })

  it('calls clear when confirmation is accepted', async () => {
    const wrapper = mountComponent()

    // Open dialog
    const clearButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Clear All Data'))
    await clearButton?.trigger('click')

    // Find and click confirm button in the dialog
    const confirmButton = wrapper
      .find('[data-testid="confirm-dialog"]')
      .findAll('button')
      .find((b) => b.text() === 'Clear')
    await confirmButton?.trigger('click')

    expect(mockClear).toHaveBeenCalled()
  })

  it('closes dialog without clearing when cancelled', async () => {
    const wrapper = mountComponent()

    // Open dialog
    const clearButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Clear All Data'))
    await clearButton?.trigger('click')

    // Find and click cancel button in the dialog
    const cancelButton = wrapper
      .find('[data-testid="confirm-dialog"]')
      .findAll('button')
      .find((b) => b.text() === 'Cancel')
    await cancelButton?.trigger('click')

    expect(mockClear).not.toHaveBeenCalled()
  })

  it('disables buttons while seeding', () => {
    mockIsSeeding.value = true
    const wrapper = mountComponent()

    const buttons = wrapper.findAll('button')
    const seedButton = buttons.find((b) => b.text().includes('Seeding'))
    const clearButton = buttons.find((b) => b.text().includes('Clear'))

    expect(seedButton?.element.disabled).toBe(true)
    expect(clearButton?.element.disabled).toBe(true)
  })

  it('disables buttons while clearing', () => {
    mockIsClearing.value = true
    const wrapper = mountComponent()

    const buttons = wrapper.findAll('button')
    const seedButton = buttons.find((b) => b.text().includes('Seed'))
    const clearButton = buttons.find((b) => b.text().includes('Clearing'))

    expect(seedButton?.element.disabled).toBe(true)
    expect(clearButton?.element.disabled).toBe(true)
  })
})
