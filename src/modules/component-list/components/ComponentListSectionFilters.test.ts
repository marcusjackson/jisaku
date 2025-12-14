/**
 * Tests for ComponentListSectionFilters component
 */

/* eslint-disable @typescript-eslint/unbound-method */

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ComponentListSectionFilters from './ComponentListSectionFilters.vue'

import type { ComponentFilters } from '@/shared/types/database-types'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock as never

describe('ComponentListSectionFilters', () => {
  const defaultFilters: ComponentFilters = {
    character: ''
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.getItem.mockReturnValue(null)
  })

  describe('rendering', () => {
    it('renders filter section with aria-label', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      expect(
        screen.getByRole('region', { name: /filter components/i })
      ).toBeInTheDocument()
    })

    it('renders filter header button', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      expect(
        screen.getByRole('button', { name: /filters/i })
      ).toBeInTheDocument()
    })

    it('displays active filter count badge when filters are active', () => {
      const filters: ComponentFilters = {
        character: '日',
        searchKeywords: 'sun'
      }

      render(ComponentListSectionFilters, {
        props: {
          filters,
          characterSearch: '日',
          searchKeywords: 'sun',
          hasActiveFilters: true
        }
      })

      // Badge should show count of active filters
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('renders filter inputs for character, keywords, and stroke range', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/meaning\/keywords/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/minimum strokes/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/maximum strokes/i)).toBeInTheDocument()
    })

    it('renders clear filters button when filters are active', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: true
        }
      })

      expect(
        screen.getByRole('button', { name: /clear filters/i })
      ).toBeInTheDocument()
    })

    it('does not render clear filters button when no filters are active', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const clearButtons = screen.queryAllByRole('button', {
        name: /clear filters/i
      })
      expect(clearButtons.length).toBe(0)
    })
  })

  describe('collapsible behavior', () => {
    it('renders collapse button', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      expect(
        screen.getByRole('button', { name: /collapse/i })
      ).toBeInTheDocument()
    })

    it('sets aria-expanded on header button based on collapsed state', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const headerButton = screen.getByRole('button', { name: /filters/i })
      expect(headerButton).toHaveAttribute('aria-expanded')
    })

    it('persists collapsed state to localStorage', async () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const headerButton = screen.getByRole('button', { name: /filters/i })
      await userEvent.click(headerButton)

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'component-list-filters-collapsed',
        'true'
      )
    })

    it('restores collapsed state from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('true')

      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      expect(localStorageMock.getItem).toHaveBeenCalledWith(
        'component-list-filters-collapsed'
      )
    })
  })

  describe('user input', () => {
    it('emits update:characterSearch when character input changes', async () => {
      const { emitted } = render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const characterInput = screen.getByLabelText(/character/i)
      await userEvent.type(characterInput, '日')

      const emittedData = emitted('update:characterSearch')
      expect(emittedData).toBeTruthy()
    })

    it('emits update:searchKeywords when keywords input changes', async () => {
      const { emitted } = render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const keywordsInput = screen.getByLabelText(/meaning\/keywords/i)
      await userEvent.type(keywordsInput, 'sun')

      const emittedData = emitted('update:searchKeywords')
      expect(emittedData).toBeTruthy()
    })

    it('emits updateFilter for stroke count inputs', async () => {
      const { emitted } = render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const strokeMinInput = screen.getByLabelText(/minimum strokes/i)
      await userEvent.type(strokeMinInput, '4')

      const emittedData = emitted('updateFilter')
      expect(emittedData).toBeTruthy()
    })

    it('emits clearFilters when clear button is clicked', async () => {
      const { emitted } = render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: true
        }
      })

      const clearButton = screen.getByRole('button', { name: /clear filters/i })
      await userEvent.click(clearButton)

      const emittedData = emitted('clearFilters')
      expect(emittedData).toBeTruthy()
    })
  })

  describe('filter count calculation', () => {
    it('counts active filters correctly', () => {
      const filters: ComponentFilters = {
        character: '日',
        searchKeywords: 'sun',
        strokeCountMin: 4,
        strokeCountMax: 10
      }

      render(ComponentListSectionFilters, {
        props: {
          filters,
          characterSearch: '日',
          searchKeywords: 'sun',
          hasActiveFilters: true
        }
      })

      // Should show 4 active filters
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    it('shows no badge when no filters are active', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      // Should not find any badge with filter count
      const filterButtons = screen.getAllByRole('button', { name: /filters/i })
      expect(filterButtons[0]?.textContent).not.toMatch(/\d+/)
    })
  })

  describe('input field properties', () => {
    it('character input has correct placeholder', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const characterInput = screen.getByLabelText(/character/i)
      expect((characterInput as HTMLInputElement).placeholder).toBe('亻')
    })

    it('keywords input has correct placeholder', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const keywordsInput = screen.getByLabelText(/meaning\/keywords/i)
      expect((keywordsInput as HTMLInputElement).placeholder).toBe(
        'person, human...'
      )
    })

    it('stroke inputs have type="number"', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const strokeMinInput = screen.getByLabelText(/minimum strokes/i)
      const strokeMaxInput = screen.getByLabelText(/maximum strokes/i)
      expect((strokeMinInput as HTMLInputElement).type).toBe('number')
      expect((strokeMaxInput as HTMLInputElement).type).toBe('number')
    })
  })

  describe('accessibility', () => {
    it('has proper heading hierarchy', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      expect(
        screen.getByRole('region', { name: /filter components/i })
      ).toBeInTheDocument()
    })

    it('all inputs have associated labels', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      expect(screen.getByLabelText(/character/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/meaning\/keywords/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/minimum strokes/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/maximum strokes/i)).toBeInTheDocument()
    })

    it('buttons are properly labeled', () => {
      render(ComponentListSectionFilters, {
        props: {
          filters: defaultFilters,
          characterSearch: '',
          searchKeywords: '',
          hasActiveFilters: false
        }
      })

      const filtersButton = screen.getByRole('button', { name: /filters/i })
      expect(filtersButton).toBeInTheDocument()
      const collapseButton = screen.getByRole('button', { name: /collapse/i })
      expect(collapseButton).toBeInTheDocument()
    })
  })
})
