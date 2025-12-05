<script setup lang="ts">
/**
 * KanjiFilterJlptLevel
 *
 * UI component for filtering kanji by JLPT level.
 * Renders toggle chips for N5-N1 multi-select.
 */

import { JLPT_OPTIONS } from '@/shared/constants/kanji-constants'

import type { JlptLevel } from '@/shared/types/database-types'

const props = defineProps<{
  /** Currently selected JLPT levels */
  modelValue: JlptLevel[]
}>()

const emit = defineEmits<{
  /** Emitted when selection changes */
  'update:modelValue': [value: JlptLevel[]]
}>()

function toggleLevel(level: JlptLevel) {
  const newValue = props.modelValue.includes(level)
    ? props.modelValue.filter((v) => v !== level)
    : [...props.modelValue, level]
  emit('update:modelValue', newValue)
}

function isSelected(level: JlptLevel): boolean {
  return props.modelValue.includes(level)
}
</script>

<template>
  <div class="kanji-filter-jlpt">
    <span class="kanji-filter-jlpt-label">JLPT Level</span>
    <div
      aria-label="JLPT Level filter"
      class="kanji-filter-jlpt-chips"
      role="group"
    >
      <button
        v-for="option in JLPT_OPTIONS"
        :key="option.value"
        :aria-pressed="isSelected(option.value)"
        class="kanji-filter-jlpt-chip"
        :class="{ 'kanji-filter-jlpt-chip-selected': isSelected(option.value) }"
        type="button"
        @click="toggleLevel(option.value)"
      >
        {{ option.value }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.kanji-filter-jlpt {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-filter-jlpt-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-filter-jlpt-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.kanji-filter-jlpt-chip {
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

.kanji-filter-jlpt-chip:hover {
  background-color: var(--color-surface-hover);
}

.kanji-filter-jlpt-chip-selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

.kanji-filter-jlpt-chip-selected:hover {
  border-color: var(--color-primary-hover);
  background-color: var(--color-primary-hover);
}
</style>
