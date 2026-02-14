<script setup lang="ts">
/**
 * KanjiListFilterKeywords
 *
 * Text input filter for keyword search.
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
  <div class="kanji-list-filter-keywords">
    <BaseInput
      label="Display + Keywords"
      :model-value="modelValue"
      placeholder="short display / keywords..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-keywords {
  flex: 1;
  min-width: 150px;
  max-width: 280px;
}
</style>
