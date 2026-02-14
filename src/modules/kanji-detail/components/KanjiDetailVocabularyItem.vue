<script setup lang="ts">
/**
 * KanjiDetailVocabularyItem
 *
 * Displays a single vocabulary entry for kanji detail view.
 * Shows word, kana, and shortMeaning with a link to vocabulary detail page.
 * In edit mode with destructive mode enabled, shows remove button.
 */

import { RouterLink } from 'vue-router'

import { BaseButton } from '@/base/components'

import type { VocabularyListItem } from '../kanji-detail-types'

const props = defineProps<{
  vocabulary: VocabularyListItem
  /** Whether in edit mode with destructive actions enabled */
  destructiveMode?: boolean
  /** Whether to show as editable list item instead of link */
  editMode?: boolean
}>()

const emit = defineEmits<{
  remove: []
}>()
</script>

<template>
  <li
    v-if="props.editMode"
    class="vocabulary-item vocabulary-item-edit"
  >
    <div class="vocabulary-item-content">
      <span class="vocabulary-word">{{ vocabulary.word }}</span>
      <span
        v-if="vocabulary.kana"
        class="vocabulary-kana"
      >
        ({{ vocabulary.kana }})
      </span>
      <span
        v-if="vocabulary.shortMeaning"
        class="vocabulary-meaning"
      >
        - {{ vocabulary.shortMeaning }}
      </span>
    </div>
    <BaseButton
      v-if="props.destructiveMode"
      aria-label="Remove vocabulary link"
      data-testid="vocabulary-remove-button"
      size="sm"
      variant="ghost"
      @click="emit('remove')"
    >
      ×
    </BaseButton>
  </li>

  <li
    v-else
    class="vocabulary-item"
  >
    <RouterLink
      class="vocabulary-link"
      :data-testid="`vocabulary-item-${vocabulary.vocabularyId}`"
      :to="`/vocabulary/${vocabulary.vocabularyId}`"
    >
      <span class="vocabulary-word">{{ vocabulary.word }}</span>
      <span
        v-if="vocabulary.kana"
        class="vocabulary-kana"
      >
        ({{ vocabulary.kana }})
      </span>
      <span
        v-if="vocabulary.shortMeaning"
        class="vocabulary-meaning"
      >
        - {{ vocabulary.shortMeaning }}
      </span>
    </RouterLink>
  </li>
</template>

<style scoped>
.vocabulary-item {
  list-style: none;
}

.vocabulary-item-edit {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-sm);
  background: var(--color-surface);
}

.vocabulary-item-content {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.vocabulary-link {
  display: block;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-sm);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color 0.2s;
}

.vocabulary-link:hover {
  background-color: var(--color-bg-hover);
  text-decoration: none;
}

.vocabulary-link:focus-visible {
  outline: var(--border-width-md) solid var(--color-border-focus);
  outline-offset: var(--spacing-2xs);
}

.vocabulary-word {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.vocabulary-kana {
  color: var(--color-text-secondary);
}

.vocabulary-meaning {
  color: var(--color-text-secondary);
}
</style>
