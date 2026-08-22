/**
 * SettingsSectionClassificationTypes Tests
 */

import { ref } from 'vue'

import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SettingsSectionClassificationTypes from './SettingsSectionClassificationTypes.vue'

import type { ClassificationType } from '@/api/classification/classification-types'

// ============================================================================
// Composable mock
// ============================================================================

const mockHandlers = {
  handleCreateClick: vi.fn(),
  handleCreateSubmit: vi.fn(),
  handleCreateCancel: vi.fn(),
  handleEditClick: vi.fn(),
  handleEditSubmit: vi.fn(),
  handleEditCancel: vi.fn(),
  handleDeleteClick: vi.fn(),
  handleDeleteConfirm: vi.fn(),
  handleDeleteCancel: vi.fn(),
  handleMoveUp: vi.fn(),
  handleMoveDown: vi.fn()
}

const emptyForm = () => ({
  typeName: '',
  nameJapanese: undefined,
  nameEnglish: undefined,
  descriptionShort: undefined,
  description: undefined
})

const mockState = {
  classificationTypes: ref<ClassificationType[]>([]),
  showCreateDialog: ref(false),
  showEditDialog: ref(false),
  showDeleteDialog: ref(false),
  editingItem: ref(null),
  deletingItem: ref(null),
  deleteUsageCount: ref(0),
  createForm: ref(emptyForm()),
  editForm: ref(emptyForm())
}

vi.mock('../composables/use-settings-classification-type-section', () => ({
  useClassificationTypeSection: () => ({ ...mockState, ...mockHandlers })
}))

// ============================================================================
// Component mocks
// ============================================================================

vi.mock('@/shared/components/SharedSection.vue', () => ({
  default: {
    name: 'SharedSection',
    props: ['title', 'testId', 'collapsible', 'defaultOpen'],
    template:
      '<section data-testid="shared-section"><h2>{{ title }}</h2><slot /></section>'
  }
}))

vi.mock('@/shared/components/SharedConfirmDialog.vue', () => ({
  default: {
    name: 'SharedConfirmDialog',
    props: ['open', 'title', 'description', 'confirmLabel', 'variant'],
    emits: ['confirm', 'cancel'],
    template: `
      <div v-if="open" data-testid="confirm-dialog">
        <p>{{ description }}</p>
        <button @click="$emit('confirm')">{{ confirmLabel || 'Confirm' }}</button>
        <button @click="$emit('cancel')">Cancel</button>
      </div>
    `
  }
}))

vi.mock('@/base/components/BaseDialog.vue', () => ({
  default: {
    name: 'BaseDialog',
    props: { open: Boolean, title: String },
    emits: ['update:open'],
    template: `
      <div v-if="open" data-testid="base-dialog" :data-title="title">
        <slot />
        <slot name="footer" />
      </div>
    `
  }
}))

vi.mock('@/base/components/BaseButton.vue', () => ({
  default: {
    name: 'BaseButton',
    props: ['variant', 'size', 'disabled', 'type'],
    emits: ['click'],
    template:
      '<button :disabled="disabled" :type="type || \'button\'" v-bind="$attrs" @click="$emit(\'click\')"><slot /></button>'
  }
}))

vi.mock('@/base/components/BaseInput.vue', () => ({
  default: {
    name: 'BaseInput',
    props: ['modelValue', 'label', 'name', 'placeholder', 'required'],
    emits: ['update:modelValue'],
    template:
      '<div><label>{{ label }}</label><input :value="modelValue" :name="name" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>'
  }
}))

vi.mock('@/base/components/BaseTextarea.vue', () => ({
  default: {
    name: 'BaseTextarea',
    props: ['modelValue', 'label', 'name', 'placeholder', 'rows'],
    emits: ['update:modelValue'],
    template:
      '<div><label>{{ label }}</label><textarea :name="name" @input="$emit(\'update:modelValue\', $event.target.value)">{{ modelValue }}</textarea></div>'
  }
}))

// ============================================================================
// Tests
// ============================================================================

describe('SettingsSectionClassificationTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockState.classificationTypes.value = []
    mockState.showCreateDialog.value = false
    mockState.showEditDialog.value = false
    mockState.showDeleteDialog.value = false
    mockState.deleteUsageCount.value = 0
  })

  describe('rendering', () => {
    it('renders the section title', () => {
      render(SettingsSectionClassificationTypes)
      expect(screen.getByText('Classification Types')).toBeInTheDocument()
    })

    it('renders the section description', () => {
      render(SettingsSectionClassificationTypes)
      expect(
        screen.getByText(/manage classification types for kanji/i)
      ).toBeInTheDocument()
    })

    it('renders the Add Classification Type button', () => {
      render(SettingsSectionClassificationTypes)
      expect(
        screen.getByRole('button', { name: /add classification type/i })
      ).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no classification types exist', () => {
      render(SettingsSectionClassificationTypes)
      expect(
        screen.getByText(/no classification types defined/i)
      ).toBeInTheDocument()
    })

    it('does not show empty state when items exist', () => {
      mockState.classificationTypes.value = [
        {
          id: 1,
          typeName: 'pictograph',
          nameJapanese: '象形文字',
          nameEnglish: 'Pictograph',
          description: null,
          descriptionShort: null,
          displayOrder: 1,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]
      render(SettingsSectionClassificationTypes)
      expect(
        screen.queryByText(/no classification types defined/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('list display', () => {
    it('renders list items with type name and names', () => {
      mockState.classificationTypes.value = [
        {
          id: 1,
          typeName: 'pictograph',
          nameJapanese: '象形文字',
          nameEnglish: 'Pictograph',
          description: null,
          descriptionShort: 'Symbol-based',
          displayOrder: 1,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]
      render(SettingsSectionClassificationTypes)
      expect(screen.getByText('pictograph')).toBeInTheDocument()
      expect(screen.getByText('象形文字')).toBeInTheDocument()
      expect(screen.getByText('Symbol-based')).toBeInTheDocument()
    })

    it('renders action buttons for each item', () => {
      mockState.classificationTypes.value = [
        {
          id: 1,
          typeName: 'pictograph',
          nameJapanese: null,
          nameEnglish: null,
          description: null,
          descriptionShort: null,
          displayOrder: 1,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]
      render(SettingsSectionClassificationTypes)
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: /delete/i })
      ).toBeInTheDocument()
    })
  })

  describe('create dialog', () => {
    it('calls handleCreateClick when Add button is clicked', async () => {
      const user = userEvent.setup()
      render(SettingsSectionClassificationTypes)
      await user.click(
        screen.getByRole('button', { name: /add classification type/i })
      )
      expect(mockHandlers.handleCreateClick).toHaveBeenCalledOnce()
    })

    it('shows create dialog when showCreateDialog is true', () => {
      mockState.showCreateDialog.value = true
      render(SettingsSectionClassificationTypes)
      expect(screen.getByTestId('base-dialog')).toBeInTheDocument()
    })

    it('calls handleCreateCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      mockState.showCreateDialog.value = true
      render(SettingsSectionClassificationTypes)
      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(mockHandlers.handleCreateCancel).toHaveBeenCalledOnce()
    })

    it('calls handleCreateSubmit when Create button is clicked', async () => {
      const user = userEvent.setup()
      mockState.showCreateDialog.value = true
      render(SettingsSectionClassificationTypes)
      await user.click(screen.getByRole('button', { name: /create/i }))
      expect(mockHandlers.handleCreateSubmit).toHaveBeenCalledOnce()
    })
  })

  describe('edit dialog', () => {
    it('calls handleEditClick with item when edit button is clicked', async () => {
      const user = userEvent.setup()
      const item = {
        id: 1,
        typeName: 'pictograph',
        nameJapanese: null,
        nameEnglish: null,
        description: null,
        descriptionShort: null,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
      mockState.classificationTypes.value = [item]
      render(SettingsSectionClassificationTypes)
      await user.click(screen.getByRole('button', { name: /edit/i }))
      expect(mockHandlers.handleEditClick).toHaveBeenCalledWith(item)
    })

    it('shows edit dialog when showEditDialog is true', () => {
      mockState.showEditDialog.value = true
      render(SettingsSectionClassificationTypes)
      expect(screen.getByTestId('base-dialog')).toBeInTheDocument()
    })

    it('calls handleEditSubmit when save button clicked', async () => {
      const user = userEvent.setup()
      mockState.showEditDialog.value = true
      render(SettingsSectionClassificationTypes)
      await user.click(screen.getByRole('button', { name: /save/i }))
      expect(mockHandlers.handleEditSubmit).toHaveBeenCalledOnce()
    })
  })

  describe('delete dialog', () => {
    it('calls handleDeleteClick with item when delete button is clicked', async () => {
      const user = userEvent.setup()
      const item = {
        id: 1,
        typeName: 'pictograph',
        nameJapanese: null,
        nameEnglish: null,
        description: null,
        descriptionShort: null,
        displayOrder: 1,
        createdAt: '2024-01-01T00:00:00',
        updatedAt: '2024-01-01T00:00:00'
      }
      mockState.classificationTypes.value = [item]
      render(SettingsSectionClassificationTypes)
      await user.click(screen.getByRole('button', { name: /delete/i }))
      expect(mockHandlers.handleDeleteClick).toHaveBeenCalledWith(item)
    })

    it('shows confirm dialog when showDeleteDialog is true', () => {
      mockState.showDeleteDialog.value = true
      render(SettingsSectionClassificationTypes)
      expect(screen.getByTestId('confirm-dialog')).toBeInTheDocument()
    })

    it('shows usage count warning when deleteUsageCount > 0', () => {
      mockState.showDeleteDialog.value = true
      mockState.deleteUsageCount.value = 2
      render(SettingsSectionClassificationTypes)
      expect(screen.getByText(/2 kanji/i)).toBeInTheDocument()
    })

    it('calls handleDeleteConfirm when confirm button clicked', async () => {
      const user = userEvent.setup()
      mockState.showDeleteDialog.value = true
      render(SettingsSectionClassificationTypes)
      await user.click(screen.getByRole('button', { name: /delete/i }))
      expect(mockHandlers.handleDeleteConfirm).toHaveBeenCalledOnce()
    })

    it('calls handleDeleteCancel when cancel is clicked', async () => {
      const user = userEvent.setup()
      mockState.showDeleteDialog.value = true
      render(SettingsSectionClassificationTypes)
      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(mockHandlers.handleDeleteCancel).toHaveBeenCalledOnce()
    })
  })

  describe('ordering', () => {
    it('calls handleMoveUp with correct index', async () => {
      const user = userEvent.setup()
      mockState.classificationTypes.value = [
        {
          id: 1,
          typeName: 'pictograph',
          nameJapanese: null,
          nameEnglish: null,
          description: null,
          descriptionShort: null,
          displayOrder: 1,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        },
        {
          id: 2,
          typeName: 'ideograph',
          nameJapanese: null,
          nameEnglish: null,
          description: null,
          descriptionShort: null,
          displayOrder: 2,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]
      render(SettingsSectionClassificationTypes)
      const upButtons = screen.getAllByRole('button', { name: '↑' })
      await user.click(upButtons[1]!)
      expect(mockHandlers.handleMoveUp).toHaveBeenCalledWith(1)
    })

    it('calls handleMoveDown with correct index', async () => {
      const user = userEvent.setup()
      mockState.classificationTypes.value = [
        {
          id: 1,
          typeName: 'pictograph',
          nameJapanese: null,
          nameEnglish: null,
          description: null,
          descriptionShort: null,
          displayOrder: 1,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        },
        {
          id: 2,
          typeName: 'ideograph',
          nameJapanese: null,
          nameEnglish: null,
          description: null,
          descriptionShort: null,
          displayOrder: 2,
          createdAt: '2024-01-01T00:00:00',
          updatedAt: '2024-01-01T00:00:00'
        }
      ]
      render(SettingsSectionClassificationTypes)
      const downButtons = screen.getAllByRole('button', { name: '↓' })
      await user.click(downButtons[0]!)
      expect(mockHandlers.handleMoveDown).toHaveBeenCalledWith(0)
    })
  })
})
