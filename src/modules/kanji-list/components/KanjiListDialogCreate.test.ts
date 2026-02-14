/**
 * KanjiListDialogCreate Tests
 *
 * Tests for the create kanji dialog form component.
 * Uses vee-validate + zod for validation.
 */

import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import KanjiListDialogCreate from './KanjiListDialogCreate.vue'

// Mock repositories
const mockCreate = vi.fn().mockReturnValue({ id: 1, character: '山' })
const mockGetByCharacter = vi.fn().mockReturnValue(null)

vi.mock('@/api/kanji', () => ({
  useKanjiRepository: () => ({
    create: mockCreate,
    getByCharacter: mockGetByCharacter
  })
}))

vi.mock('@/shared/composables', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn()
  })
}))

describe('KanjiListDialogCreate', () => {
  beforeEach(() => {
    mockCreate.mockClear()
    mockGetByCharacter.mockClear()
    mockGetByCharacter.mockReturnValue(null)
  })

  it('renders form with character input', () => {
    render(KanjiListDialogCreate)

    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
  })

  it('renders submit and cancel buttons', () => {
    render(KanjiListDialogCreate)

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('creates kanji when valid character submitted', async () => {
    const user = userEvent.setup()

    render(KanjiListDialogCreate)

    await user.type(screen.getByLabelText(/character/i), '山')
    await user.click(screen.getByRole('button', { name: /add/i }))

    // Wait for vee-validate async validation to complete
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ character: '山' })
    })
  })

  it('emits cancel event when cancel clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(KanjiListDialogCreate, {
      props: { onCancel: vi.fn() }
    })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('does not submit form when field is empty', async () => {
    const user = userEvent.setup()

    render(KanjiListDialogCreate)

    await user.click(screen.getByRole('button', { name: /add/i }))

    // Form should not submit with empty field
    await waitFor(() => {
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  it('shows validation error for multiple characters', async () => {
    const user = userEvent.setup()

    render(KanjiListDialogCreate)

    await user.type(screen.getByLabelText(/character/i), '山水')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/please enter only one character/i)
      ).toBeInTheDocument()
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('shows error when kanji already exists', async () => {
    mockGetByCharacter.mockReturnValue({ id: 99, character: '山' })
    const user = userEvent.setup()

    render(KanjiListDialogCreate)

    await user.type(screen.getByLabelText(/character/i), '山')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/this kanji is already registered/i)
      ).toBeInTheDocument()
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
