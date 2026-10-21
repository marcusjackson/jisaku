<script setup lang="ts">
/**
 * KanjiDetailSectionPersonalNotes
 *
 * Section component for personal notes.
 */

import KanjiDetailSectionNotes from './KanjiDetailSectionNotes.vue'

defineProps<{
  /** Current notes content */
  notes: string | null
}>()

defineEmits<{
  /** Emitted when notes are saved */
  save: [value: string | null]
}>()
</script>

<template>
  <KanjiDetailSectionNotes
    :notes="notes"
    placeholder="Add personal observations, insights, and notes..."
    test-id="kanji-detail-personal-notes"
    title="Personal Notes"
    @save="$emit('save', $event)"
  />
</template>
