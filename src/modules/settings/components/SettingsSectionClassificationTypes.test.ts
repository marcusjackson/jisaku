/**
 * Tests for SettingsSectionClassificationTypes component
 */

import { render, screen, waitFor } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SettingsSectionClassificationTypes from './SettingsSectionClassificationTypes.vue'

import type { ClassificationType } from '@/shared/types/database-types'

// Mock composables
const mockCreateClassificationType = vi.fn()
const mockGetAllClassificationTypes = vi.fn()
const mockGetClassificationTypeUsageCount = vi.fn()
const mockRemoveClassificationType = vi.fn()
const mockUpdateClassificationType = vi.fn()
const mockUpdateClassificationTypeDisplayOrders = vi.fn()

vi.mock('@/shared/composables/use-classification-repository', () => ({
  useClassificationRepository: () => ({
    createClassificationType: mockCreateClassificationType,
    getAllClassificationTypes: mockGetAllClassificationTypes,
    getClassificationTypeUsageCount: mockGetClassificationTypeUsageCount,
    removeClassificationType: mockRemoveClassificationType,
    updateClassificationType: mockUpdateClassificationType,
    updateClassificationTypeDisplayOrders:
      mockUpdateClassificationTypeDisplayOrders
  })
}))

const mockSuccess = vi.fn()
const mockError = vi.fn()

vi.mock('@/shared/composables/use-toast', () => ({
  useToast: () => ({
    success: mockSuccess,
    error: mockError
  })
}))

const createMockClassificationType = (
  overrides: Partial<ClassificationType> = {}
): ClassificationType => ({
  id: 1,
  typeName: 'phonetic_loan',
  nameJapanese: '仮借字',
  nameEnglish: 'Phonetic Loan',
  description: 'Borrowed character for sound alone',
  descriptionShort: 'Borrowed for sound',
  displayOrder: 1,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides
})

describe('SettingsSectionClassificationTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetAllClassificationTypes.mockReturnValue([])
  })

  describe('empty state', () => {
    it('shows empty message when no classification types', async () => {
      mockGetAllClassificationTypes.mockReturnValue([])

      render(SettingsSectionClassificationTypes)

      await waitFor(() => {
        expect(
          screen.getByText(/No classification types defined/i)
        ).toBeInTheDocument()
      })
    })

    it('shows add button in empty state', () => {
      mockGetAllClassificationTypes.mockReturnValue([])

      render(SettingsSectionClassificationTypes)

      expect(
        screen.getByRole('button', { name: /Add Classification Type/i })
      ).toBeInTheDocument()
    })
  })

  describe('list display', () => {
    it('renders list of classification types', async () => {
      const classificationTypes = [
        createMockClassificationType({
          id: 1,
          typeName: 'phonetic_loan',
          nameJapanese: '仮借字',
          displayOrder: 1
        }),
        createMockClassificationType({
          id: 2,
          typeName: 'pictographic',
          nameJapanese: '象形文字',
          displayOrder: 2
        })
      ]
      mockGetAllClassificationTypes.mockReturnValue(classificationTypes)

      render(SettingsSectionClassificationTypes)

      await waitFor(() => {
        expect(screen.getByText('phonetic_loan')).toBeInTheDocument()
        expect(screen.getByText('仮借字')).toBeInTheDocument()
        expect(screen.getByText('pictographic')).toBeInTheDocument()
        expect(screen.getByText('象形文字')).toBeInTheDocument()
      })
    })

    it('displays short description when available', async () => {
      const classificationTypes = [
        createMockClassificationType({
          typeName: 'phonetic_loan',
          descriptionShort: 'Borrowed for sound'
        })
      ]
      mockGetAllClassificationTypes.mockReturnValue(classificationTypes)

      render(SettingsSectionClassificationTypes)

      await waitFor(() => {
        expect(screen.getByText('Borrowed for sound')).toBeInTheDocument()
      })
    })

    it('shows action buttons for each classification type', async () => {
      const classificationTypes = [createMockClassificationType()]
      mockGetAllClassificationTypes.mockReturnValue(classificationTypes)

      render(SettingsSectionClassificationTypes)

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
      const classificationTypes = [createMockClassificationType()]
      mockGetAllClassificationTypes.mockReturnValue(classificationTypes)

      render(SettingsSectionClassificationTypes)

      await waitFor(() => {
        const moveUpButton = screen.getByRole('button', { name: '↑' })
        expect(moveUpButton).toBeDisabled()
      })
    })

    it('disables move down button for last item', async () => {
      const classificationTypes = [createMockClassificationType()]
      mockGetAllClassificationTypes.mockReturnValue(classificationTypes)

      render(SettingsSectionClassificationTypes)

      await waitFor(() => {
        const moveDownButton = screen.getByRole('button', { name: '↓' })
        expect(moveDownButton).toBeDisabled()
      })
    })
  })

  describe('component structure', () => {
    it('renders with proper CSS classes', () => {
      mockGetAllClassificationTypes.mockReturnValue([])
      const { container } = render(SettingsSectionClassificationTypes)

      expect(
        container.querySelector('.settings-section-classification-types')
      ).toBeInTheDocument()
      expect(
        container.querySelector(
          '.settings-section-classification-types-actions'
        )
      ).toBeInTheDocument()
    })

    it('displays list when classification types exist', async () => {
      const classificationTypes = [createMockClassificationType()]
      mockGetAllClassificationTypes.mockReturnValue(classificationTypes)

      const { container } = render(SettingsSectionClassificationTypes)

      await waitFor(() => {
        expect(
          container.querySelector('.settings-section-classification-types-list')
        ).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('handles database not initialized gracefully', () => {
      mockGetAllClassificationTypes.mockImplementation(() => {
        throw new Error('Database not initialized')
      })

      render(SettingsSectionClassificationTypes)

      // Should render empty state without crashing
      expect(
        screen.getByText(/No classification types defined/i)
      ).toBeInTheDocument()
    })
  })
})
