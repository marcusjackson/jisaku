/**
 * Tests for KanjiDetailQuickCreateVocabulary component
 */

import { renderWithProviders as render } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'

import KanjiDetailQuickCreateVocabulary from './KanjiDetailQuickCreateVocabulary.vue'

describe('KanjiDetailQuickCreateVocabulary', () => {
  it('renders form fields', () => {
    render(KanjiDetailQuickCreateVocabulary)

    expect(screen.getByLabelText(/^word$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/kana.*optional/i)).toBeInTheDocument()
    expect(
      screen.getByLabelText(/short meaning.*optional/i)
    ).toBeInTheDocument()
  })

  it('renders action buttons', () => {
    render(KanjiDetailQuickCreateVocabulary)

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /create & link/i })
    ).toBeInTheDocument()
  })

  it('pre-fills word field with initialWord prop', () => {
    render(KanjiDetailQuickCreateVocabulary, {
      props: { initialWord: '日本' }
    })

    const wordInput = screen.getByLabelText(/^word$/i)
    expect(wordInput).toHaveValue('日本')
  })

  it('emits create event with form data on submit', async () => {
    const user = userEvent.setup()

    const { emitted } = render(KanjiDetailQuickCreateVocabulary, {
      props: { initialWord: '日本' }
    })

    const kanaInput = screen.getByLabelText(/kana.*optional/i)
    const meaningInput = screen.getByLabelText(/short meaning.*optional/i)
    const submitButton = screen.getByRole('button', { name: /create & link/i })

    await user.type(kanaInput, 'にほん')
    await user.type(meaningInput, 'Japan')
    await user.click(submitButton)

    await waitFor(() => {
      expect(emitted()['create']).toBeTruthy()
    })

    const createEvent = emitted()['create']?.[0] as unknown[]
    expect(createEvent[0]).toEqual({
      word: '日本',
      kana: 'にほん',
      shortMeaning: 'Japan'
    })
  })

  it('emits cancel event when cancel button clicked', async () => {
    const user = userEvent.setup()

    const { emitted } = render(KanjiDetailQuickCreateVocabulary)

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    expect(emitted()['cancel']).toBeTruthy()
  })

  it('shows validation error when word is empty', async () => {
    const user = userEvent.setup()

    render(KanjiDetailQuickCreateVocabulary)

    const wordInput = screen.getByLabelText(/^word$/i)
    const submitButton = screen.getByRole('button', { name: /create & link/i })

    await user.clear(wordInput)
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/word is required/i)).toBeInTheDocument()
    })
  })

  it('allows submitting with only word filled', async () => {
    const user = userEvent.setup()

    const { emitted } = render(KanjiDetailQuickCreateVocabulary)

    const wordInput = screen.getByLabelText(/^word$/i)
    const submitButton = screen.getByRole('button', { name: /create & link/i })

    await user.type(wordInput, '明日')
    await user.click(submitButton)

    await waitFor(() => {
      expect(emitted()['create']).toBeTruthy()
    })

    const createEvent = emitted()['create']?.[0] as unknown[]
    expect(createEvent[0]).toEqual({
      word: '明日',
      kana: '',
      shortMeaning: ''
    })
  })

  it('converts empty shortMeaning to null', async () => {
    const user = userEvent.setup()

    const { emitted } = render(KanjiDetailQuickCreateVocabulary)

    const wordInput = screen.getByLabelText(/^word$/i)
    const meaningInput = screen.getByLabelText(/short meaning.*optional/i)
    const submitButton = screen.getByRole('button', { name: /create & link/i })

    await user.type(wordInput, '日本')
    await user.type(meaningInput, '   ')
    await user.click(submitButton)

    await waitFor(() => {
      expect(emitted()['create']).toBeTruthy()
    })

    const createEvent = emitted()['create']?.[0] as unknown[]
    expect(createEvent[0]).toMatchObject({
      word: '日本',
      shortMeaning: ''
    })
  })
})
