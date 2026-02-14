<script setup lang="ts">
/**
 * KanjiDetailNotesSemantic
 *
 * Collapsible section for semantic analysis notes with inline editing.
 * Shows modern usage patterns and compound meanings.
 */

import BaseInlineTextarea from '@/legacy/base/components/BaseInlineTextarea.vue'

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
    placeholder="Add semantic analysis... (modern usage, compound meanings)"
    @update:model-value="handleUpdate"
  />
</template>
