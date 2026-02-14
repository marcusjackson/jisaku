<script setup lang="ts">
/**
 * ComponentListFilterRadicalStatus
 *
 * Filter for whether component can be a radical.
 * Options: Any (default), Is Radical, Not Radical
 */

import { BaseSelect } from '@/base/components'

defineProps<{
  modelValue: boolean | undefined
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean | undefined]
}>()

const options = [
  { value: 'any', label: 'Any' },
  { value: 'yes', label: 'Is radical' },
  { value: 'no', label: 'Not radical' }
]

function handleChange(value: string | null | undefined): void {
  if (value === 'yes') {
    emit('update:modelValue', true)
  } else if (value === 'no') {
    emit('update:modelValue', false)
  } else {
    emit('update:modelValue', undefined)
  }
}

function getCurrentValue(modelValue: boolean | undefined): string {
  if (modelValue === true) return 'yes'
  if (modelValue === false) return 'no'
  return 'any'
}
</script>

<template>
  <div class="component-list-filter-radical-status">
    <span class="component-list-filter-radical-status-label">Radical</span>
    <BaseSelect
      :model-value="getCurrentValue(modelValue)"
      :options="options"
      @update:model-value="handleChange"
    />
  </div>
</template>

<style scoped>
.component-list-filter-radical-status {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 120px;
}

.component-list-filter-radical-status-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
</style>
