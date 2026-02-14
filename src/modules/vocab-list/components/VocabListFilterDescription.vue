<script setup lang="ts">
/**
 * VocabListFilterDescription
 *
 * Select dropdown filter for description presence.
 */

import { computed } from 'vue'

import { BaseSelect } from '@/base/components'

import type { DescriptionFilledFilter } from '../vocab-list-types'

const props = defineProps<{
  modelValue: DescriptionFilledFilter
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DescriptionFilledFilter]
}>()

const options = [
  { value: 'filled', label: 'Has description' },
  { value: 'empty', label: 'No description' }
]

const selectedValue = computed({
  get: () => props.modelValue ?? '',
  set: (value: string | null | undefined) => {
    if (value === 'filled' || value === 'empty') {
      emit('update:modelValue', value)
    } else {
      emit('update:modelValue', null)
    }
  }
})
</script>

<template>
  <div class="vocab-list-filter-description">
    <BaseSelect
      v-model="selectedValue"
      label="Description"
      :options="options"
      placeholder="Any"
    />
  </div>
</template>

<style scoped>
.vocab-list-filter-description {
  min-width: 140px;
  max-width: 200px;
}

@media (width <= 640px) {
  .vocab-list-filter-description {
    min-width: 100%;
    max-width: 100%;
  }
}
</style>
