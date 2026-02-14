<script setup lang="ts">
/**
 * ComponentListFilterKangxi
 *
 * Text input filter for kangxi number or meaning search.
 * Single input that handles both numeric (kangxi number) and text (meaning) search.
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
  <div class="component-list-filter-kangxi">
    <BaseInput
      label="Kangxi #/Meaning"
      :model-value="modelValue"
      placeholder="1 or water..."
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.component-list-filter-kangxi {
  flex: 1;
  min-width: 130px;
  max-width: 200px;
}
</style>
