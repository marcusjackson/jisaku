<script setup lang="ts">
/**
 * KanjiOnReadingEditItem
 *
 * UI component: Single on-yomi reading edit item with reordering and validation.
 * Handles both new (unsaved) and existing readings.
 */

import { computed } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseInput from '@/legacy/base/components/BaseInput.vue'
import BaseSelect from '@/legacy/base/components/BaseSelect.vue'

import type { ReadingLevel } from '@/legacy/shared/types/database-types'

interface EditOnReading {
  id: number
  reading: string
  readingLevel: ReadingLevel
  isNew?: boolean
}

const props = withDefaults(
  defineProps<{
    /** Reading data */
    reading: EditOnReading
    /** Index in list (for numbering) */
    index: number
    /** Total number of items (for disabling down arrow) */
    totalCount: number
    /** Warning message if validation failed (non-blocking) */
    warning?: string | undefined
    /** Whether destructive mode is enabled (shows delete button) */
    isDestructiveMode?: boolean
  }>(),
  {
    warning: undefined,
    isDestructiveMode: false
  }
)

const emit = defineEmits<{
  /** Emitted when reading text changes */
  'update:reading': [value: string]
  /** Emitted when level changes */
  'update:level': [value: ReadingLevel]
  /** Emitted when Save clicked (new item only) */
  save: []
  /** Emitted when Cancel clicked (new item only) */
  cancel: []
  /** Emitted when up arrow clicked */
  moveUp: []
  /** Emitted when down arrow clicked */
  moveDown: []
  /** Emitted when delete clicked */
  delete: []
}>()

// Grade level options
const GRADE_OPTIONS = [
  { label: '小', value: '小' },
  { label: '中', value: '中' },
  { label: '高', value: '高' },
  { label: '外', value: '外' }
]

const readingModel = computed({
  get: () => props.reading.reading,
  set: (value) => {
    emit('update:reading', value)
  }
})

const levelModel = computed({
  get: () => props.reading.readingLevel,
  set: (value) => {
    emit('update:level', value)
  }
})
</script>

<template>
  <div
    class="on-reading-edit-item"
    :class="{ 'on-reading-edit-item-new': reading.isNew }"
  >
    <span class="on-reading-edit-number">{{ index + 1 }}.</span>

    <div class="on-reading-edit-field">
      <BaseInput
        v-model="readingModel"
        label="Reading"
        placeholder="カタカナ"
      />
      <span
        v-if="warning"
        class="on-reading-warning"
      >
        ⚠️ {{ warning }}
      </span>
    </div>

    <div class="on-reading-edit-field-select">
      <BaseSelect
        v-model="levelModel"
        label="Level"
        :options="GRADE_OPTIONS"
      />
    </div>

    <div class="on-reading-edit-buttons">
      <!-- New item: Save/Cancel buttons -->
      <template v-if="reading.isNew">
        <BaseButton
          aria-label="Save reading"
          size="sm"
          variant="primary"
          @click="emit('save')"
        >
          Save
        </BaseButton>
        <BaseButton
          aria-label="Cancel"
          size="sm"
          variant="secondary"
          @click="emit('cancel')"
        >
          Cancel
        </BaseButton>
      </template>
      <!-- Existing item: Reorder and delete buttons -->
      <template v-else>
        <BaseButton
          aria-label="Move up"
          :disabled="index === 0"
          size="sm"
          variant="ghost"
          @click="emit('moveUp')"
        >
          ↑
        </BaseButton>
        <BaseButton
          aria-label="Move down"
          :disabled="index === totalCount - 1"
          size="sm"
          variant="ghost"
          @click="emit('moveDown')"
        >
          ↓
        </BaseButton>
        <BaseButton
          v-if="isDestructiveMode"
          aria-label="Delete reading"
          size="sm"
          variant="ghost"
          @click="emit('delete')"
        >
          ✕
        </BaseButton>
      </template>
    </div>
  </div>
</template>

<style scoped>
.on-reading-edit-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.on-reading-edit-item:last-child {
  border-bottom: none;
}

.on-reading-edit-item-new {
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-alt);
}

.on-reading-edit-number {
  min-width: 1.5rem;
  padding-top: var(--spacing-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.on-reading-edit-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 80px;
  max-width: 140px;
}

.on-reading-edit-field-select {
  min-width: 70px;
  max-width: 90px;
}

.on-reading-edit-buttons {
  display: flex;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-md);
}

.on-reading-warning {
  margin-top: var(--spacing-xs);
  color: var(--color-warning);
  font-size: var(--font-size-xs);
}
</style>
