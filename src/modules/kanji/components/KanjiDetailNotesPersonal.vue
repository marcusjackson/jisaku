<script setup lang="ts">
/**
 * KanjiDetailNotesPersonal
 *
 * Collapsible section for personal notes with inline editing.
 * Shows user's own observations and research.
 */

import BaseInlineTextarea from '@/base/components/BaseInlineTextarea.vue'

const props = defineProps<{
  notes: string | null
}>()

const emit = defineEmits<{
  update: [value: string | null]
}>()

function handleUpdate(value: string) {
  emit('update', value || null)
}
</script>

<template>
  <BaseInlineTextarea
    :model-value="props.notes ?? ''"
    placeholder="Add personal notes... (your observations, research, learning tips)"
    @update:model-value="handleUpdate"
  />
</template>
