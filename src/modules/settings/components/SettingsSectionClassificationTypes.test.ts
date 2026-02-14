/**
 * SettingsSectionClassificationTypes Tests
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import SettingsSectionClassificationTypes from './SettingsSectionClassificationTypes.vue'

// Mock SharedSection
vi.mock('@/shared/components/SharedSection.vue', () => ({
  default: {
    name: 'SharedSection',
    props: ['title', 'testId', 'collapsible', 'defaultOpen'],
    template: '<section><h2>{{ title }}</h2><slot /></section>'
  }
}))

describe('SettingsSectionClassificationTypes', () => {
  it('renders the section title', () => {
    render(SettingsSectionClassificationTypes)
    expect(screen.getByText('Classification Types')).toBeInTheDocument()
  })

  it('displays coming soon message', () => {
    render(SettingsSectionClassificationTypes)
    expect(screen.getByText('Coming soon...')).toBeInTheDocument()
  })

  it('displays the section description', () => {
    render(SettingsSectionClassificationTypes)
    expect(
      screen.getByText(/manage classification types for kanji/i)
    ).toBeInTheDocument()
  })
})
