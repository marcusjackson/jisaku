<script setup lang="ts">
const props = defineProps<{
  /** Currently selected Kentei levels */
  modelValue: string[]
}>()

const emit = defineEmits<{
  /** Emitted when selection changes */
  'update:modelValue': [value: string[]]
}>()

/**
 * KanjiFilterKenteiLevel
 *
 * UI component for filtering kanji by Kanji Kentei level.
 * Renders toggle chips for 10級-1級 multi-select.
 */

const KENTEI_OPTIONS = [
  { value: '10', label: '10級' },
  { value: '9', label: '9級' },
  { value: '8', label: '8級' },
  { value: '7', label: '7級' },
  { value: '6', label: '6級' },
  { value: '5', label: '5級' },
  { value: '4', label: '4級' },
  { value: '3', label: '3級' },
  { value: 'pre2', label: '準2級' },
  { value: '2', label: '2級' },
  { value: 'pre1', label: '準1級' },
  { value: '1', label: '1級' }
]

function toggleLevel(level: string) {
  const newValue = props.modelValue.includes(level)
    ? props.modelValue.filter((v) => v !== level)
    : [...props.modelValue, level]
  emit('update:modelValue', newValue)
}

function isSelected(level: string): boolean {
  return props.modelValue.includes(level)
}
</script>

<template>
  <div class="kanji-filter-kentei">
    <span class="kanji-filter-kentei-label">Kanji Kentei Level</span>
    <div
      aria-label="Kanji Kentei Level filter"
      class="kanji-filter-kentei-chips"
      role="group"
    >
      <button
        v-for="option in KENTEI_OPTIONS"
        :key="option.value"
        :aria-pressed="isSelected(option.value)"
        class="kanji-filter-kentei-chip"
        :class="{
          'kanji-filter-kentei-chip-selected': isSelected(option.value)
        }"
        type="button"
        @click="toggleLevel(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.kanji-filter-kentei {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-filter-kentei-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-filter-kentei-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.kanji-filter-kentei-chip {
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

.kanji-filter-kentei-chip:hover {
  background-color: var(--color-surface-hover);
}

.kanji-filter-kentei-chip-selected {
  border-color: var(--color-primary);
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

.kanji-filter-kentei-chip-selected:hover {
  border-color: var(--color-primary-hover);
  background-color: var(--color-primary-hover);
}
</style>
