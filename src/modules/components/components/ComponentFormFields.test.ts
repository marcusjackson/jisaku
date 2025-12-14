/**
 * Tests for ComponentFormFields component
 */

import { ref } from 'vue'

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentFormFields from './ComponentFormFields.vue'

// Mock vee-validate useField with proper refs
vi.mock('vee-validate', () => ({
  useField: vi.fn((name: string) => ({
    errorMessage: ref(undefined),
    value: ref(
      name === 'strokeCount' ? undefined : name === 'sourceKanjiId' ? null : ''
    )
  }))
}))

describe('ComponentFormFields', () => {
  const defaultProps = {
    kanjiOptions: []
  }

  it('renders character input', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
  })

  it('renders stroke count input', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/stroke count/i)).toBeInTheDocument()
  })

  it('renders description input', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(
      screen.getByLabelText('Description', { exact: true })
    ).toBeInTheDocument()
  })

  it('renders search keywords input', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/search keywords/i)).toBeInTheDocument()
  })

  it('renders source kanji combobox', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/source kanji/i)).toBeInTheDocument()
  })

  it('renders description textarea', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/^description$/i)).toBeInTheDocument()
  })

  it('renders can be radical checkbox', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(screen.getByText(/can be used as a radical/i)).toBeInTheDocument()
  })

  // Note: Testing conditional radical fields requires complex VeeValidate form interaction
  // Tested via E2E tests instead

  it('marks character as required', () => {
    render(ComponentFormFields, { props: defaultProps })

    // Character should have required indicator
    const characterGroup = screen.getByLabelText(/character/i).closest('div')
    expect(characterGroup?.textContent).toContain('*')
  })

  it('marks stroke count as required', () => {
    render(ComponentFormFields, { props: defaultProps })

    // Stroke count should have required indicator
    const strokeGroup = screen.getByLabelText(/stroke count/i).closest('div')
    expect(strokeGroup?.textContent).toContain('*')
  })

  it('has description placeholder', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(
      screen.getByPlaceholderText(/add detailed description/i)
    ).toBeInTheDocument()
  })

  it('has japanese name placeholder', () => {
    render(ComponentFormFields, { props: defaultProps })

    expect(screen.getByPlaceholderText(/にんべん/i)).toBeInTheDocument()
  })
})
