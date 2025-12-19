<script setup lang="ts">
/**
 * KanjiFilterOnYomi
 *
 * UI component for filtering kanji by on-yomi (Chinese reading).
 * Renders a text input for on-yomi search.
 */

import BaseInput from '@/base/components/BaseInput.vue'

defineProps<{
  /** Current on-yomi filter value */
  modelValue: string
}>()

const emit = defineEmits<{
  /** Emitted when on-yomi value changes */
  'update:modelValue': [value: string]
}>()

function handleInput(value: string | number | undefined) {
  emit('update:modelValue', String(value ?? ''))
}
</script>

<template>
  <div class="kanji-filter-on-yomi">
    <BaseInput
      label="On-yomi"
      :model-value="modelValue"
      name="onYomi"
      placeholder="メイ, ミョウ..."
      @update:model-value="handleInput"
    />
  </div>
</template>

<style scoped>
.kanji-filter-on-yomi {
  min-width: 140px;
}
</style>
