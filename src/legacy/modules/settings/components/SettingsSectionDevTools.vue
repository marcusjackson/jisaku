<script setup lang="ts">
/**
 * SettingsSectionDevTools
 *
 * Section component for developer tools in settings.
 * Provides seed/clear/reset database functionality.
 */

import { computed } from 'vue'
import { ref } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/legacy/shared/components/SharedConfirmDialog.vue'
import { useSeedData } from '@/legacy/shared/composables/use-seed-data'

const { clear, isClearing, isSeeding, seed } = useSeedData()

// Clear confirmation dialog
const showClearDialog = ref(false)

function handleClearClick() {
  showClearDialog.value = true
}

function handleClearConfirm() {
  showClearDialog.value = false
  void clear()
}

function handleClearCancel() {
  showClearDialog.value = false
}

// Computed to handle exactOptionalPropertyTypes
const seedDisabled = computed(() => isSeeding.value || isClearing.value)
const clearDisabled = computed(() => isClearing.value || isSeeding.value)
</script>

<template>
  <div class="settings-section-dev-tools">
    <div class="settings-section-dev-tools-actions">
      <div class="settings-section-dev-tools-action">
        <h3 class="settings-section-dev-tools-action-title">Seed Database</h3>
        <p class="settings-section-dev-tools-action-description">
          Add sample kanji data for testing and development.
        </p>
        <BaseButton
          :disabled="seedDisabled"
          :loading="isSeeding"
          variant="secondary"
          @click="seed"
        >
          {{ isSeeding ? 'Seeding...' : 'Seed Data' }}
        </BaseButton>
      </div>

      <div class="settings-section-dev-tools-action">
        <h3 class="settings-section-dev-tools-action-title">Clear Database</h3>
        <p class="settings-section-dev-tools-action-description">
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
      confirm-label="Clear All"
      description="This will permanently delete all kanji data. This action cannot be undone."
      :is-open="showClearDialog"
      title="Clear All Data"
      variant="danger"
      @cancel="handleClearCancel"
      @confirm="handleClearConfirm"
    />
  </div>
</template>

<style scoped>
.settings-section-dev-tools {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.settings-section-dev-tools-actions {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
  margin-top: var(--spacing-sm);
}

.settings-section-dev-tools-action {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.settings-section-dev-tools-action-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.settings-section-dev-tools-action-description {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
