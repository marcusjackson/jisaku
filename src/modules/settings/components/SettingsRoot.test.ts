/**
 * SettingsRoot Tests
 */

import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'

import SettingsRoot from './SettingsRoot.vue'

// Mock child section components
vi.mock('./SettingsSectionAppearance.vue', () => ({
  default: {
    name: 'SettingsSectionAppearance',
    template: '<div data-testid="section-appearance">Appearance</div>'
  }
}))

vi.mock('./SettingsSectionPositionTypes.vue', () => ({
  default: {
    name: 'SettingsSectionPositionTypes',
    template: '<div data-testid="section-position-types">Position Types</div>'
  }
}))

vi.mock('./SettingsSectionClassificationTypes.vue', () => ({
  default: {
    name: 'SettingsSectionClassificationTypes',
    template:
      '<div data-testid="section-classification-types">Classification Types</div>'
  }
}))

vi.mock('./SettingsSectionDatabase.vue', () => ({
  default: {
    name: 'SettingsSectionDatabase',
    template: '<div data-testid="section-database">Database</div>'
  }
}))

vi.mock('./SettingsSectionDevTools.vue', () => ({
  default: {
    name: 'SettingsSectionDevTools',
    template: '<div data-testid="section-dev-tools">DevTools</div>'
  }
}))

describe('SettingsRoot', () => {
  it('renders the title', () => {
    const wrapper = mount(SettingsRoot)
    expect(wrapper.find('.settings-root__title').text()).toBe('Settings')
  })

  it('renders all sections', () => {
    const wrapper = mount(SettingsRoot)

    expect(wrapper.find('[data-testid="section-appearance"]').exists()).toBe(
      true
    )
    expect(
      wrapper.find('[data-testid="section-position-types"]').exists()
    ).toBe(true)
    expect(
      wrapper.find('[data-testid="section-classification-types"]').exists()
    ).toBe(true)
    expect(wrapper.find('[data-testid="section-database"]').exists()).toBe(true)
  })

  it('shows dev tools section in development mode', () => {
    vi.stubEnv('DEV', true)
    const wrapper = mount(SettingsRoot)

    expect(wrapper.find('[data-testid="section-dev-tools"]').exists()).toBe(
      true
    )

    vi.unstubAllEnvs()
  })

  it('hides dev tools section in production mode', () => {
    vi.stubEnv('DEV', false)
    const wrapper = mount(SettingsRoot)

    expect(wrapper.find('[data-testid="section-dev-tools"]').exists()).toBe(
      false
    )

    vi.unstubAllEnvs()
  })
})
