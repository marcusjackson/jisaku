<script setup lang="ts">
/**
 * KanjiFilterJoyoLevel
 *
 * UI component for filtering kanji by Joyo level.
 * Renders toggle chips for grade levels multi-select.
 */

import { JOYO_OPTIONS } from '@/shared/constants/kanji-constants'

import type { JoyoLevel } from '@/shared/types/database-types'

const props = defineProps<{
  /** Currently selected Joyo levels */
  modelValue: JoyoLevel[]
}>()

const emit = defineEmits<{
  /** Emitted when selection changes */
  'update:modelValue': [value: JoyoLevel[]]
}>()

function toggleLevel(level: JoyoLevel) {
  const newValue = props.modelValue.includes(level)
    ? props.modelValue.filter((v) => v !== level)
    : [...props.modelValue, level]
  emit('update:modelValue', newValue)
}

function isSelected(level: JoyoLevel): boolean {
  return props.modelValue.includes(level)
}
</script>

<template>
  <div class="kanji-filter-joyo">
    <span class="kanji-filter-joyo-label">Joyo Level</span>
    <div
      aria-label="Joyo Level filter"
      class="kanji-filter-joyo-chips"
      role="group"
    >
      <button
        v-for="option in JOYO_OPTIONS"
        :key="option.value"
        :aria-pressed="isSelected(option.value)"
        class="kanji-filter-joyo-chip"
        :class="{ 'kanji-filter-joyo-chip-selected': isSelected(option.value) }"
        type="button"
        @click="toggleLevel(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.kanji-filter-joyo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-filter-joyo-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-filter-joyo-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.kanji-filter-joyo-chip {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition:
    background-color 0.15s,
    border-color 0.15s,
    color 0.15s;
}

.kanji-filter-joyo-chip:hover {
  background-color: var(--color-surface-hover);
}

.kanji-filter-joyo-chip-selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
}
</style>
