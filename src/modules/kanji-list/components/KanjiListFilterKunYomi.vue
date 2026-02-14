<script setup lang="ts">
/**
 * KanjiListFilterKunYomi
 *
 * Text input filter for kun-yomi reading search.
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
  <div class="kanji-list-filter-kun-yomi">
    <BaseInput
      label="Kun-yomi"
      :model-value="modelValue"
      placeholder="よ.む..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-kun-yomi {
  width: 120px;
  min-width: 100px;
}
</style>
