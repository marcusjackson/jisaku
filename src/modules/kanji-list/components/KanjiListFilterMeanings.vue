<script setup lang="ts">
/**
 * KanjiListFilterMeanings
 *
 * Text input filter for meanings search.
 * Filters on meaning_text field only (not additional_info).
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
  <div class="kanji-list-filter-meanings">
    <BaseInput
      label="Meanings"
      :model-value="modelValue"
      placeholder="search meanings..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-meanings {
  flex: 1;
  min-width: 150px;
  max-width: 280px;
}
</style>
