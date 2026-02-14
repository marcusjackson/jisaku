<script setup lang="ts">
/**
 * KanjiSectionNotesGroup
 *
 * Groups Etymology, Education & Mnemonics, and Personal notes sections.
 * These three sections are positioned together after Semantic Analysis and
 * Stroke Order sections.
 *
 * Currently this component is an anti-pattern as it is a Section component that
 * has child Section components. This should not be repeated elsewhere and may
 * be refactored in the future.
 */

import KanjiSectionEducationNotes from './KanjiSectionEducationNotes.vue'
import KanjiSectionEtymologyNotes from './KanjiSectionEtymologyNotes.vue'
import KanjiSectionPersonalNotes from './KanjiSectionPersonalNotes.vue'

defineProps<{
  /** Etymology notes content */
  notesEtymology: string | null
  /** Education & mnemonics notes content */
  notesEducation: string | null
  /** Personal notes content */
  notesPersonal: string | null
}>()

const emit = defineEmits<{
  /** Emitted when etymology notes are saved */
  'save:etymology': [value: string | null]
  /** Emitted when education notes are saved */
  'save:education': [value: string | null]
  /** Emitted when personal notes are saved */
  'save:personal': [value: string | null]
}>()

function handleEtymologySave(value: string | null): void {
  emit('save:etymology', value)
}

function handleEducationSave(value: string | null): void {
  emit('save:education', value)
}

function handlePersonalSave(value: string | null): void {
  emit('save:personal', value)
}
</script>

<template>
  <div class="notes-group">
    <KanjiSectionEtymologyNotes
      :notes="notesEtymology"
      @save="handleEtymologySave"
    />
    <KanjiSectionEducationNotes
      :notes="notesEducation"
      @save="handleEducationSave"
    />
    <KanjiSectionPersonalNotes
      :notes="notesPersonal"
      @save="handlePersonalSave"
    />
  </div>
</template>

<style scoped>
.notes-group {
  display: contents;
}
</style>
