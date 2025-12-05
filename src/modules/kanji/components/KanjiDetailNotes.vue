<script setup lang="ts">
/**
 * KanjiDetailNotes
 *
 * UI component displaying the notes sections for a kanji.
 * Shows three categories: etymology, cultural context, and personal notes.
 */

import { computed } from 'vue'

const props = defineProps<{
  notesEtymology: string | null
  notesCultural: string | null
  notesPersonal: string | null
}>()

const hasAnyNotes = computed(
  () =>
    Boolean(props.notesEtymology) ||
    Boolean(props.notesCultural) ||
    Boolean(props.notesPersonal)
)
</script>

<template>
  <section class="kanji-detail-notes">
    <h2 class="kanji-detail-notes-title">Notes</h2>

    <div
      v-if="hasAnyNotes"
      class="kanji-detail-notes-categories"
    >
      <div
        v-if="notesEtymology"
        class="kanji-detail-notes-category"
      >
        <h3 class="kanji-detail-notes-category-title">Etymology</h3>
        <p class="kanji-detail-notes-content">
          {{ notesEtymology }}
        </p>
      </div>

      <div
        v-if="notesCultural"
        class="kanji-detail-notes-category"
      >
        <h3 class="kanji-detail-notes-category-title">Cultural Context</h3>
        <p class="kanji-detail-notes-content">
          {{ notesCultural }}
        </p>
      </div>

      <div
        v-if="notesPersonal"
        class="kanji-detail-notes-category"
      >
        <h3 class="kanji-detail-notes-category-title">Personal Notes</h3>
        <p class="kanji-detail-notes-content">
          {{ notesPersonal }}
        </p>
      </div>
    </div>

    <p
      v-else
      class="kanji-detail-notes-empty"
    >
      No notes added yet.
    </p>
  </section>
</template>

<style scoped>
.kanji-detail-notes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanji-detail-notes-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-notes-categories {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-notes-category {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-detail-notes-category-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.kanji-detail-notes-content {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
  white-space: pre-wrap;
}

.kanji-detail-notes-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-base);
  font-style: italic;
}
</style>
