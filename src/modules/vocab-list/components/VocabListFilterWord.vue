<script setup lang="ts">
/**
 * VocabListFilterWord
 *
 * Text input filter for searching by word.
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
  <div class="vocab-list-filter-word">
    <BaseInput
      label="Word"
      :model-value="modelValue"
      placeholder="Search word..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.vocab-list-filter-word {
  flex: 1;
  min-width: 150px;
  max-width: 280px;
}

@media (width <= 640px) {
  .vocab-list-filter-word {
    max-width: 100%;
  }
}
</style>
