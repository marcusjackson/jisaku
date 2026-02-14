<script setup lang="ts">
/**
 * KanjiListFilterKenteiLevel
 *
 * Chip toggle filter for Kanji Kentei levels.
 */

import { type KanjiKenteiLevel, KENTEI_LABELS } from '../kanji-list-types'

const props = defineProps<{
  modelValue: KanjiKenteiLevel[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: KanjiKenteiLevel[]]
}>()

const levels: KanjiKenteiLevel[] = [
  '10',
  '9',
  '8',
  '7',
  '6',
  '5',
  '4',
  '3',
  'pre2',
  '2',
  'pre1',
  '1'
]

function toggleLevel(level: KanjiKenteiLevel): void {
  const current = [...props.modelValue]
  const index = current.indexOf(level)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(level)
  }
  emit('update:modelValue', current)
}

function isSelected(level: KanjiKenteiLevel): boolean {
  return props.modelValue.includes(level)
}
</script>

<template>
  <div class="kanji-list-filter-kentei">
    <span class="kanji-list-filter-kentei-label">Kanji Kentei Level</span>
    <div class="kanji-list-filter-kentei-chips">
      <button
        v-for="level in levels"
        :key="level"
        :aria-pressed="isSelected(level)"
        :class="[
          'kanji-list-filter-kentei-chip',
          { 'kanji-list-filter-kentei-chip-selected': isSelected(level) }
        ]"
        type="button"
        @click="toggleLevel(level)"
      >
        {{ KENTEI_LABELS[level] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.kanji-list-filter-kentei {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-list-filter-kentei-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-list-filter-kentei-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.kanji-list-filter-kentei-chip {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.kanji-list-filter-kentei-chip:hover {
  background-color: var(--color-surface-hover);
}

.kanji-list-filter-kentei-chip-selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
</style>
