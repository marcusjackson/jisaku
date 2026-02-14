<script setup lang="ts">
/**
 * KanjiListFilterCharacter
 *
 * Text input filter for kanji character search.
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
  <div class="kanji-list-filter-character">
    <BaseInput
      label="Character"
      :model-value="modelValue"
      placeholder="字"
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-character {
  width: 80px;
  min-width: 80px;
}
</style>
