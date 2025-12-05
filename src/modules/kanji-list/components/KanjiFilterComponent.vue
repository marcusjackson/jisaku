<script setup lang="ts">
/**
 * KanjiFilterComponent
 *
 * UI component for filtering kanji by component.
 * Renders a dropdown select with all available components.
 */

import { computed } from 'vue'

import BaseSelect from '@/base/components/BaseSelect.vue'

import type { Component } from '@/shared/types/database-types'

const props = defineProps<{
  /** Currently selected component ID (null = no filter) */
  modelValue: number | null
  /** List of available components to filter by */
  components: Component[]
}>()

const emit = defineEmits<{
  /** Emitted when component selection changes */
  'update:modelValue': [value: number | null]
}>()

const ALL_COMPONENTS_VALUE = '__all__'

const options = computed(() => {
  const componentOptions = props.components.map((c) => ({
    value: String(c.id),
    label: `${c.character} - ${c.descriptionShort ?? 'Component'}`
  }))

  return [
    { value: ALL_COMPONENTS_VALUE, label: 'All components' },
    ...componentOptions
  ]
})

const selectedValue = computed({
  get() {
    return props.modelValue === null
      ? ALL_COMPONENTS_VALUE
      : String(props.modelValue)
  },
  set(value: string | null) {
    emit(
      'update:modelValue',
      value === ALL_COMPONENTS_VALUE || value === null ? null : Number(value)
    )
  }
})
</script>

<template>
  <div class="kanji-filter-component">
    <BaseSelect
      v-model="selectedValue"
      label="Component"
      :options="options"
      placeholder="All components"
    />
  </div>
</template>

<style scoped>
.kanji-filter-component {
  min-width: 200px;
}
</style>
