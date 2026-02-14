<script setup lang="ts">
/**
 * KanjiListFilterRadical
 *
 * Dropdown select for filtering by radical.
 */

import { computed } from 'vue'

import { BaseSelect } from '@/base/components'

import type { Component } from '@/api/component'

const props = defineProps<{
  modelValue: number | null
  radicals: Component[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number | null]
}>()

const NONE_VALUE = '__none__'

const options = computed(() => [
  { value: NONE_VALUE, label: '部首を選択...' },
  ...props.radicals.map((r) => ({
    value: String(r.id),
    label: `${r.character} ${r.shortMeaning ?? ''}`
  }))
])

function handleChange(value: string | null | undefined): void {
  if (!value || value === NONE_VALUE) {
    emit('update:modelValue', null)
    return
  }
  const id = parseInt(value, 10)
  emit('update:modelValue', isNaN(id) ? null : id)
}
</script>

<template>
  <div class="kanji-list-filter-radical">
    <BaseSelect
      label="Radical"
      :model-value="modelValue?.toString() ?? NONE_VALUE"
      :options="options"
      @update:model-value="handleChange"
    />
  </div>
</template>

<style scoped>
.kanji-list-filter-radical {
  min-width: 140px;
}
</style>
