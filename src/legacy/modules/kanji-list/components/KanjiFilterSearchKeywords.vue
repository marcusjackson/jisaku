<script setup lang="ts">
/**
 * KanjiFilterSearchKeywords
 *
 * UI component for filtering kanji by display meaning and search keywords.
 * Searches in both short_meaning and search_keywords fields.
 */

import BaseInput from '@/legacy/base/components/BaseInput.vue'

defineProps<{
  /** Current search value */
  modelValue: string
}>()

const emit = defineEmits<{
  /** Emitted when search value changes */
  'update:modelValue': [value: string]
}>()

function handleInput(value: string | number | undefined) {
  emit('update:modelValue', String(value ?? ''))
}
</script>

<template>
  <div class="kanji-filter-search-keywords">
    <BaseInput
      label="Meaning/Keywords"
      :model-value="modelValue"
      name="searchKeywords"
      placeholder="water, lake..."
      @update:model-value="handleInput"
    />
  </div>
</template>

<style scoped>
.kanji-filter-search-keywords {
  min-width: 140px;
}
</style>
