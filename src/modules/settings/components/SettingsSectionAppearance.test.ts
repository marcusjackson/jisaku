/**
 * Tests for SettingsSectionAppearance component
 */

import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SettingsSectionAppearance from './SettingsSectionAppearance.vue'

// Mock the theme composable
vi.mock('@/shared/composables/use-theme', () => ({
  useTheme: vi.fn(() => ({
    theme: { value: 'light' },
    toggleTheme: vi.fn()
  }))
}))

// Mock app version
vi.stubGlobal('__APP_VERSION__', '1.0.0')

describe('SettingsSectionAppearance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders theme toggle section', () => {
    render(SettingsSectionAppearance)

    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(
      screen.getByText(/Switch between light and dark mode/i)
    ).toBeInTheDocument()
  })

  it('renders version section', () => {
    render(SettingsSectionAppearance)

    expect(screen.getByText('Version')).toBeInTheDocument()
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('displays component structure', () => {
    const { container } = render(SettingsSectionAppearance)

    // Check for the main component class
    const settingsSection = container.querySelector(
      '.settings-section-appearance'
    )
    expect(settingsSection).toBeInTheDocument()
  })

  it('displays theme and version options', () => {
    const { container } = render(SettingsSectionAppearance)

    const options = container.querySelectorAll(
      '.settings-section-appearance-option'
    )
    expect(options).toHaveLength(2) // Theme and Version
  })

  it('formats version with v prefix', () => {
    render(SettingsSectionAppearance)

    // Version should have 'v' prefix
    expect(screen.getByText('v1.0.0')).toBeInTheDocument()
  })

  it('renders theme toggle control', () => {
    const { container } = render(SettingsSectionAppearance)

    // BaseSwitch should be present
    const switchElement = container.querySelector('[role="switch"]')
    expect(switchElement).toBeInTheDocument()
  })
})
