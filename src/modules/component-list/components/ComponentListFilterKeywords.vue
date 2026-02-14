<script setup lang="ts">
/**
 * ComponentListFilterKeywords
 *
 * Text input filter for short display and keywords search.
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
  <div class="component-list-filter-keywords">
    <BaseInput
      label="Display + Keywords"
      :model-value="modelValue"
      placeholder="person, human..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.component-list-filter-keywords {
  flex: 1;
  min-width: 150px;
  max-width: 280px;
}
</style>
