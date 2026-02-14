<script setup lang="ts">
/**
 * ComponentListFilterCharacter
 *
 * Text input filter for component character search.
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
  <div class="component-list-filter-character">
    <BaseInput
      label="Character"
      :model-value="modelValue"
      placeholder="亻"
      @update:model-value="emit('update:modelValue', String($event ?? ''))"
    />
  </div>
</template>

<style scoped>
.component-list-filter-character {
  width: 80px;
  min-width: 80px;
}
</style>
