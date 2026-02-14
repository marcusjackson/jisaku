<script setup lang="ts">
/**
 * KanjiDetailReadingItem
 *
 * Single reading item for edit dialog with reorder/delete controls.
 * Handles both on-yomi and kun-yomi with optional okurigana field.
 */

import { computed } from 'vue'

import { BaseButton, BaseInput, BaseSelect } from '@/base/components'

import { readingLevels } from '../schemas/kanji-detail-on-reading-schema'

import type { ReadingLevel } from '../kanji-detail-types'

const props = defineProps<{
  reading: string
  okurigana?: string
  readingLevel: ReadingLevel
  /** Whether this item shows okurigana field (kun-yomi) */
  showOkurigana?: boolean
  /** Warning message for character type */
  warning?: string
  /** Warning for okurigana field */
  okuriganaWarning?: string
  /** Index for display number */
  index: number
  /** Total items for disable logic */
  total: number
  /** Whether destructive mode is enabled */
  destructiveMode?: boolean
}>()

const emit = defineEmits<{
  'update:reading': [value: string]
  'update:okurigana': [value: string]
  'update:readingLevel': [value: ReadingLevel]
  moveUp: []
  moveDown: []
  delete: []
}>()

const levelOptions = computed(() =>
  readingLevels.map((level) => ({
    value: level,
    label: level
  }))
)

const canMoveUp = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < props.total - 1)
</script>

<template>
  <div class="reading-item">
    <div class="reading-item-header">
      <span class="reading-item-number">{{ index + 1 }}.</span>
      <div class="reading-item-controls">
        <BaseButton
          aria-label="Move up"
          :disabled="!canMoveUp"
          size="sm"
          variant="ghost"
          @click="emit('moveUp')"
        >
          ↑
        </BaseButton>
        <BaseButton
          aria-label="Move down"
          :disabled="!canMoveDown"
          size="sm"
          variant="ghost"
          @click="emit('moveDown')"
        >
          ↓
        </BaseButton>
        <BaseButton
          v-if="props.destructiveMode"
          aria-label="Delete reading"
          size="sm"
          variant="ghost"
          @click="emit('delete')"
        >
          ×
        </BaseButton>
      </div>
    </div>

    <div class="reading-item-fields">
      <div class="reading-item-field reading-item-field-main">
        <BaseInput
          :model-value="reading"
          placeholder="Reading"
          @update:model-value="emit('update:reading', String($event))"
        />
        <span
          v-if="warning"
          class="reading-item-warning"
          >{{ warning }}</span
        >
      </div>

      <div
        v-if="showOkurigana"
        class="reading-item-field reading-item-field-okurigana"
      >
        <BaseInput
          :model-value="okurigana"
          placeholder="Okurigana"
          @update:model-value="emit('update:okurigana', String($event))"
        />
        <span
          v-if="okuriganaWarning"
          class="reading-item-warning"
          >{{ okuriganaWarning }}</span
        >
      </div>

      <div class="reading-item-field reading-item-field-level">
        <BaseSelect
          :model-value="readingLevel"
          :options="levelOptions"
          @update:model-value="
            emit('update:readingLevel', $event as ReadingLevel)
          "
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.reading-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.reading-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reading-item-number {
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.reading-item-controls {
  display: flex;
  gap: var(--spacing-xs);
}

.reading-item-fields {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.reading-item-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reading-item-field-main {
  flex: 2;
  min-width: 80px;
}

.reading-item-field-okurigana {
  flex: 1;
  min-width: 60px;
}

.reading-item-field-level {
  flex: 0 0 auto;
  min-width: 60px;
}

.reading-item-warning {
  color: var(--color-warning);
  font-size: var(--font-size-xs);
}
</style>
