/**
 * SettingsSectionDatabase tests
 *
 * Tests for the database management settings section.
 */

import { ref } from 'vue'

import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Mock values
const mockExportDatabase = vi.fn()
const mockImportDatabase = vi.fn()
const mockClearDatabase = vi.fn()
const mockValidateDatabaseFile = vi.fn()
const mockIsExporting = ref(false)
const mockIsImporting = ref(false)
const mockIsClearing = ref(false)

vi.mock('../composables/use-database-export', () => ({
  useDatabaseExport: () => ({
    clearDatabase: mockClearDatabase,
    exportDatabase: mockExportDatabase,
    importDatabase: mockImportDatabase,
    isClearing: mockIsClearing,
    isExporting: mockIsExporting,
    isImporting: mockIsImporting,
    validateDatabaseFile: mockValidateDatabaseFile
  })
}))

// Import after mocks
import SettingsSectionDatabase from './SettingsSectionDatabase.vue'

describe('SettingsSectionDatabase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockIsExporting.value = false
    mockIsImporting.value = false
    mockIsClearing.value = false
    mockValidateDatabaseFile.mockResolvedValue(true)
    mockImportDatabase.mockResolvedValue(true)
    mockClearDatabase.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  function mountComponent() {
    return mount(SettingsSectionDatabase, {
      global: {
        stubs: {
          BaseButton: {
            props: ['disabled', 'loading', 'variant'],
            template:
              '<button :disabled="disabled || loading"><slot /></button>'
          },
          SharedConfirmDialog: {
            props: ['isOpen', 'title', 'description', 'confirmLabel'],
            template: `
              <div v-if="isOpen" data-testid="confirm-dialog">
                <span>{{ title }}</span>
                <span>{{ description }}</span>
                <button data-testid="confirm-btn" @click="$emit('confirm')">{{ confirmLabel }}</button>
                <button data-testid="cancel-btn" @click="$emit('cancel')">Cancel</button>
              </div>
            `,
            emits: ['confirm', 'cancel']
          }
        }
      }
    })
  }

  describe('rendering', () => {
    it('renders export action', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('Export Database')
      expect(wrapper.text()).toContain('Download your database')
      expect(wrapper.text()).toContain('Export')
    })

    it('renders import action', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('Import Database')
      expect(wrapper.text()).toContain('Replace your data')
      expect(wrapper.text()).toContain('Import')
    })

    it('renders clear data action', () => {
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('Clear All Data')
      expect(wrapper.text()).toContain('Remove all kanji data')
    })

    it('renders hidden file input', () => {
      const wrapper = mountComponent()

      const fileInput = wrapper.find('input[type="file"]')
      expect(fileInput.exists()).toBe(true)
      expect(fileInput.attributes('accept')).toBe('.db,.sqlite,.sqlite3')
    })
  })

  describe('export', () => {
    it('calls exportDatabase when export button is clicked', async () => {
      const wrapper = mountComponent()

      const exportButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Export'))
      await exportButton?.trigger('click')

      expect(mockExportDatabase).toHaveBeenCalled()
    })

    it('disables export button while exporting', () => {
      mockIsExporting.value = true
      const wrapper = mountComponent()

      const exportButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Exporting'))

      expect(exportButton?.element.disabled).toBe(true)
    })

    it('shows loading text while exporting', () => {
      mockIsExporting.value = true
      const wrapper = mountComponent()

      expect(wrapper.text()).toContain('Exporting...')
    })
  })

  describe('import', () => {
    it('opens file picker when import button is clicked', async () => {
      const wrapper = mountComponent()
      const fileInput = wrapper.find('input[type="file"]')
      const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click')

      const importButton = wrapper
        .findAll('button')
        .find((b) => b.text() === 'Import')
      await importButton?.trigger('click')

      expect(clickSpy).toHaveBeenCalled()
    })

    it('validates file and shows confirmation dialog', async () => {
      const wrapper = mountComponent()
      const fileInput = wrapper.find('input[type="file"]')

      // Create a mock file
      const file = new File(['test'], 'test.db', {
        type: 'application/octet-stream'
      })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file]
      })

      await fileInput.trigger('change')
      await flushPromises()

      expect(mockValidateDatabaseFile).toHaveBeenCalledWith(file)
      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('Import Database')
    })

    it('calls importDatabase when confirmation is accepted', async () => {
      const wrapper = mountComponent()
      const fileInput = wrapper.find('input[type="file"]')

      // Create a mock file
      const file = new File(['test'], 'test.db', {
        type: 'application/octet-stream'
      })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file]
      })

      await fileInput.trigger('change')
      await flushPromises()

      // Click confirm
      const confirmButton = wrapper.find('[data-testid="confirm-btn"]')
      await confirmButton.trigger('click')
      await flushPromises()

      expect(mockImportDatabase).toHaveBeenCalledWith(file)
    })

    it('closes dialog without importing when cancelled', async () => {
      const wrapper = mountComponent()
      const fileInput = wrapper.find('input[type="file"]')

      // Create a mock file
      const file = new File(['test'], 'test.db', {
        type: 'application/octet-stream'
      })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file]
      })

      await fileInput.trigger('change')
      await flushPromises()

      // Click cancel
      const cancelButton = wrapper.find('[data-testid="cancel-btn"]')
      await cancelButton.trigger('click')
      await flushPromises()

      // Dialog should be closed and import should not be called
      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(
        false
      )
      expect(mockImportDatabase).not.toHaveBeenCalled()
    })

    it('shows error for invalid file without showing dialog', async () => {
      mockValidateDatabaseFile.mockResolvedValue(false)

      const wrapper = mountComponent()
      const fileInput = wrapper.find('input[type="file"]')

      // Create a mock file
      const file = new File(['test'], 'test.db', {
        type: 'application/octet-stream'
      })
      Object.defineProperty(fileInput.element, 'files', {
        value: [file]
      })

      await fileInput.trigger('change')
      await flushPromises()

      // Should call importDatabase to show error toast
      expect(mockImportDatabase).toHaveBeenCalledWith(file)
      // Dialog should not be shown
      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(
        false
      )
    })

    it('disables import button while importing', () => {
      mockIsImporting.value = true
      const wrapper = mountComponent()

      const importButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Importing'))

      expect(importButton?.element.disabled).toBe(true)
    })
  })

  describe('clear data', () => {
    it('shows confirmation dialog when clear button is clicked', async () => {
      const wrapper = mountComponent()

      const clearButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Clear All Data'))
      await clearButton?.trigger('click')

      expect(wrapper.find('[data-testid="confirm-dialog"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('permanently delete')
    })

    it('calls clearDatabase when confirmation is accepted', async () => {
      const wrapper = mountComponent()

      // Open dialog
      const clearButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Clear All Data'))
      await clearButton?.trigger('click')

      // Click confirm
      const confirmButton = wrapper.find('[data-testid="confirm-btn"]')
      await confirmButton.trigger('click')
      await flushPromises()

      expect(mockClearDatabase).toHaveBeenCalled()
    })

    it('closes dialog without clearing when cancelled', async () => {
      const wrapper = mountComponent()

      // Open dialog
      const clearButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Clear All Data'))
      await clearButton?.trigger('click')

      // Click cancel
      const cancelButton = wrapper.find('[data-testid="cancel-btn"]')
      await cancelButton.trigger('click')

      expect(mockClearDatabase).not.toHaveBeenCalled()
    })

    it('disables clear button while clearing', () => {
      mockIsClearing.value = true
      const wrapper = mountComponent()

      const clearButton = wrapper
        .findAll('button')
        .find((b) => b.text().includes('Clearing'))

      expect(clearButton?.element.disabled).toBe(true)
    })
  })

  describe('disabled states', () => {
    it('disables all buttons while exporting', () => {
      mockIsExporting.value = true
      const wrapper = mountComponent()

      const buttons = wrapper.findAll('button')
      const exportBtn = buttons.find((b) => b.text().includes('Exporting'))
      const importBtn = buttons.find((b) => b.text() === 'Import')
      const clearBtn = buttons.find((b) => b.text().includes('Clear'))

      expect(exportBtn?.element.disabled).toBe(true)
      expect(importBtn?.element.disabled).toBe(true)
      expect(clearBtn?.element.disabled).toBe(true)
    })

    it('disables all buttons while importing', () => {
      mockIsImporting.value = true
      const wrapper = mountComponent()

      const buttons = wrapper.findAll('button')
      const exportBtn = buttons.find((b) => b.text() === 'Export')
      const importBtn = buttons.find((b) => b.text().includes('Importing'))
      const clearBtn = buttons.find((b) => b.text().includes('Clear'))

      expect(exportBtn?.element.disabled).toBe(true)
      expect(importBtn?.element.disabled).toBe(true)
      expect(clearBtn?.element.disabled).toBe(true)
    })

    it('disables all buttons while clearing', () => {
      mockIsClearing.value = true
      const wrapper = mountComponent()

      const buttons = wrapper.findAll('button')
      const exportBtn = buttons.find((b) => b.text() === 'Export')
      const importBtn = buttons.find((b) => b.text() === 'Import')
      const clearBtn = buttons.find((b) => b.text().includes('Clearing'))

      expect(exportBtn?.element.disabled).toBe(true)
      expect(importBtn?.element.disabled).toBe(true)
      expect(clearBtn?.element.disabled).toBe(true)
    })
  })
})
