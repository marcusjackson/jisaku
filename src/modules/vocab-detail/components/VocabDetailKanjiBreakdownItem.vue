<script setup lang="ts">
/**
 * VocabDetailKanjiBreakdownItem
 *
 * Displays a single kanji breakdown entry with character, meaning,
 * analysis notes, and action buttons (reorder, edit, delete).
 */

import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { BaseButton } from '@/base/components'

import type { VocabKanjiWithKanji } from '@/api/vocabulary'

const props = defineProps<{
  /** Vocab-kanji link with joined kanji data */
  vocabKanji: VocabKanjiWithKanji
  /** Position in list for reorder button state */
  index: number
  /** Total items count for reorder button state */
  total: number
  /** Show delete button */
  isDestructiveMode: boolean
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  'move-up': []
  'move-down': []
}>()

const canMoveUp = computed(() => props.index > 0)
const canMoveDown = computed(() => props.index < props.total - 1)

/** Build kanji detail route path */
const kanjiDetailRoute = computed(
  () => `/kanji/${String(props.vocabKanji.kanji.id)}`
)
</script>

<template>
  <div
    class="kanji-breakdown-item"
    :data-testid="`vocab-detail-kanji-item-${String(vocabKanji.id)}`"
  >
    <div class="kanji-breakdown-item-reorder">
      <BaseButton
        aria-label="Move up"
        data-testid="vocab-detail-kanji-item-move-up"
        :disabled="!canMoveUp"
        size="sm"
        variant="ghost"
        @click="emit('move-up')"
      >
        ↑
      </BaseButton>
      <BaseButton
        aria-label="Move down"
        data-testid="vocab-detail-kanji-item-move-down"
        :disabled="!canMoveDown"
        size="sm"
        variant="ghost"
        @click="emit('move-down')"
      >
        ↓
      </BaseButton>
    </div>

    <div class="kanji-breakdown-item-content">
      <div class="kanji-breakdown-item-header">
        <RouterLink
          class="kanji-breakdown-item-character"
          :to="kanjiDetailRoute"
        >
          {{ vocabKanji.kanji.character }}
        </RouterLink>

        <span
          v-if="vocabKanji.kanji.shortMeaning"
          class="kanji-breakdown-item-meaning"
        >
          {{ vocabKanji.kanji.shortMeaning }}
        </span>
      </div>

      <p
        v-if="vocabKanji.analysisNotes"
        class="kanji-breakdown-item-notes"
      >
        {{ vocabKanji.analysisNotes }}
      </p>
    </div>

    <div class="kanji-breakdown-item-actions">
      <BaseButton
        aria-label="Edit"
        data-testid="vocab-detail-kanji-item-edit"
        size="sm"
        variant="secondary"
        @click="emit('edit')"
      >
        Edit
      </BaseButton>
      <BaseButton
        v-if="isDestructiveMode"
        aria-label="Delete"
        data-testid="vocab-detail-kanji-item-delete"
        size="sm"
        variant="danger"
        @click="emit('delete')"
      >
        Delete
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.kanji-breakdown-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.kanji-breakdown-item-reorder {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-breakdown-item-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
}

.kanji-breakdown-item-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-sm);
}

.kanji-breakdown-item-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.kanji-breakdown-item-character:hover {
  color: var(--color-primary);
}

.kanji-breakdown-item-meaning {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.kanji-breakdown-item-notes {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
}

.kanji-breakdown-item-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}

@media (width <= 640px) {
  .kanji-breakdown-item {
    flex-direction: column;
  }

  .kanji-breakdown-item-reorder {
    flex-direction: row;
  }

  .kanji-breakdown-item-actions {
    justify-content: flex-end;
    width: 100%;
  }
}
</style>
