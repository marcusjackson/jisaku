<script setup lang="ts">
/**
 * ComponentListFilterPresence
 *
 * Generic presence filter component for field content.
 * Used for description, forms, and groupings filters.
 */

import { BaseSelect } from '@/base/components'

import type { PresenceFilterValue } from '../component-list-types'

defineProps<{
  label: string
  modelValue: PresenceFilterValue
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PresenceFilterValue]
}>()

const options = [
  { value: 'any', label: 'Any' },
  { value: 'has', label: 'Has content' },
  { value: 'missing', label: 'Empty' }
]

function handleChange(value: string | null | undefined): void {
  if (value === 'has' || value === 'missing') {
    emit('update:modelValue', value)
  } else {
    emit('update:modelValue', null)
  }
}

function getCurrentValue(modelValue: PresenceFilterValue): string {
  return modelValue ?? 'any'
}
</script>

<template>
  <div class="component-list-filter-presence">
    <span class="component-list-filter-presence-label">{{ label }}</span>
    <BaseSelect
      :model-value="getCurrentValue(modelValue)"
      :options="options"
      @update:model-value="handleChange"
    />
  </div>
</template>

<style scoped>
.component-list-filter-presence {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 120px;
}

.component-list-filter-presence-label {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
</style>
