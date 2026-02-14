<script setup lang="ts">
/**
 * KanjiFilterCharacter
 *
 * UI component for filtering kanji by exact character match.
 * Renders a text input for character search.
 */

import BaseInput from '@/legacy/base/components/BaseInput.vue'

defineProps<{
  /** Current character filter value */
  modelValue: string
}>()

const emit = defineEmits<{
  /** Emitted when character value changes */
  'update:modelValue': [value: string]
}>()

function handleInput(value: string | number | undefined) {
  emit('update:modelValue', String(value ?? ''))
}
</script>

<template>
  <div class="kanji-filter-character">
    <BaseInput
      label="Character"
      :model-value="modelValue"
      name="character"
      placeholder="漢"
      @update:model-value="handleInput"
    />
  </div>
</template>

<style scoped>
.kanji-filter-character {
  min-width: 100px;
}
</style>
