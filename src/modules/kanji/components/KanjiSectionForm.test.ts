/**
 * Tests for KanjiSectionForm component
 */

import { ref } from 'vue'

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import KanjiSectionForm from './KanjiSectionForm.vue'

// Stub child components that use vee-validate
const RadicalFormModalStub = {
  name: 'RadicalFormModal',
  props: ['open', 'createRadical'],
  emits: ['update:open', 'created'],
  template: '<div data-testid="radical-form-modal-stub"></div>'
}

// Mock vee-validate to avoid context issues - use proper refs
vi.mock('vee-validate', () => ({
  useField: vi.fn((name: string) => ({
    errorMessage: ref(undefined),
    value: ref(name === 'componentIds' ? [] : '')
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

describe('KanjiSectionForm', () => {
  const defaultProps = {
    mode: 'create' as const,
    radicalOptions: [],
    createRadical: vi.fn()
  }

  const globalStubs = {
    RadicalFormModal: RadicalFormModalStub
  }

  it('renders create mode title', () => {
    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, mode: 'create' },
      global: { stubs: globalStubs }
    })

    expect(
      screen.getByRole('heading', { name: /new kanji/i })
    ).toBeInTheDocument()
  })

  it('renders edit mode title', () => {
    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, mode: 'edit' },
      global: { stubs: globalStubs }
    })

    expect(
      screen.getByRole('heading', { name: /edit kanji/i })
    ).toBeInTheDocument()
  })

  it('renders back link', () => {
    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, backUrl: '/' },
      global: { stubs: globalStubs }
    })

    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })

  it('renders back link with custom URL', () => {
    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, backUrl: '/kanji/1', mode: 'edit' },
      global: { stubs: globalStubs }
    })

    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
      'href',
      '/kanji/1'
    )
  })

  it('renders cancel button', () => {
    renderWithProviders(KanjiSectionForm, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders create button in create mode', () => {
    renderWithProviders(KanjiSectionForm, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    expect(
      screen.getByRole('button', { name: /create kanji/i })
    ).toBeInTheDocument()
  })

  it('renders save button in edit mode', () => {
    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, mode: 'edit' },
      global: { stubs: globalStubs }
    })

    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument()
  })

  it('emits cancel event when cancel clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, onCancel },
      global: { stubs: globalStubs }
    })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('emits submit event when form submitted', () => {
    const result = renderWithProviders(KanjiSectionForm, {
      props: defaultProps,
      global: { stubs: globalStubs }
    })

    // Get the form and trigger submit event directly
    const form = document.querySelector('form')
    expect(form).not.toBeNull()
    form?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true })
    )

    expect(result.emitted()['submit']).toBeTruthy()
  })

  it('disables buttons when submitting', () => {
    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, isSubmitting: true },
      global: { stubs: globalStubs }
    })

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('shows saving text in edit mode when submitting', () => {
    renderWithProviders(KanjiSectionForm, {
      props: { ...defaultProps, isSubmitting: true, mode: 'edit' },
      global: { stubs: globalStubs }
    })

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
  })
})
