<script setup lang="ts">
/**
 * VocabListFilterJlptLevel
 *
 * Chip toggle filter for JLPT levels (N5-N1, non-jlpt).
 */

import { JLPT_LABELS, type VocabJlptLevel } from '../vocab-list-types'

const props = defineProps<{
  modelValue: VocabJlptLevel[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: VocabJlptLevel[]]
}>()

const levels: VocabJlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1', 'non-jlpt']

function toggleLevel(level: VocabJlptLevel): void {
  const current = [...props.modelValue]
  const index = current.indexOf(level)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(level)
  }
  emit('update:modelValue', current)
}

function isSelected(level: VocabJlptLevel): boolean {
  return props.modelValue.includes(level)
}
</script>

<template>
  <div class="vocab-list-filter-jlpt">
    <span class="vocab-list-filter-jlpt-label">JLPT Level</span>
    <div class="vocab-list-filter-jlpt-chips">
      <button
        v-for="level in levels"
        :key="level"
        :aria-pressed="isSelected(level)"
        :class="[
          'vocab-list-filter-jlpt-chip',
          { 'vocab-list-filter-jlpt-chip-selected': isSelected(level) }
        ]"
        type="button"
        @click="toggleLevel(level)"
      >
        {{ JLPT_LABELS[level] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.vocab-list-filter-jlpt {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.vocab-list-filter-jlpt-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.vocab-list-filter-jlpt-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.vocab-list-filter-jlpt-chip {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.vocab-list-filter-jlpt-chip:hover {
  background-color: var(--color-surface-hover);
}

.vocab-list-filter-jlpt-chip-selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
</style>
