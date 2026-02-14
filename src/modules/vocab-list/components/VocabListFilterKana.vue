<script setup lang="ts">
/**
 * VocabListFilterKana
 *
 * Text input filter for kana search.
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
  <div class="vocab-list-filter-kana">
    <BaseInput
      label="Kana"
      :model-value="modelValue"
      placeholder="ひらがな / カタカナ..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.vocab-list-filter-kana {
  flex: 1;
  min-width: 120px;
  max-width: 200px;
}

@media (width <= 640px) {
  .vocab-list-filter-kana {
    max-width: 100%;
  }
}
</style>
