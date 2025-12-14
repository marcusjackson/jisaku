/**
 * SettingsRoot tests
 *
 * Tests for the settings root component.
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock values
const mockInitialize = vi.fn().mockResolvedValue(undefined)
const mockIsInitializing = ref(false)
const mockIsInitialized = ref(false)
const mockInitError = ref<Error | null>(null)

vi.mock('@/shared/composables/use-database', () => ({
  useDatabase: () => ({
    initError: mockInitError,
    initialize: mockInitialize,
    isInitialized: mockIsInitialized,
    isInitializing: mockIsInitializing
  })
}))

// Mock child components
vi.mock('./SettingsSectionDatabase.vue', () => ({
  default: {
    name: 'SettingsSectionDatabase',
    template: '<div data-testid="database-section">Database Section</div>'
  }
}))

vi.mock('./SettingsSectionDevTools.vue', () => ({
  default: {
    name: 'SettingsSectionDevTools',
    template: '<div data-testid="dev-tools">Dev Tools Section</div>'
  }
}))

// Import after mocks
import SettingsRoot from './SettingsRoot.vue'

describe('SettingsRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInitialize.mockResolvedValue(undefined)
    mockIsInitializing.value = false
    mockIsInitialized.value = false
    mockInitError.value = null
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state while initializing', () => {
    mockIsInitializing.value = true

    const wrapper = mount(SettingsRoot)

    expect(wrapper.text()).toContain('Loading')
  })

  it('shows error state when initialization fails', () => {
    mockInitError.value = new Error('Database connection failed')

    const wrapper = mount(SettingsRoot)

    expect(wrapper.text()).toContain('Failed to load')
    expect(wrapper.text()).toContain('Database connection failed')
  })

  it('shows settings content when initialized', async () => {
    mockIsInitialized.value = true

    const wrapper = mount(SettingsRoot)
    await flushPromises()

    expect(wrapper.text()).toContain('Settings')
    // Check for section titles
    expect(wrapper.text()).toContain('Appearance')
    expect(wrapper.text()).toContain('Position Types')
    expect(wrapper.text()).toContain('Data Management')
    expect(wrapper.text()).toContain('Developer Tools')
  })

  it('calls initialize on mount', async () => {
    mount(SettingsRoot)
    await flushPromises()

    expect(mockInitialize).toHaveBeenCalled()
  })

  it('handles initialize error gracefully', async () => {
    mockInitialize.mockRejectedValue(new Error('Init failed'))

    // Should not throw
    mount(SettingsRoot)
    await flushPromises()

    expect(mockInitialize).toHaveBeenCalled()
  })
})
