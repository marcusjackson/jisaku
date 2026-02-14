<script setup lang="ts">
/**
 * KanjiDetailNotesEtymology
 *
 * Collapsible section for etymology notes with inline editing.
 * Shows historical origins and character development.
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
    placeholder="Add etymology notes... (historical origins, character development)"
    @update:model-value="handleUpdate"
  />
</template>
