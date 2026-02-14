<script setup lang="ts">
/**
 * SettingsSectionDatabase
 *
 * Section component for database management.
 * Handles export, import, and clear operations via events.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

interface Props {
  isExporting: boolean
  isImporting: boolean
  isClearing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'export-database': []
  'import-database': [file: File]
  'validate-database': [file: File]
  'clear-database': []
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const showImportDialog = ref(false)
const pendingImportFile = ref<File | null>(null)
const showClearDialog = ref(false)

const exportDisabled = computed(
  () => props.isExporting || props.isImporting || props.isClearing
)
const importDisabled = computed(
  () => props.isExporting || props.isImporting || props.isClearing
)
const clearDisabled = computed(
  () => props.isExporting || props.isImporting || props.isClearing
)

function handleExportClick(): void {
  emit('export-database')
}

function handleImportClick(): void {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]

  if (!file) {
    return
  }

  pendingImportFile.value = file
  showImportDialog.value = true
}

function handleImportConfirm(): void {
  showImportDialog.value = false

  if (pendingImportFile.value) {
    emit('import-database', pendingImportFile.value)
    pendingImportFile.value = null
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleImportCancel(): void {
  showImportDialog.value = false
  pendingImportFile.value = null

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

function handleClearClick(): void {
  showClearDialog.value = true
}

function handleClearConfirm(): void {
  showClearDialog.value = false
  emit('clear-database')
}

function handleClearCancel(): void {
  showClearDialog.value = false
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="false"
    test-id="settings-database"
    title="Data Management"
  >
    <p class="description">
      Export, import, or clear your kanji dictionary data.
    </p>

    <div class="database-actions">
      <div class="action">
        <h3 class="action-title">Export Database</h3>
        <p class="action-description">
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

      <div class="action">
        <h3 class="action-title">Import Database</h3>
        <p class="action-description">
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
          class="file-input"
          type="file"
          @change="handleFileSelect"
        />
      </div>

      <div class="action">
        <h3 class="action-title">Clear All Data</h3>
        <p class="action-description">
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

    <SharedConfirmDialog
      confirm-label="Import"
      description="This will replace all existing data with the imported database. Make sure to export your current data first if you want to keep it."
      :open="showImportDialog"
      title="Import Database"
      variant="danger"
      @cancel="handleImportCancel"
      @confirm="handleImportConfirm"
      @update:open="(val) => (showImportDialog = val)"
    />

    <SharedConfirmDialog
      confirm-label="Clear All"
      description="This will permanently delete all kanji data. This action cannot be undone."
      :open="showClearDialog"
      title="Clear All Data"
      variant="danger"
      @cancel="handleClearCancel"
      @confirm="handleClearConfirm"
      @update:open="(val) => (showClearDialog = val)"
    />
  </SharedSection>
</template>

<style scoped>
.description {
  margin-bottom: var(--spacing-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.database-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.action {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  background-color: var(--color-background);
}

.action-title {
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.action-description {
  margin-bottom: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.file-input {
  display: none;
}
</style>
