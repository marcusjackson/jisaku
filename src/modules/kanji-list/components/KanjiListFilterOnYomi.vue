<script setup lang="ts">
/**
 * KanjiListFilterOnYomi
 *
 * Text input filter for on-yomi reading search.
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
  <div class="kanji-list-filter-on-yomi">
    <BaseInput
      label="On-yomi"
      :model-value="modelValue"
      placeholder="カン..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-on-yomi {
  width: 120px;
  min-width: 100px;
}
</style>
