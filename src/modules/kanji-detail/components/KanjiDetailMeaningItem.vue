<script setup lang="ts">
/**
 * KanjiDetailMeaningItem
 *
 * Single meaning item with edit/delete/reorder controls.
 * Used in the meanings dialog.
 */

import { BaseButton, BaseInput } from '@/base/components'

const props = defineProps<{
  meaningText: string
  additionalInfo: string
  index: number
  total: number
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  'update:meaningText': [value: string]
  'update:additionalInfo': [value: string]
  'move-up': []
  'move-down': []
  delete: []
}>()
</script>

<template>
  <div class="meaning-item">
    <span class="meaning-item-number">{{ index + 1 }}.</span>

    <div class="meaning-item-fields">
      <BaseInput
        class="meaning-input"
        :model-value="props.meaningText"
        placeholder="Meaning"
        @update:model-value="emit('update:meaningText', String($event ?? ''))"
      />

      <BaseInput
        class="additional-info-input"
        :model-value="props.additionalInfo"
        placeholder="Additional info (optional)"
        @update:model-value="
          emit('update:additionalInfo', String($event ?? ''))
        "
      />
    </div>

    <div class="meaning-item-actions">
      <BaseButton
        aria-label="Move up"
        :disabled="index === 0"
        size="sm"
        variant="ghost"
        @click="emit('move-up')"
      >
        ↑
      </BaseButton>
      <BaseButton
        aria-label="Move down"
        :disabled="index === total - 1"
        size="sm"
        variant="ghost"
        @click="emit('move-down')"
      >
        ↓
      </BaseButton>
      <BaseButton
        v-if="props.destructiveMode"
        aria-label="Delete"
        size="sm"
        variant="ghost"
        @click="emit('delete')"
      >
        ✕
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.meaning-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  background: var(--color-background-secondary);
}

.meaning-item-number {
  min-width: 1.5rem;
  padding-top: var(--spacing-xs);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.meaning-item-fields {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.meaning-input {
  width: 100%;
}

.additional-info-input {
  width: 100%;
}

.meaning-item-actions {
  display: flex;
  gap: var(--spacing-xs);
}

@media (width <= 480px) {
  .meaning-item {
    flex-wrap: wrap;
  }

  .meaning-item-actions {
    justify-content: flex-end;
    width: 100%;
    margin-top: var(--spacing-xs);
  }
}
</style>
