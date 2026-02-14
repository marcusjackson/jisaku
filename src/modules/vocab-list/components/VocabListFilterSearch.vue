<script setup lang="ts">
/**
 * VocabListFilterSearch
 *
 * Text input filter for search in word, short meaning, and keywords.
 */

import { BaseInput } from '@/base/components'

defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="vocab-list-filter-search">
    <BaseInput
      label="Display + Keywords"
      :model-value="modelValue"
      placeholder="meaning / keywords..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.vocab-list-filter-search {
  flex: 1;
  min-width: 150px;
  max-width: 280px;
}

@media (width <= 640px) {
  .vocab-list-filter-search {
    max-width: 100%;
  }
}
</style>
