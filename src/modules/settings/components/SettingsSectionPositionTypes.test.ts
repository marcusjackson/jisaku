/**
 * SettingsSectionPositionTypes Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import SettingsSectionPositionTypes from './SettingsSectionPositionTypes.vue'

// Mock SharedSection
vi.mock('@/shared/components/SharedSection.vue', () => ({
  default: {
    name: 'SharedSection',
    props: ['title', 'testId', 'collapsible', 'defaultOpen'],
    template: '<section><h2>{{ title }}</h2><slot /></section>'
  }
}))

describe('SettingsSectionPositionTypes', () => {
  it('renders the section title', () => {
    render(SettingsSectionPositionTypes)
    expect(screen.getByText('Position Types')).toBeInTheDocument()
  })

  it('displays coming soon message', () => {
    render(SettingsSectionPositionTypes)
    expect(screen.getByText('Coming soon...')).toBeInTheDocument()
  })

  it('displays the section description', () => {
    render(SettingsSectionPositionTypes)
    expect(
      screen.getByText(/manage position types for components/i)
    ).toBeInTheDocument()
  })
})
