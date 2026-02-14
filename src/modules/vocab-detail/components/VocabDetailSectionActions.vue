<script setup lang="ts">
/**
 * VocabDetailSectionActions
 *
 * Bottom section with destructive mode toggle, delete button, and back button.
 */

import { ref } from 'vue'

import { BaseButton, BaseSwitch } from '@/base/components'

import { SharedBackButton, SharedConfirmDialog } from '@/shared/components'

import { ROUTES } from '@/router/routes'

const props = defineProps<{
  destructiveMode: boolean
  isDeleting: boolean
}>()

const emit = defineEmits<{
  'update:destructiveMode': [value: boolean]
  delete: []
}>()

const showDeleteDialog = ref(false)

function handleDestructiveModeChange(value: boolean): void {
  emit('update:destructiveMode', value)
}

function handleDeleteClick(): void {
  showDeleteDialog.value = true
}

function handleDeleteConfirm(): void {
  showDeleteDialog.value = false
  emit('delete')
}

function handleDeleteCancel(): void {
  showDeleteDialog.value = false
}
</script>

<template>
  <section
    class="vocab-detail-section-actions"
    data-testid="vocab-detail-actions"
  >
    <div class="vocab-detail-section-actions-controls">
      <div class="vocab-detail-section-actions-toggle">
        <label
          class="vocab-detail-section-actions-label"
          for="destructive-mode-switch"
        >
          Destructive Mode
        </label>
        <BaseSwitch
          id="destructive-mode-switch"
          data-testid="destructive-mode-switch"
          :model-value="props.destructiveMode"
          @update:model-value="handleDestructiveModeChange"
        />
      </div>

      <BaseButton
        aria-label="Delete"
        data-testid="delete-vocab-button"
        :disabled="props.isDeleting || !props.destructiveMode"
        variant="ghost"
        @click="handleDeleteClick"
      >
        <template v-if="props.isDeleting"> Deleting... </template>
        <template v-else>
          <span class="delete-button-text-full">Delete Vocabulary</span>
          <span class="delete-button-text-short">Delete</span>
        </template>
      </BaseButton>
    </div>

    <SharedBackButton
      label="Back to Vocabulary List"
      :to="ROUTES.VOCABULARY_LIST"
    />

    <SharedConfirmDialog
      v-model:open="showDeleteDialog"
      confirm-label="Delete"
      description="Are you sure you want to delete this vocabulary entry? This action cannot be undone."
      title="Delete Vocabulary"
      variant="danger"
      @cancel="handleDeleteCancel"
      @confirm="handleDeleteConfirm"
    />
  </section>
</template>

<style scoped>
.vocab-detail-section-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.vocab-detail-section-actions-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.vocab-detail-section-actions-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.vocab-detail-section-actions-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.delete-button-text-full {
  display: none;
}

.delete-button-text-short {
  display: inline;
}

@media (width > 640px) {
  .delete-button-text-full {
    display: inline;
  }

  .delete-button-text-short {
    display: none;
  }
}
</style>
