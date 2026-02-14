<script setup lang="ts">
/**
 * ComponentDetailDescription
 *
 * UI component displaying and editing component description.
 * Uses BaseInlineTextarea for inline editing.
 */

import BaseInlineTextarea from '@/legacy/base/components/BaseInlineTextarea.vue'

defineProps<{
  description: string | null
}>()

const emit = defineEmits<{
  update: [description: string | null]
}>()

function handleUpdate(value: string) {
  emit('update', value || null)
}
</script>

<template>
  <div class="component-detail-description">
    <BaseInlineTextarea
      :model-value="description || ''"
      placeholder="Add a description of this component's semantic meaning..."
      @update:model-value="handleUpdate"
    />
  </div>
</template>

<style scoped>
.component-detail-description {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
</style>
