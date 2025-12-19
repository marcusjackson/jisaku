<script setup lang="ts">
/**
 * VocabularyKanjiBreakdownCard
 *
 * Individual kanji card in the vocabulary breakdown with:
 * - Kanji character and meaning display
 * - Arrow buttons for reordering (↑↓)
 * - Analysis notes textarea with explicit save button
 * - Delete button (visible only in destructive mode)
 */

import { ref, watch } from 'vue'
import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'
import BaseTextarea from '@/base/components/BaseTextarea.vue'

import type { VocabKanjiWithKanji } from '@/shared/types/database-types'

const props = defineProps<{
  vocabKanji: VocabKanjiWithKanji
  canMoveUp: boolean
  canMoveDown: boolean
  isDestructiveMode: boolean
}>()

const emit = defineEmits<{
  moveUp: []
  moveDown: []
  remove: []
  saveNotes: [notes: string | null]
}>()

// Local notes state for editing
const localNotes = ref(props.vocabKanji.analysisNotes ?? '')
const isDirty = ref(false)

// Reset local state when prop changes
watch(
  () => props.vocabKanji.analysisNotes,
  (newNotes) => {
    localNotes.value = newNotes ?? ''
    isDirty.value = false
  }
)

// Handle notes input
function handleNotesInput(value: string | undefined) {
  localNotes.value = value ?? ''
  isDirty.value = localNotes.value !== (props.vocabKanji.analysisNotes ?? '')
}

// Handle save notes
function handleSaveNotes() {
  emit('saveNotes', localNotes.value.trim() || null)
  isDirty.value = false
}
</script>

<template>
  <div class="vocabulary-kanji-breakdown-card">
    <!-- Kanji header with character, meaning, and link -->
    <div class="vocabulary-kanji-breakdown-card-header">
      <RouterLink
        class="vocabulary-kanji-breakdown-card-character"
        :to="{
          name: 'kanji-detail',
          params: { id: props.vocabKanji.kanji.id }
        }"
      >
        {{ props.vocabKanji.kanji.character }}
      </RouterLink>
      <span
        v-if="props.vocabKanji.kanji.shortMeaning"
        class="vocabulary-kanji-breakdown-card-meaning"
      >
        {{ props.vocabKanji.kanji.shortMeaning }}
      </span>
    </div>

    <!-- Reorder buttons -->
    <div class="vocabulary-kanji-breakdown-card-reorder">
      <BaseButton
        :disabled="!props.canMoveUp"
        size="sm"
        title="Move up"
        variant="ghost"
        @click="emit('moveUp')"
      >
        ↑
      </BaseButton>
      <BaseButton
        :disabled="!props.canMoveDown"
        size="sm"
        title="Move down"
        variant="ghost"
        @click="emit('moveDown')"
      >
        ↓
      </BaseButton>
    </div>

    <!-- Delete button (destructive mode only) -->
    <BaseButton
      v-if="props.isDestructiveMode"
      class="vocabulary-kanji-breakdown-card-delete"
      size="sm"
      title="Remove kanji"
      variant="ghost"
      @click="emit('remove')"
    >
      ×
    </BaseButton>

    <!-- Analysis notes with save button -->
    <div class="vocabulary-kanji-breakdown-card-notes">
      <BaseTextarea
        label="Analysis Notes"
        :model-value="localNotes"
        placeholder="Notes about this kanji's role in the word..."
        :rows="2"
        @update:model-value="handleNotesInput"
      />
      <BaseButton
        :disabled="!isDirty"
        size="sm"
        @click="handleSaveNotes"
      >
        Save Notes
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.vocabulary-kanji-breakdown-card {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: var(--spacing-sm) var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
}

.vocabulary-kanji-breakdown-card-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.vocabulary-kanji-breakdown-card-character {
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  transition: color 0.15s;
}

.vocabulary-kanji-breakdown-card-character:hover {
  color: var(--color-primary);
}

.vocabulary-kanji-breakdown-card-meaning {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.vocabulary-kanji-breakdown-card-reorder {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.vocabulary-kanji-breakdown-card-delete {
  color: var(--color-error);
}

.vocabulary-kanji-breakdown-card-notes {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-sm);
  grid-column: 1 / -1;
}

.vocabulary-kanji-breakdown-card-notes :deep(.base-textarea) {
  width: 100%;
}
</style>
