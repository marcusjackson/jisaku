/**
 * Tests for ComponentFormFields component
 *
 * Note: ComponentFormFields now has a mode prop:
 * - 'create' mode: Shows minimal fields (character, short meaning, search keywords)
 * - 'edit' mode (default): Shows all fields including stroke count, source kanji, etc.
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
    kanjiOptions: [],
    mode: 'edit' as const
  }

  const createModeProps = {
    kanjiOptions: [],
    mode: 'create' as const
  }

  describe('edit mode (default)', () => {
    it('renders character input', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
    })

    it('renders stroke count input in edit mode', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(screen.getByLabelText(/stroke count/i)).toBeInTheDocument()
    })

    it('renders description input in edit mode', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(
        screen.getByLabelText('Description', { exact: true })
      ).toBeInTheDocument()
    })

    it('renders search keywords input', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(screen.getByLabelText(/search keywords/i)).toBeInTheDocument()
    })

    it('renders source kanji combobox in edit mode', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(screen.getByLabelText(/source kanji/i)).toBeInTheDocument()
    })

    it('renders can be radical checkbox in edit mode', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(screen.getByText(/can be used as a radical/i)).toBeInTheDocument()
    })

    it('marks character as required', () => {
      render(ComponentFormFields, { props: defaultProps })

      // Character should have required indicator
      const characterGroup = screen.getByLabelText(/character/i).closest('div')
      expect(characterGroup?.textContent).toContain('*')
    })

    it('stroke count is optional (no required indicator)', () => {
      render(ComponentFormFields, { props: defaultProps })

      // Stroke count should NOT have required indicator
      const strokeGroup = screen.getByLabelText(/stroke count/i).closest('div')
      expect(strokeGroup?.textContent).not.toContain('*')
    })

    it('has description placeholder in edit mode', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(
        screen.getByPlaceholderText(/add detailed description/i)
      ).toBeInTheDocument()
    })

    it('has japanese name placeholder in edit mode', () => {
      render(ComponentFormFields, { props: defaultProps })

      expect(screen.getByPlaceholderText(/にんべん/i)).toBeInTheDocument()
    })
  })

  describe('create mode', () => {
    it('renders character input in create mode', () => {
      render(ComponentFormFields, { props: createModeProps })

      expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
    })

    it('renders short meaning input in create mode', () => {
      render(ComponentFormFields, { props: createModeProps })

      expect(screen.getByLabelText(/short meaning/i)).toBeInTheDocument()
    })

    it('renders search keywords input in create mode', () => {
      render(ComponentFormFields, { props: createModeProps })

      expect(screen.getByLabelText(/search keywords/i)).toBeInTheDocument()
    })

    it('does NOT render stroke count in create mode', () => {
      render(ComponentFormFields, { props: createModeProps })

      expect(screen.queryByLabelText(/stroke count/i)).not.toBeInTheDocument()
    })

    it('does NOT render source kanji in create mode', () => {
      render(ComponentFormFields, { props: createModeProps })

      expect(screen.queryByLabelText(/source kanji/i)).not.toBeInTheDocument()
    })

    it('does NOT render description in create mode', () => {
      render(ComponentFormFields, { props: createModeProps })

      expect(
        screen.queryByLabelText('Description', { exact: true })
      ).not.toBeInTheDocument()
    })

    it('does NOT render can be radical in create mode', () => {
      render(ComponentFormFields, { props: createModeProps })

      expect(
        screen.queryByText(/can be used as a radical/i)
      ).not.toBeInTheDocument()
    })
  })
})
