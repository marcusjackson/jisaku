<script setup lang="ts">
/**
 * KanjiListFilterJoyoLevel
 *
 * Chip toggle filter for Joyo grade levels.
 */

import { useId } from 'vue'

import { JOYO_LABELS, type JoyoLevel } from '../kanji-list-types'

const props = defineProps<{
  modelValue: JoyoLevel[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: JoyoLevel[]]
}>()

const levels: JoyoLevel[] = [
  'elementary1',
  'elementary2',
  'elementary3',
  'elementary4',
  'elementary5',
  'elementary6',
  'secondary'
]

function toggleLevel(level: JoyoLevel): void {
  const current = [...props.modelValue]
  const index = current.indexOf(level)
  if (index >= 0) {
    current.splice(index, 1)
  } else {
    current.push(level)
  }
  emit('update:modelValue', current)
}

function isSelected(level: JoyoLevel): boolean {
  return props.modelValue.includes(level)
}

const labelId = useId()
</script>

<template>
  <div class="kanji-list-filter-joyo">
    <span :id="labelId" class="kanji-list-filter-joyo-label">Joyo Level</span>
    <div :aria-labelledby="labelId" class="kanji-list-filter-joyo-chips" role="group">
      <!-- Raw <button>: chip toggle, bare layout incompatible with BaseButton -->
      <button
        v-for="level in levels"
        :key="level"
        :aria-pressed="isSelected(level)"
        :class="[
          'kanji-list-filter-joyo-chip',
          { 'kanji-list-filter-joyo-chip-selected': isSelected(level) }
        ]"
        type="button"
        @click="toggleLevel(level)"
      >
        {{ JOYO_LABELS[level] }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.kanji-list-filter-joyo {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-list-filter-joyo-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-list-filter-joyo-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.kanji-list-filter-joyo-chip {
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.kanji-list-filter-joyo-chip:hover {
  background-color: var(--color-surface-hover);
}

.kanji-list-filter-joyo-chip:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.kanji-list-filter-joyo-chip-selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}
</style>
