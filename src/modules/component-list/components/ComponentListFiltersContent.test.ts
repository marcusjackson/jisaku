/**
 * Component List Filters Content Tests
 *
 * Tests for the filter content container component.
 */

import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import ComponentListFiltersContent from './ComponentListFiltersContent.vue'

describe('ComponentListFiltersContent', () => {
  const defaultProps = {
    filters: {},
    characterSearch: '',
    keywordsSearch: '',
    kangxiSearch: ''
  }

  it('renders all filter inputs', () => {
    render(ComponentListFiltersContent, {
      props: defaultProps
    })

    // Check for filter labels
    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/keywords/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kangxi/i)).toBeInTheDocument()
  })

  it('renders stroke filter section', () => {
    render(ComponentListFiltersContent, {
      props: defaultProps
    })

    expect(screen.getByText(/strokes/i)).toBeInTheDocument()
  })

  it('renders radical status filter', () => {
    render(ComponentListFiltersContent, {
      props: defaultProps
    })

    expect(screen.getByText(/radical/i)).toBeInTheDocument()
  })

  it('renders presence filter sections', () => {
    render(ComponentListFiltersContent, {
      props: defaultProps
    })

    expect(screen.getByText(/description/i)).toBeInTheDocument()
    expect(screen.getByText(/forms/i)).toBeInTheDocument()
    expect(screen.getByText(/groupings/i)).toBeInTheDocument()
  })
})
