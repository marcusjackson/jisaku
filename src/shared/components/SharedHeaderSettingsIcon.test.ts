/**
 * Tests for SharedHeaderSettingsIcon component
 */

import { render } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import SharedHeaderSettingsIcon from './SharedHeaderSettingsIcon.vue'

describe('SharedHeaderSettingsIcon', () => {
  it('renders settings icon SVG', () => {
    const { container } = render(SharedHeaderSettingsIcon)

    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('shared-header-settings-icon')
  })

  it('renders gear icon with correct viewBox', () => {
    const { container } = render(SharedHeaderSettingsIcon)

    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 472.615 472.615')
  })
})
