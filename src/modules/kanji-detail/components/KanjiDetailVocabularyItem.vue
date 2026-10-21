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

import { buildRoute, ROUTES } from '@/router/routes'

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
  <li v-if="props.editMode" class="vocabulary-item vocabulary-item-edit">
    <div class="vocabulary-item-content">
      <span class="vocabulary-word" lang="ja">{{ vocabulary.word }}</span>
      <span v-if="vocabulary.kana" class="vocabulary-kana" lang="ja">
        ({{ vocabulary.kana }})
      </span>
      <span v-if="vocabulary.shortMeaning" class="vocabulary-meaning">
        - {{ vocabulary.shortMeaning }}
      </span>
    </div>
    <BaseButton
      v-if="props.destructiveMode"
      aria-label="Remove vocabulary link"
      size="sm"
      variant="ghost"
      @click="emit('remove')"
    >
      ×
    </BaseButton>
  </li>

  <li v-else class="vocabulary-item">
    <RouterLink
      class="vocabulary-link"
      :data-testid="`vocabulary-item-${vocabulary.vocabularyId}`"
      :to="buildRoute(ROUTES.VOCABULARY_DETAIL, { id: String(vocabulary.vocabularyId) })"
    >
      <span class="vocabulary-word" lang="ja">{{ vocabulary.word }}</span>
      <span v-if="vocabulary.kana" class="vocabulary-kana" lang="ja">
        ({{ vocabulary.kana }})
      </span>
      <span v-if="vocabulary.shortMeaning" class="vocabulary-meaning">
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
  border-radius: var(--radius-sm);
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
  border-radius: var(--radius-sm);
  color: var(--color-text-primary);
  text-decoration: none;
  transition: background-color var(--transition-normal);
}

.vocabulary-link:hover {
  background-color: var(--color-surface-hover);
  text-decoration: none;
}

.vocabulary-link:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.vocabulary-word {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-weight: var(--font-weight-medium);
}

.vocabulary-kana {
  color: var(--color-text-secondary);
  font-family: var(--font-family-kanji);
}

.vocabulary-meaning {
  color: var(--color-text-secondary);
}
</style>
