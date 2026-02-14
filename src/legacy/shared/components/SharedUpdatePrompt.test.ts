/**
 * Tests for SharedUpdatePrompt component
 */

import { ref } from 'vue'

import { renderWithProviders } from '@test/helpers/render'
import userEvent from '@testing-library/user-event'
import { screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SharedUpdatePrompt from './SharedUpdatePrompt.vue'

// Mock the usePwa composable
const mockNeedsUpdate = ref(false)
const mockUpdateServiceWorker = vi.fn().mockResolvedValue(undefined)
const mockDismissUpdate = vi.fn()

vi.mock('@/legacy/shared/composables/use-pwa', () => ({
  usePwa: vi.fn(() => ({
    needsUpdate: mockNeedsUpdate,
    offlineReady: ref(false),
    updateServiceWorker: mockUpdateServiceWorker,
    dismissUpdate: mockDismissUpdate
  }))
}))

describe('SharedUpdatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockNeedsUpdate.value = false
  })

  it('does not render when needsUpdate is false', () => {
    renderWithProviders(SharedUpdatePrompt)

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('renders when needsUpdate is true', () => {
    mockNeedsUpdate.value = true
    renderWithProviders(SharedUpdatePrompt)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('displays update message', () => {
    mockNeedsUpdate.value = true
    renderWithProviders(SharedUpdatePrompt)

    expect(screen.getByText('Update available')).toBeInTheDocument()
    expect(
      screen.getByText(/A new version of the app is ready/)
    ).toBeInTheDocument()
  })

  it('has update now button', () => {
    mockNeedsUpdate.value = true
    renderWithProviders(SharedUpdatePrompt)

    expect(
      screen.getByRole('button', { name: /update now/i })
    ).toBeInTheDocument()
  })

  it('has later button', () => {
    mockNeedsUpdate.value = true
    renderWithProviders(SharedUpdatePrompt)

    expect(screen.getByRole('button', { name: /later/i })).toBeInTheDocument()
  })

  it('calls updateServiceWorker when update now is clicked', async () => {
    const user = userEvent.setup()
    mockNeedsUpdate.value = true
    renderWithProviders(SharedUpdatePrompt)

    await user.click(screen.getByRole('button', { name: /update now/i }))

    expect(mockUpdateServiceWorker).toHaveBeenCalledTimes(1)
  })

  it('calls dismissUpdate when later is clicked', async () => {
    const user = userEvent.setup()
    mockNeedsUpdate.value = true
    renderWithProviders(SharedUpdatePrompt)

    await user.click(screen.getByRole('button', { name: /later/i }))

    expect(mockDismissUpdate).toHaveBeenCalledTimes(1)
  })

  it('has aria-live polite for accessibility', () => {
    mockNeedsUpdate.value = true
    renderWithProviders(SharedUpdatePrompt)

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
  })
})
