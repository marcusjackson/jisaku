<script setup lang="ts">
/**
 * KanjiFilterKunYomi
 *
 * UI component for filtering kanji by kun-yomi (Japanese reading).
 * Renders a text input for kun-yomi search.
 */

import BaseInput from '@/base/components/BaseInput.vue'

defineProps<{
  /** Current kun-yomi filter value */
  modelValue: string
}>()

const emit = defineEmits<{
  /** Emitted when kun-yomi value changes */
  'update:modelValue': [value: string]
}>()

function handleInput(value: string | number | undefined) {
  emit('update:modelValue', String(value ?? ''))
}
</script>

<template>
  <div class="kanji-filter-kun-yomi">
    <BaseInput
      label="Kun-yomi"
      :model-value="modelValue"
      name="kunYomi"
      placeholder="あか, あかり..."
      @update:model-value="handleInput"
    />
  </div>
</template>

<style scoped>
.kanji-filter-kun-yomi {
  min-width: 140px;
}
</style>
