<script setup lang="ts">
/**
 * SettingsSectionDevTools
 *
 * Section component for developer tools (DEV mode only).
 * Handles seed and clear operations via events.
 */

import { computed, ref } from 'vue'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedConfirmDialog from '@/shared/components/SharedConfirmDialog.vue'
import SharedSection from '@/shared/components/SharedSection.vue'

interface Props {
  isSeeding: boolean
  isClearing: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'seed-data': []
  'clear-data': []
}>()

const showClearDialog = ref(false)

const seedDisabled = computed(() => props.isSeeding || props.isClearing)
const clearDisabled = computed(() => props.isClearing || props.isSeeding)

function handleSeedClick(): void {
  emit('seed-data')
}

function handleClearClick(): void {
  showClearDialog.value = true
}

function handleClearConfirm(): void {
  showClearDialog.value = false
  emit('clear-data')
}

function handleClearCancel(): void {
  showClearDialog.value = false
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="false"
    test-id="settings-dev-tools"
    title="Developer Tools"
  >
    <p class="description">
      Tools for testing and development. Only visible in development mode.
    </p>

    <div class="dev-tools-actions">
      <div class="action">
        <h3 class="action-title">Seed Database</h3>
        <p class="action-description">
          Add sample kanji data for testing and development.
        </p>
        <BaseButton
          :disabled="seedDisabled"
          :loading="isSeeding"
          variant="secondary"
          @click="handleSeedClick"
        >
          {{ isSeeding ? 'Seeding...' : 'Seed Data' }}
        </BaseButton>
      </div>

      <div class="action">
        <h3 class="action-title">Clear Database</h3>
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

.dev-tools-actions {
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
</style>
