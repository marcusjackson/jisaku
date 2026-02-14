<script setup lang="ts">
/**
 * ComponentDetailSectionDescription
 *
 * Section wrapper for the component description field.
 * Uses SharedSection with collapsible behavior.
 */

import { computed } from 'vue'

import { SharedSection } from '@/shared/components'

import ComponentDetailDescriptionTextarea from './ComponentDetailDescriptionTextarea.vue'

const props = defineProps<{
  /** Current description value */
  description: string | null
}>()

const emit = defineEmits<{
  /** Emitted when description is saved */
  save: [value: string | null]
}>()

// Default to open when description has content
const defaultOpen = computed(() => Boolean(props.description))

function handleSave(value: string | null): void {
  emit('save', value)
}
</script>

<template>
  <SharedSection
    collapsible
    :default-open="defaultOpen"
    test-id="component-detail-description"
    title="Description"
  >
    <ComponentDetailDescriptionTextarea
      :model-value="description"
      placeholder="Click to add a description..."
      @save="handleSave"
    />
  </SharedSection>
</template>
