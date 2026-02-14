/**
 * ComponentListDialogCreate Tests
 *
 * Tests for the create component dialog form component.
 * Uses vee-validate + zod for validation.
 */

import userEvent from '@testing-library/user-event'
import { render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ComponentListDialogCreate from './ComponentListDialogCreate.vue'

// Mock repositories
const mockCreate = vi.fn().mockReturnValue({ id: 1, character: '亻' })
const mockGetByCharacter = vi.fn().mockReturnValue(null)

vi.mock('@/api/component', () => ({
  useComponentRepository: () => ({
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

describe('ComponentListDialogCreate', () => {
  beforeEach(() => {
    mockCreate.mockClear()
    mockGetByCharacter.mockClear()
    mockGetByCharacter.mockReturnValue(null)
  })

  it('renders form with character input', () => {
    render(ComponentListDialogCreate)

    expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
  })

  it('renders submit and cancel buttons', () => {
    render(ComponentListDialogCreate)

    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('creates component when valid character submitted', async () => {
    const user = userEvent.setup()

    render(ComponentListDialogCreate)

    await user.type(screen.getByLabelText(/character/i), '亻')
    await user.click(screen.getByRole('button', { name: /add/i }))

    // Wait for vee-validate async validation to complete
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({ character: '亻' })
    })
  })

  it('emits cancel event when cancel clicked', async () => {
    const user = userEvent.setup()
    const wrapper = render(ComponentListDialogCreate, {
      props: { onCancel: vi.fn() }
    })

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    expect(wrapper.emitted('cancel')).toBeTruthy()
  })

  it('does not submit form when field is empty', async () => {
    const user = userEvent.setup()

    render(ComponentListDialogCreate)

    await user.click(screen.getByRole('button', { name: /add/i }))

    // Form should not submit with empty field
    await waitFor(() => {
      expect(mockCreate).not.toHaveBeenCalled()
    })
  })

  it('shows validation error for multiple characters', async () => {
    const user = userEvent.setup()

    render(ComponentListDialogCreate)

    await user.type(screen.getByLabelText(/character/i), '日月')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/please enter only one character/i)
      ).toBeInTheDocument()
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('shows error when component already exists', async () => {
    mockGetByCharacter.mockReturnValue({ id: 99, character: '亻' })
    const user = userEvent.setup()

    render(ComponentListDialogCreate)

    await user.type(screen.getByLabelText(/character/i), '亻')
    await user.click(screen.getByRole('button', { name: /add/i }))

    await waitFor(() => {
      expect(
        screen.getByText(/This component is already registered/i)
      ).toBeInTheDocument()
    })
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
