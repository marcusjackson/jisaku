<script setup lang="ts">
/**
 * KanjiDetailHeader
 *
 * UI component displaying the main kanji character with stroke count and radical info.
 * Includes Edit button for opening header edit dialog.
 */

import BaseButton from '@/base/components/BaseButton.vue'

import SharedSearchKeywordsIndicator from '@/shared/components/SharedSearchKeywordsIndicator.vue'

import type { Component, Kanji } from '@/shared/types/database-types'

defineProps<{
  kanji: Kanji
  radical?: Component | null
}>()

const emit = defineEmits<{
  edit: []
}>()
</script>

<template>
  <header class="kanji-detail-header">
    <div class="kanji-detail-header-main">
      <span class="kanji-detail-header-character">{{ kanji.character }}</span>
      <div class="kanji-detail-header-info">
        <div class="kanji-detail-header-top">
          <span
            v-if="kanji.shortMeaning"
            class="kanji-detail-header-meaning"
          >
            {{ kanji.shortMeaning }}
          </span>
          <SharedSearchKeywordsIndicator
            :search-keywords="kanji.searchKeywords"
          />
        </div>
        <span
          v-if="radical"
          class="kanji-detail-header-radical"
        >
          <span class="kanji-detail-header-radical-label">Radical:</span>
          <span class="kanji-detail-header-radical-char">{{
            radical.character
          }}</span>
          <span
            v-if="radical.kangxiMeaning"
            class="kanji-detail-header-radical-meaning"
            >({{ radical.kangxiMeaning }})</span
          >
        </span>
      </div>
    </div>
    <div class="kanji-detail-header-actions">
      <BaseButton
        size="sm"
        variant="secondary"
        @click="emit('edit')"
      >
        Edit
      </BaseButton>
    </div>
  </header>
</template>

<style scoped>
.kanji-detail-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.kanji-detail-header-back {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.kanji-detail-header-back:hover {
  color: var(--color-primary);
}

.kanji-detail-header-main {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-md);
}

.kanji-detail-header-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.kanji-detail-header-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-6xl);
  font-weight: var(--font-weight-normal);
  line-height: var(--line-height-tight);
}

.kanji-detail-header-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.kanji-detail-header-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.kanji-detail-header-meaning {
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.kanji-detail-header-strokes {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.kanji-detail-header-radical {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.kanji-detail-header-radical-label {
  color: var(--color-text-muted);
}

.kanji-detail-header-radical-char {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-lg);
}

.kanji-detail-header-radical-meaning {
  color: var(--color-text-secondary);
}
</style>
