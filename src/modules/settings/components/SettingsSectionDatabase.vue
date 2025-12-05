<script setup lang="ts">
/**
 * SettingsSectionDatabase
 *
 * Section component for database management in settings.
 * Provides export, import, and clear database functionality.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'

import { useDatabaseExport } from '../composables/use-database-export'

// App version from Vite define (defined in vite.config.ts)
declare const __APP_VERSION__: string
const appVersion = __APP_VERSION__

// Database export composable
const {
  clearDatabase,
  exportDatabase,
  importDatabase,
  isClearing,
  isExporting,
  isImporting,
  validateDatabaseFile
} = useDatabaseExport()

// File input ref
const fileInputRef = ref<HTMLInputElement | null>(null)

// Import confirmation dialog
const showImportDialog = ref(false)
const pendingImportFile = ref<File | null>(null)

// Clear confirmation dialog
const showClearDialog = ref(false)

// Computed for disabled states
const exportDisabled = computed(
  () => isExporting.value || isImporting.value || isClearing.value
)
const importDisabled = computed(
  () => isExporting.value || isImporting.value || isClearing.value
)
const clearDisabled = computed(
  () => isExporting.value || isImporting.value || isClearing.value
)

// Export handler
function handleExportClick() {
  exportDatabase()
}

// Import handlers
function handleImportClick() {
  fileInputRef.value?.click()
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  // Validate file before showing confirmation
  const isValid = await validateDatabaseFile(file)
  if (!isValid) {
    // Show error toast through the composable
    await importDatabase(file)
    // Reset file input
    target.value = ''
    return
  }

  // Show confirmation dialog
  pendingImportFile.value = file
  showImportDialog.value = true
}

async function handleImportConfirm() {
  showImportDialog.value = false

  if (pendingImportFile.value) {
    await importDatabase(pendingImportFile.value)
    pendingImportFile.value = null
  }

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleImportCancel() {
  showImportDialog.value = false
  pendingImportFile.value = null

  // Reset file input
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

// Clear handlers
function handleClearClick() {
  showClearDialog.value = true
}

async function handleClearConfirm() {
  showClearDialog.value = false
  await clearDatabase()
}

function handleClearCancel() {
  showClearDialog.value = false
}
</script>

<template>
  <section class="settings-section-database">
    <h2 class="settings-section-database-title">Data Management</h2>
    <p class="settings-section-database-description">
      Export your data for backup or import a previously exported database.
    </p>

    <div class="settings-section-database-actions">
      <!-- Export -->
      <div class="settings-section-database-action">
        <h3 class="settings-section-database-action-title">Export Database</h3>
        <p class="settings-section-database-action-description">
          Download your database as a file for backup.
        </p>
        <BaseButton
          :disabled="exportDisabled"
          :loading="isExporting"
          variant="secondary"
          @click="handleExportClick"
        >
          {{ isExporting ? 'Exporting...' : 'Export' }}
        </BaseButton>
      </div>

      <!-- Import -->
      <div class="settings-section-database-action">
        <h3 class="settings-section-database-action-title">Import Database</h3>
        <p class="settings-section-database-action-description">
          Replace your data with an exported database file.
        </p>
        <BaseButton
          :disabled="importDisabled"
          :loading="isImporting"
          variant="secondary"
          @click="handleImportClick"
        >
          {{ isImporting ? 'Importing...' : 'Import' }}
        </BaseButton>
        <input
          ref="fileInputRef"
          accept=".db,.sqlite,.sqlite3"
          class="settings-section-database-file-input"
          type="file"
          @change="handleFileSelect"
        />
      </div>

      <!-- Clear Data -->
      <div class="settings-section-database-action">
        <h3 class="settings-section-database-action-title">Clear All Data</h3>
        <p class="settings-section-database-action-description">
          Remove all kanji data. This cannot be undone.
        </p>
        <BaseButton
          :disabled="clearDisabled"
          :loading="isClearing"
          variant="danger"
          @click="handleClearClick"
        >
          {{ isClearing ? 'Clearing...' : 'Clear All Data' }}
        </BaseButton>
      </div>
    </div>

    <!-- App Version -->
    <div class="settings-section-database-version">
      <span class="settings-section-database-version-label">App Version</span>
      <span class="settings-section-database-version-value">{{
        appVersion
      }}</span>
    </div>

    <!-- Import Confirmation Dialog -->
    <SharedConfirmDialog
      confirm-label="Import"
      description="This will replace all existing data with the imported database. Make sure to export your current data first if you want to keep it."
      :is-open="showImportDialog"
      title="Import Database"
      variant="danger"
      @cancel="handleImportCancel"
      @confirm="handleImportConfirm"
    />

    <!-- Clear Confirmation Dialog -->
    <SharedConfirmDialog
      confirm-label="Clear All"
      description="This will permanently delete all kanji data. This action cannot be undone."
      :is-open="showClearDialog"
      title="Clear All Data"
      variant="danger"
      @cancel="handleClearCancel"
      @confirm="handleClearConfirm"
    />
  </section>
</template>

<style scoped>
.settings-section-database {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
}

.settings-section-database-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.settings-section-database-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.settings-section-database-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
}

.settings-section-database-action {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.settings-section-database-action-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.settings-section-database-action-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.settings-section-database-file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  border: 0;
  white-space: nowrap;
}

.settings-section-database-version {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.settings-section-database-version-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.settings-section-database-version-value {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
</style>
