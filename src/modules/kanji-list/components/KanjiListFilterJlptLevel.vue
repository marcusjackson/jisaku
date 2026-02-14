<script setup lang="ts">
/**
 * KanjiListFilterJlptLevel
 *
 * Chip toggle filter for JLPT levels (N5-N1).
 */

import type { JlptLevel } from '@/api/kanji'

const props = defineProps<{
  modelValue: JlptLevel[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: JlptLevel[]]
}>()

const levels: JlptLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1']

function toggleLevel(level: JlptLevel): void {
  const current = [...props.modelValue]
  const index = current.indexOf(level)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(level)
  }
  emit('update:modelValue', current)
}

function isSelected(level: JlptLevel): boolean {
  return props.modelValue.includes(level)
}
</script>

<template>
  <div class="kanji-list-filter-jlpt">
    <span class="kanji-list-filter-jlpt-label">JLPT Level</span>
    <div class="kanji-list-filter-jlpt-chips">
      <button
        v-for="level in levels"
        :key="level"
        :aria-pressed="isSelected(level)"
        :class="[
          'kanji-list-filter-jlpt-chip',
          { 'kanji-list-filter-jlpt-chip-selected': isSelected(level) }
        ]"
        type="button"
        @click="toggleLevel(level)"
      >
        {{ level }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.kanji-list-filter-jlpt {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-list-filter-jlpt-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-list-filter-jlpt-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.kanji-list-filter-jlpt-chip {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all 0.15s;
}

.kanji-list-filter-jlpt-chip:hover {
  background-color: var(--color-surface-hover);
}

.kanji-list-filter-jlpt-chip-selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
</style>
