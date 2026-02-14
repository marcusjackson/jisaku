<script setup lang="ts">
/**
 * KanjiDetailNotesEducation
 *
 * Collapsible section for education & mnemonics notes with inline editing.
 * Shows Japanese education methods and native mnemonics.
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
    placeholder="Add education & mnemonics notes... (teaching methods, memory aids)"
    @update:model-value="handleUpdate"
  />
</template>
