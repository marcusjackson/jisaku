<script setup lang="ts">
/**
 * VocabListFilterKanji
 *
 * Multi-select combobox for filtering by kanji (AND logic).
 * Allows selecting multiple kanji - vocabulary must contain ALL selected.
 */

import { computed } from 'vue'

import { BaseComboboxMulti } from '@/base/components'

import type { Kanji } from '@/api/kanji'

const props = defineProps<{
  modelValue: number[]
  allKanji: Kanji[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const kanjiOptions = computed(() => {
  return props.allKanji.map((k) => ({
    value: k.id,
    label: `${k.character} - ${k.shortMeaning ?? '(no meaning)'}`
  }))
})

function handleUpdate(values: (string | number)[]): void {
  emit('update:modelValue', values.map(Number))
}
</script>

<template>
  <div class="vocab-list-filter-kanji">
    <BaseComboboxMulti
      label="Contains Kanji"
      :model-value="modelValue"
      :options="kanjiOptions"
      placeholder="Search kanji..."
      @update:model-value="handleUpdate"
    />
  </div>
</template>

<style scoped>
.vocab-list-filter-kanji {
  min-width: 180px;
  max-width: 280px;
}

@media (width <= 640px) {
  .vocab-list-filter-kanji {
    min-width: 100%;
    max-width: 100%;
  }
}
</style>
