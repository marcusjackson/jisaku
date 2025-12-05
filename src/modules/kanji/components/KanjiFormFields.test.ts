/**
 * Tests for KanjiFormFields component
 */

import { ref } from 'vue'

import { render, screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiFormFields from './KanjiFormFields.vue'

// Mock vee-validate useField with proper refs
vi.mock('vee-validate', () => ({
  useField: vi.fn((name: string) => ({
    errorMessage: ref(undefined),
    value: ref(
      name === 'strokeCount' ? undefined : name === 'componentIds' ? [] : ''
    )
  })),
  useForm: vi.fn(() => ({
    handleSubmit: vi.fn((fn: () => void) => fn),
    resetForm: vi.fn(),
    values: ref({}),
    isSubmitting: ref(false),
    errors: ref({}),
    setFieldValue: vi.fn()
  }))
}))

// Mock RadicalFormModal component to avoid complexity in tests
vi.mock('./RadicalFormModal.vue', () => ({
  default: {
    name: 'RadicalFormModal',
    template: '<div data-testid="radical-form-modal-mock"></div>'
  }
}))

describe('KanjiFormFields', () => {
  const defaultProps = {
    radicalOptions: [],
    componentOptions: []
  }

  it('renders character input', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
  })

  it('renders stroke count input', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/stroke count/i)).toBeInTheDocument()
  })

  it('renders JLPT level select', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/jlpt/i)).toBeInTheDocument()
  })

  it('renders Joyo level select', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/jōyō/i)).toBeInTheDocument()
  })

  it('renders etymology notes textarea', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/etymology/i)).toBeInTheDocument()
  })

  it('renders cultural notes textarea', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/cultural/i)).toBeInTheDocument()
  })

  it('renders personal notes textarea', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/personal/i)).toBeInTheDocument()
  })

  it('marks character as required', () => {
    render(KanjiFormFields, { props: defaultProps })

    // Character should have required indicator
    const characterGroup = screen.getByLabelText(/character/i).closest('div')
    expect(characterGroup?.textContent).toContain('*')
  })

  it('marks stroke count as required', () => {
    render(KanjiFormFields, { props: defaultProps })

    // Stroke count should have required indicator
    const strokeGroup = screen.getByLabelText(/stroke count/i).closest('div')
    expect(strokeGroup?.textContent).toContain('*')
  })

  it('has personal notes placeholder', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(
      screen.getByPlaceholderText(/mnemonics, personal observations/i)
    ).toBeInTheDocument()
  })

  it('renders radical combobox', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/radical/i)).toBeInTheDocument()
  })

  it('renders new radical button', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByRole('button', { name: /new/i })).toBeInTheDocument()
  })

  it('renders components selector', () => {
    render(KanjiFormFields, { props: defaultProps })

    expect(screen.getByLabelText(/kanji components/i)).toBeInTheDocument()
  })
})
