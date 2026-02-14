/**
 * Tests for SettingsSectionPositionTypes component
 */

import { render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SettingsSectionPositionTypes from './SettingsSectionPositionTypes.vue'

import type { PositionType } from '@/legacy/shared/types/database-types'

// Mock composables
const mockCreate = vi.fn()
const mockGetAll = vi.fn()
const mockGetUsageCount = vi.fn()
const mockRemove = vi.fn()
const mockUpdate = vi.fn()
const mockUpdateDisplayOrders = vi.fn()

vi.mock('@/legacy/shared/composables/use-position-type-repository', () => ({
  usePositionTypeRepository: () => ({
    create: mockCreate,
    getAll: mockGetAll,
    getUsageCount: mockGetUsageCount,
    remove: mockRemove,
    update: mockUpdate,
    updateDisplayOrders: mockUpdateDisplayOrders
  })
}))

const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/legacy/shared/composables/use-toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError
  })
}))

const createMockPositionType = (
  overrides: Partial<PositionType> = {}
): PositionType => ({
  id: 1,
  positionName: 'hen',
  nameJapanese: 'へん',
  nameEnglish: 'left side',
  description: 'Left side of character',
  descriptionShort: 'Left',
  displayOrder: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides
})

describe('SettingsSectionPositionTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAll.mockReturnValue([])
  })

  describe('empty state', () => {
    it('shows empty message when no position types', async () => {
      mockGetAll.mockReturnValue([])

      render(SettingsSectionPositionTypes)

      await waitFor(() => {
        expect(
          screen.getByText(/No position types defined/i)
        ).toBeInTheDocument()
      })
    })

    it('shows add button in empty state', () => {
      mockGetAll.mockReturnValue([])

      render(SettingsSectionPositionTypes)

      expect(
        screen.getByRole('button', { name: /Add Position Type/i })
      ).toBeInTheDocument()
    })
  })

  describe('list display', () => {
    it('renders list of position types', async () => {
      const positionTypes = [
        createMockPositionType({
          id: 1,
          positionName: 'hen',
          nameJapanese: 'へん',
          displayOrder: 1
        }),
        createMockPositionType({
          id: 2,
          positionName: 'tsukuri',
          nameJapanese: 'つくり',
          displayOrder: 2
        })
      ]
      mockGetAll.mockReturnValue(positionTypes)

      render(SettingsSectionPositionTypes)

      await waitFor(() => {
        expect(screen.getByText('hen')).toBeInTheDocument()
        expect(screen.getByText('へん')).toBeInTheDocument()
        expect(screen.getByText('tsukuri')).toBeInTheDocument()
        expect(screen.getByText('つくり')).toBeInTheDocument()
      })
    })

    it('displays short description when available', async () => {
      const positionTypes = [
        createMockPositionType({
          positionName: 'hen',
          descriptionShort: 'Left side'
        })
      ]
      mockGetAll.mockReturnValue(positionTypes)

      render(SettingsSectionPositionTypes)

      await waitFor(() => {
        expect(screen.getByText('Left side')).toBeInTheDocument()
      })
    })

    it('shows action buttons for each position type', async () => {
      const positionTypes = [createMockPositionType()]
      mockGetAll.mockReturnValue(positionTypes)

      render(SettingsSectionPositionTypes)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '↑' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '↓' })).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /edit/i })
        ).toBeInTheDocument()
        expect(
          screen.getByRole('button', { name: /delete/i })
        ).toBeInTheDocument()
      })
    })

    it('disables move up button for first item', async () => {
      const positionTypes = [createMockPositionType()]
      mockGetAll.mockReturnValue(positionTypes)

      render(SettingsSectionPositionTypes)

      await waitFor(() => {
        const moveUpButton = screen.getByRole('button', { name: '↑' })
        expect(moveUpButton).toBeDisabled()
      })
    })

    it('disables move down button for last item', async () => {
      const positionTypes = [createMockPositionType()]
      mockGetAll.mockReturnValue(positionTypes)

      render(SettingsSectionPositionTypes)

      await waitFor(() => {
        const moveDownButton = screen.getByRole('button', { name: '↓' })
        expect(moveDownButton).toBeDisabled()
      })
    })
  })

  describe('component structure', () => {
    it('renders with proper CSS classes', () => {
      mockGetAll.mockReturnValue([])
      const { container } = render(SettingsSectionPositionTypes)

      expect(
        container.querySelector('.settings-section-position-types')
      ).toBeInTheDocument()
      expect(
        container.querySelector('.settings-section-position-types-actions')
      ).toBeInTheDocument()
    })

    it('displays list when position types exist', async () => {
      const positionTypes = [createMockPositionType()]
      mockGetAll.mockReturnValue(positionTypes)

      const { container } = render(SettingsSectionPositionTypes)

      await waitFor(() => {
        expect(
          container.querySelector('.settings-section-position-types-list')
        ).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('handles database not initialized gracefully', () => {
      mockGetAll.mockImplementation(() => {
        throw new Error('Database not initialized')
      })

      render(SettingsSectionPositionTypes)

      // Should render empty state without crashing
      expect(screen.getByText(/No position types defined/i)).toBeInTheDocument()
    })
  })
})
