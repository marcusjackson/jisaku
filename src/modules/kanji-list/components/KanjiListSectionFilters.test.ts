/**
 * KanjiListSectionFilters Tests
 *
 * Tests for the collapsible filter section component.
 * Note: Some interactions are limited in jsdom environment.
 */

import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import KanjiListSectionFilters from './KanjiListSectionFilters.vue'

describe('KanjiListSectionFilters', () => {
  const defaultProps = {
    filters: {},
    characterSearch: '',
    keywordsSearch: '',
    meaningsSearch: '',
    onYomiSearch: '',
    kunYomiSearch: '',
    hasActiveFilters: false,
    activeFilterCount: 0,
    components: [],
    radicals: [],
    classificationTypes: []
  }

  // Clear localStorage before each test to avoid test pollution
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders filter section', () => {
    render(KanjiListSectionFilters, {
      props: defaultProps
    })

    expect(screen.getByRole('region')).toBeInTheDocument()
  })

  it('shows filter count badge when filters active', () => {
    render(KanjiListSectionFilters, {
      props: { ...defaultProps, activeFilterCount: 3, hasActiveFilters: true }
    })

    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('has accessible toggle button', async () => {
    const user = userEvent.setup()

    render(KanjiListSectionFilters, {
      props: defaultProps
    })

    // Get first button that contains "Filters" text (excluding all the chip buttons)
    const buttons = screen.getAllByRole('button')
    const filterButton = buttons.find((btn) =>
      btn.textContent?.includes('Filters')
    )
    expect(filterButton).toBeTruthy()

    // Click to toggle
    await user.click(filterButton!)

    // aria-expanded should be present
    expect(filterButton).toHaveAttribute('aria-expanded')
  })

  it('always shows clear filters button when expanded', () => {
    render(KanjiListSectionFilters, {
      props: { ...defaultProps, hasActiveFilters: false }
    })

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    expect(clearButton).toBeInTheDocument()
  })

  it('disables clear filters button when no active filters', () => {
    render(KanjiListSectionFilters, {
      props: { ...defaultProps, hasActiveFilters: false }
    })

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    expect(clearButton).toBeDisabled()
  })

  it('enables clear filters button when filters are active', () => {
    render(KanjiListSectionFilters, {
      props: { ...defaultProps, hasActiveFilters: true }
    })

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    expect(clearButton).not.toBeDisabled()
  })

  it('shows collapse button when expanded', () => {
    render(KanjiListSectionFilters, {
      props: defaultProps
    })

    expect(
      screen.getByRole('button', { name: /collapse/i })
    ).toBeInTheDocument()
  })

  it('emits clearFilters when clear button clicked', async () => {
    const user = userEvent.setup()

    const { emitted } = render(KanjiListSectionFilters, {
      props: { ...defaultProps, hasActiveFilters: true }
    })

    const clearButton = screen.getByRole('button', { name: /clear filters/i })
    await user.click(clearButton)

    expect(emitted()['clearFilters']).toBeTruthy()
  })

  it('collapses when collapse button clicked', async () => {
    const user = userEvent.setup()

    render(KanjiListSectionFilters, {
      props: defaultProps
    })

    const collapseButton = screen.getByRole('button', { name: /collapse/i })

    // Get the filter header toggle button to check aria-expanded
    const buttons = screen.getAllByRole('button')
    const filterHeaderButton = buttons.find((btn) =>
      btn.textContent?.includes('Filters')
    )

    // Should be expanded initially
    expect(filterHeaderButton).toHaveAttribute('aria-expanded', 'true')

    // Click collapse
    await user.click(collapseButton)

    // Wait for the state to update
    await waitFor(() => {
      expect(filterHeaderButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('hides clear filters button when collapsed', async () => {
    const user = userEvent.setup()

    render(KanjiListSectionFilters, {
      props: { ...defaultProps, hasActiveFilters: true }
    })

    // Should have clear button when expanded
    expect(
      screen.getByRole('button', { name: /clear filters/i })
    ).toBeInTheDocument()

    // Collapse the filters
    const collapseButton = screen.getByRole('button', { name: /collapse/i })
    await user.click(collapseButton)

    // Wait for collapse and verify clear button is gone
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: /clear filters/i })
      ).not.toBeInTheDocument()
    })
  })
})
