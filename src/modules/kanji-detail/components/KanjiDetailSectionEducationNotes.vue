<script setup lang="ts">
/**
 * KanjiDetailSectionEducationNotes
 *
 * Section component for education and mnemonics notes.
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
    placeholder="Document mnemonics, learning tips, and educational notes..."
    test-id="kanji-detail-education-notes"
    title="Education & Mnemonics"
    @save="$emit('save', $event)"
  />
</template>
