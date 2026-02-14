<script setup lang="ts">
/**
 * ComponentDetailFormItem
 *
 * Displays a single component form variant with edit/delete/reorder controls.
 */

import { computed } from 'vue'

import { BaseButton } from '@/base/components'

import type { ComponentForm } from '@/api/component'

const props = defineProps<{
  /** The form to display */
  form: ComponentForm
  /** Position in list for reorder button state */
  index: number
  /** Total forms count for reorder button state */
  total: number
  /** Show delete button */
  isDestructiveMode: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  'move-up': []
  'move-down': []
}>()

const canMoveUp = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < props.total - 1)
</script>

<template>
  <div
    class="form-item"
    :data-testid="`form-item-${form.id}`"
  >
    <div class="form-item-reorder">
      <BaseButton
        aria-label="Move up"
        :disabled="!canMoveUp"
        size="sm"
        variant="ghost"
        @click="emit('move-up')"
      >
        ↑
      </BaseButton>
      <BaseButton
        aria-label="Move down"
        :disabled="!canMoveDown"
        size="sm"
        variant="ghost"
        @click="emit('move-down')"
      >
        ↓
      </BaseButton>
    </div>

    <div class="form-item-content">
      <div class="form-item-header">
        <span class="form-item-character">{{ form.formCharacter }}</span>
        <span
          v-if="form.formName"
          class="form-item-name"
        >
          {{ form.formName }}
        </span>
        <span
          v-if="form.strokeCount"
          class="form-item-strokes"
        >
          {{ form.strokeCount }}画
        </span>
      </div>
      <p
        v-if="form.usageNotes"
        class="form-item-notes"
      >
        {{ form.usageNotes }}
      </p>
    </div>

    <div class="form-item-actions">
      <BaseButton
        aria-label="Edit"
        size="sm"
        variant="secondary"
        @click="emit('edit')"
      >
        Edit
      </BaseButton>
      <BaseButton
        v-if="isDestructiveMode"
        aria-label="Delete"
        size="sm"
        variant="danger"
        @click="emit('delete')"
      >
        Delete
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.form-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.form-item-reorder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.form-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
}

.form-item-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.form-item-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-jp);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
}

.form-item-name {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.form-item-strokes {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.form-item-notes {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
}

.form-item-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}

@media (width <= 640px) {
  .form-item {
    flex-direction: column;
  }

  .form-item-reorder {
    flex-direction: row;
  }

  .form-item-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
