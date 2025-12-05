<script setup lang="ts">
/**
 * KanjiFilterStrokeRange
 *
 * UI component for filtering kanji by stroke count range.
 * Renders min and max number inputs.
 */

import BaseInput from '@/base/components/BaseInput.vue'

defineProps<{
  /** Minimum stroke count */
  min: number | undefined
  /** Maximum stroke count */
  max: number | undefined
}>()

const emit = defineEmits<{
  /** Emitted when min value changes */
  'update:min': [value: number | undefined]
  /** Emitted when max value changes */
  'update:max': [value: number | undefined]
}>()

function handleMinInput(value: string | number | undefined) {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  emit('update:min', isNaN(num) || value === '' ? undefined : num)
}

function handleMaxInput(value: string | number | undefined) {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10)
  emit('update:max', isNaN(num) || value === '' ? undefined : num)
}
</script>

<template>
  <div class="kanji-filter-stroke-range">
    <span class="kanji-filter-stroke-range-label">Strokes</span>
    <div class="kanji-filter-stroke-range-inputs">
      <BaseInput
        label="Minimum strokes"
        :model-value="min"
        name="strokeMin"
        placeholder="Min"
        type="number"
        @update:model-value="handleMinInput"
      />
      <span class="kanji-filter-stroke-range-separator">–</span>
      <BaseInput
        label="Maximum strokes"
        :model-value="max"
        name="strokeMax"
        placeholder="Max"
        type="number"
        @update:model-value="handleMaxInput"
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-filter-stroke-range {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-filter-stroke-range-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-filter-stroke-range-inputs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.kanji-filter-stroke-range-inputs :deep(.base-input) {
  flex: 1;
  min-width: 60px;
}

.kanji-filter-stroke-range-inputs :deep(.base-input-label) {
  /* Hide the label visually but keep for screen readers */
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  border: 0;
}

.kanji-filter-stroke-range-separator {
  color: var(--color-text-tertiary);
}
</style>
