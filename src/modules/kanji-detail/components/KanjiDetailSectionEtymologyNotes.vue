<script setup lang="ts">
/**
 * KanjiDetailSectionEtymologyNotes
 *
 * Section component for etymology notes.
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
    placeholder="Document etymology, historical development, and character origins..."
    test-id="kanji-detail-etymology-notes"
    title="Etymology Notes"
    @save="$emit('save', $event)"
  />
</template>
