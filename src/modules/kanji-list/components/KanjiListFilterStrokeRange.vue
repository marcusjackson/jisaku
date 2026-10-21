<script setup lang="ts">
/**
 * KanjiListFilterStrokeRange
 *
 * Min/max stroke count filter inputs.
 */

import { BaseInput } from '@/base/components'

defineProps<{
  min: number | undefined
  max: number | undefined
}>()

const emit = defineEmits<{
  'update:min': [value: number | undefined]
  'update:max': [value: number | undefined]
}>()

function handleMinChange(value: string | number | undefined): void {
  const num = parseInt(String(value ?? ''), 10)
  emit('update:min', isNaN(num) ? undefined : num)
}

function handleMaxChange(value: string | number | undefined): void {
  const num = parseInt(String(value ?? ''), 10)
  emit('update:max', isNaN(num) ? undefined : num)
}
</script>

<template>
  <div class="kanji-list-filter-stroke-range">
    <span class="kanji-list-filter-stroke-range-label">Strokes</span>
    <div class="kanji-list-filter-stroke-range-inputs">
      <BaseInput
        inputmode="numeric"
        label="Minimum"
        :model-value="min?.toString() ?? ''"
        pattern="[0-9]*"
        placeholder="Min"
        type="number"
        @update:model-value="handleMinChange"
      />
      <span class="kanji-list-filter-stroke-range-separator">–</span>
      <BaseInput
        inputmode="numeric"
        label="Maximum"
        :model-value="max?.toString() ?? ''"
        pattern="[0-9]*"
        placeholder="Max"
        type="number"
        @update:model-value="handleMaxChange"
      />
    </div>
  </div>
</template>

<style scoped>
.kanji-list-filter-stroke-range {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-list-filter-stroke-range-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-list-filter-stroke-range-inputs {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.kanji-list-filter-stroke-range-inputs :deep(input) {
  width: 72px;
}

.kanji-list-filter-stroke-range-separator {
  color: var(--color-text-secondary);
}

/* Visually hidden labels: the visible "Strokes" caption groups the pair */
.kanji-list-filter-stroke-range-inputs :deep(.base-input-label) {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  border-width: 0;
  white-space: nowrap;
  clip-path: inset(50%);
}
</style>
