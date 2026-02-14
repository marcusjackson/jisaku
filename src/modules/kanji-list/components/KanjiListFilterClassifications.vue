<script setup lang="ts">
/**
 * KanjiListFilterClassifications
 *
 * Multi-select combobox for filtering by classification types (AND logic).
 * Allows selecting multiple classifications - kanji must have ALL selected.
 */

import { computed } from 'vue'

import { BaseComboboxMulti } from '@/base/components'

import type { ClassificationType } from '@/api/classification'

const props = defineProps<{
  modelValue: number[]
  classificationTypes: ClassificationType[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const options = computed(() =>
  props.classificationTypes.map((c) => ({
    value: c.id,
    label: c.nameJapanese ?? c.typeName
  }))
)

function handleUpdate(values: (string | number)[]): void {
  emit('update:modelValue', values.map(Number))
}
</script>

<template>
  <div class="kanji-list-filter-classifications">
    <BaseComboboxMulti
      label="Classification"
      :model-value="modelValue"
      :options="options"
      placeholder="Search classifications..."
      @update:model-value="handleUpdate"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-classifications {
  min-width: 160px;
  max-width: 240px;
}
</style>
