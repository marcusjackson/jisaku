<script setup lang="ts">
/**
 * KanjiFilterRadical
 *
 * UI component for filtering kanji by radical (Kangxi radical).
 * Renders a dropdown select with all available radicals.
 * Radicals are now components with canBeRadical=true.
 */

import { computed } from 'vue'

import BaseSelect from '@/legacy/base/components/BaseSelect.vue'

import type { Component } from '@/legacy/shared/types/database-types'

const props = defineProps<{
  /** Currently selected radical ID (null = no filter) */
  modelValue: number | null
  /** List of available radicals to filter by (components with canBeRadical=true) */
  radicals: Component[]
}>()

const emit = defineEmits<{
  /** Emitted when radical selection changes */
  'update:modelValue': [value: number | null]
}>()

const ALL_RADICALS_VALUE = '__all__'

const options = computed(() => {
  const radicalOptions = props.radicals.map((r) => ({
    label: `${r.character} (#${String(r.kangxiNumber ?? '?')}) - ${r.kangxiMeaning ?? 'Radical'}`,
    value: String(r.id)
  }))

  return [
    { label: 'All radicals', value: ALL_RADICALS_VALUE },
    ...radicalOptions
  ]
})

const selectedValue = computed({
  get() {
    return props.modelValue === null
      ? ALL_RADICALS_VALUE
      : String(props.modelValue)
  },
  set(value: string | null) {
    emit(
      'update:modelValue',
      value === ALL_RADICALS_VALUE || value === null ? null : Number(value)
    )
  }
})
</script>

<template>
  <div class="kanji-filter-radical">
    <BaseSelect
      v-model="selectedValue"
      label="Radical"
      :options="options"
      placeholder="All radicals"
    />
  </div>
</template>

<style scoped>
.kanji-filter-radical {
  min-width: 200px;
}
</style>
