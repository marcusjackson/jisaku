<script setup lang="ts">
/**
 * VocabListFilterCommon
 *
 * Checkbox filter for common words only.
 */

import { BaseSwitch } from '@/base/components'

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <div class="vocab-list-filter-common">
    <BaseSwitch
      label="Common only"
      :model-value="modelValue"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped>
.vocab-list-filter-common {
  display: flex;
  align-items: center;
  padding-top: var(--spacing-lg);
}
</style>
