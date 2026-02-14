<script setup lang="ts">
/**
 * KanjiKunReadingEditItem
 *
 * UI component: Single kun-yomi reading edit item with dot notation (reading.okurigana).
 * Handles both new (unsaved) and existing readings.
 */

import { computed } from 'vue'

import BaseButton from '@/legacy/base/components/BaseButton.vue'
import BaseInput from '@/legacy/base/components/BaseInput.vue'
import BaseSelect from '@/legacy/base/components/BaseSelect.vue'

import type { ReadingLevel } from '@/legacy/shared/types/database-types'

interface EditKunReading {
  id: number
  reading: string
  okurigana: string
  readingLevel: ReadingLevel
  isNew?: boolean
}

interface KunReadingWarning {
  reading?: string
  okurigana?: string
}

const props = withDefaults(
  defineProps<{
    /** Reading data */
    reading: EditKunReading
    /** Index in list (for numbering) */
    index: number
    /** Total number of items (for disabling down arrow) */
    totalCount: number
    /** Warning messages if validation failed (non-blocking) */
    warning?: KunReadingWarning | undefined
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
  /** Emitted when okurigana changes */
  'update:okurigana': [value: string]
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

const okuriganaModel = computed({
  get: () => props.reading.okurigana,
  set: (value) => {
    emit('update:okurigana', value)
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
    class="kun-reading-edit-item"
    :class="{ 'kun-reading-edit-item-new': reading.isNew }"
  >
    <span class="kun-reading-edit-number">{{ index + 1 }}.</span>

    <div class="kun-reading-edit-kun-inputs">
      <div class="kun-reading-edit-field">
        <BaseInput
          v-model="readingModel"
          label="Reading"
          placeholder="ひらがな"
        />
        <span
          v-if="warning?.reading"
          class="kun-reading-warning"
        >
          ⚠️ {{ warning.reading }}
        </span>
      </div>

      <span class="kun-reading-edit-dot">.</span>

      <div class="kun-reading-edit-field">
        <BaseInput
          v-model="okuriganaModel"
          label="Okurigana"
          placeholder="optional"
        />
        <span
          v-if="warning?.okurigana"
          class="kun-reading-warning"
        >
          ⚠️ {{ warning.okurigana }}
        </span>
      </div>
    </div>

    <div class="kun-reading-edit-field-select">
      <BaseSelect
        v-model="levelModel"
        label="Level"
        :options="GRADE_OPTIONS"
      />
    </div>

    <div class="kun-reading-edit-buttons">
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
.kun-reading-edit-item {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
}

.kun-reading-edit-item:last-child {
  border-bottom: none;
}

.kun-reading-edit-item-new {
  border: 1px dashed var(--color-primary);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-alt);
}

.kun-reading-edit-number {
  min-width: 1.5rem;
  padding-top: var(--spacing-md);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.kun-reading-edit-kun-inputs {
  display: flex;
  flex: 0 1 auto;
  flex-wrap: nowrap;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.kun-reading-edit-field {
  flex: 0 1 100px;
  min-width: 70px;
  max-width: 100px;
}

.kun-reading-edit-field-select {
  min-width: 70px;
  max-width: 90px;
}

.kun-reading-edit-dot {
  padding-bottom: var(--spacing-sm);
  color: var(--color-text-muted);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.kun-reading-edit-buttons {
  display: flex;
  gap: var(--spacing-xs);
  padding-top: var(--spacing-md);
}

.kun-reading-warning {
  margin-top: var(--spacing-xs);
  color: var(--color-warning);
  font-size: var(--font-size-xs);
}
</style>
