<script setup lang="ts">
/**
 * KanjiDetailSectionSemanticNotes
 *
 * Section component for semantic analysis notes.
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
    placeholder="Document semantic analysis, meaning derivation, and related concepts..."
    test-id="kanji-detail-semantic-notes"
    title="Semantic Analysis"
    @save="$emit('save', $event)"
  />
</template>
