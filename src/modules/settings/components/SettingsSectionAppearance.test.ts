/**
 * SettingsSectionAppearance Tests
 */

import { defineComponent } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import SettingsSectionAppearance from './SettingsSectionAppearance.vue'

// Mock BaseSwitch
vi.mock('@/base/components', async (importOriginal) => {
  const original = await importOriginal<Record<string, unknown>>()
  const MockSwitch = defineComponent({
    name: 'BaseSwitch',
    props: {
      modelValue: Boolean,
      ariaLabel: { type: String, default: '' }
    },
    emits: ['update:modelValue'],
    template: `
      <button
        :aria-label="ariaLabel"
        :aria-checked="modelValue"
        role="switch"
        @click="$emit('update:modelValue', !modelValue)"
      >
        {{ modelValue ? 'On' : 'Off' }}
      </button>
    `
  })
  return { ...original, BaseSwitch: MockSwitch }
})

// Mock SharedSection
vi.mock('@/shared/components/SharedSection.vue', () => ({
  default: {
    name: 'SharedSection',
    props: ['title', 'testId'],
    template: '<section><h2>{{ title }}</h2><slot /></section>'
  }
}))

// Mock APP_VERSION
vi.mock('../utils/constants', () => ({
  APP_VERSION: '1.0.0-test'
}))

describe('SettingsSectionAppearance', () => {
  it('renders the section title', () => {
    render(SettingsSectionAppearance, {
      props: {
        theme: 'light'
      }
    })
    expect(screen.getByText('Appearance')).toBeInTheDocument()
  })

  it('displays the theme toggle', () => {
    render(SettingsSectionAppearance, {
      props: {
        theme: 'light'
      }
    })
    expect(screen.getByText('Theme')).toBeInTheDocument()
    expect(
      screen.getByText('Switch between light and dark mode')
    ).toBeInTheDocument()
  })

  it('displays the app version', () => {
    render(SettingsSectionAppearance, {
      props: {
        theme: 'light'
      }
    })
    expect(screen.getByText('App Version')).toBeInTheDocument()
    expect(screen.getByText('1.0.0-test')).toBeInTheDocument()
  })

  it('toggles theme when switch is clicked', async () => {
    const user = userEvent.setup()
    const { emitted } = render(SettingsSectionAppearance, {
      props: {
        theme: 'light'
      }
    })

    const themeSwitch = screen.getByRole('switch')
    expect(themeSwitch).toHaveAttribute('aria-checked', 'false')

    await user.click(themeSwitch)

    expect(emitted()['toggle-theme']).toBeTruthy()
  })

  it('shows correct switch state for dark theme', () => {
    render(SettingsSectionAppearance, {
      props: {
        theme: 'dark'
      }
    })

    const themeSwitch = screen.getByRole('switch')
    expect(themeSwitch).toHaveAttribute('aria-checked', 'true')
  })
})
