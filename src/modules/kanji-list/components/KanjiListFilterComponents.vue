<script setup lang="ts">
/**
 * KanjiListFilterComponents
 *
 * Multi-select combobox for filtering by components (AND logic).
 * Allows selecting multiple components - kanji must have ALL selected.
 */

import { computed } from 'vue'

import { BaseComboboxMulti } from '@/base/components'

import type { Component } from '@/api/component'

const props = defineProps<{
  modelValue: number[]
  components: Component[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const options = computed(() =>
  props.components.map((c) => ({
    value: c.id,
    label: `${c.character} ${c.shortMeaning ?? ''}`
  }))
)

function handleUpdate(values: (string | number)[]): void {
  emit('update:modelValue', values.map(Number))
}
</script>

<template>
  <div class="kanji-list-filter-components">
    <BaseComboboxMulti
      label="Components"
      :model-value="modelValue"
      :options="options"
      placeholder="Search components..."
      @update:model-value="handleUpdate"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-components {
  min-width: 180px;
  max-width: 280px;
}
</style>
