/**
 * Tests for ComponentSectionForm component
 */

import { ref } from 'vue'

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { describe, expect, it, vi } from 'vitest'

import ComponentSectionForm from './ComponentSectionForm.vue'

// Mock vee-validate to avoid context issues - use proper refs
vi.mock('vee-validate', () => ({
  useField: vi.fn(() => ({
    errorMessage: ref(undefined),
    value: ref('')
  }))
}))

const defaultKanjiOptions = [
  { label: '日 - Sun', value: 1 },
  { label: '月 - Moon', value: 2 }
]

describe('ComponentSectionForm', () => {
  it('renders create mode title', () => {
    renderWithProviders(ComponentSectionForm, {
      props: { kanjiOptions: defaultKanjiOptions, mode: 'create' }
    })

    expect(
      screen.getByRole('heading', { name: /new component/i })
    ).toBeInTheDocument()
  })

  it('renders edit mode title', () => {
    renderWithProviders(ComponentSectionForm, {
      props: { kanjiOptions: defaultKanjiOptions, mode: 'edit' }
    })

    expect(
      screen.getByRole('heading', { name: /edit component/i })
    ).toBeInTheDocument()
  })

  it('renders back link', () => {
    renderWithProviders(ComponentSectionForm, {
      props: {
        backUrl: '/components',
        kanjiOptions: defaultKanjiOptions,
        mode: 'create'
      }
    })

    expect(screen.getByRole('link', { name: /back/i })).toBeInTheDocument()
  })

  it('renders back link with custom URL', () => {
    renderWithProviders(ComponentSectionForm, {
      props: {
        backUrl: '/components/1',
        kanjiOptions: defaultKanjiOptions,
        mode: 'edit'
      }
    })

    expect(screen.getByRole('link', { name: /back/i })).toHaveAttribute(
      'href',
      '/components/1'
    )
  })

  it('renders cancel button', () => {
    renderWithProviders(ComponentSectionForm, {
      props: { kanjiOptions: defaultKanjiOptions, mode: 'create' }
    })

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('renders create button in create mode', () => {
    renderWithProviders(ComponentSectionForm, {
      props: { kanjiOptions: defaultKanjiOptions, mode: 'create' }
    })

    expect(
      screen.getByRole('button', { name: /create component/i })
    ).toBeInTheDocument()
  })

  it('renders save button in edit mode', () => {
    renderWithProviders(ComponentSectionForm, {
      props: { kanjiOptions: defaultKanjiOptions, mode: 'edit' }
    })

    expect(
      screen.getByRole('button', { name: /save changes/i })
    ).toBeInTheDocument()
  })

  it('emits cancel event when cancel clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    renderWithProviders(ComponentSectionForm, {
      props: { kanjiOptions: defaultKanjiOptions, mode: 'create', onCancel }
    })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(onCancel).toHaveBeenCalled()
  })

  it('emits submit event when form submitted', () => {
    const result = renderWithProviders(ComponentSectionForm, {
      props: { kanjiOptions: defaultKanjiOptions, mode: 'create' }
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
    renderWithProviders(ComponentSectionForm, {
      props: {
        isSubmitting: true,
        kanjiOptions: defaultKanjiOptions,
        mode: 'create'
      }
    })

    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('shows saving text in edit mode when submitting', () => {
    renderWithProviders(ComponentSectionForm, {
      props: {
        isSubmitting: true,
        kanjiOptions: defaultKanjiOptions,
        mode: 'edit'
      }
    })

    expect(screen.getByRole('button', { name: /saving/i })).toBeInTheDocument()
  })
})
