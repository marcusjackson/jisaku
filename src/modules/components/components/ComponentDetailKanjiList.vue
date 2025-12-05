<script setup lang="ts">
/**
 * ComponentDetailKanjiList
 *
 * UI component displaying kanji that use this component.
 * Read-only list for now (no links to filtered kanji list yet).
 */

import { RouterLink } from 'vue-router'

import type { Kanji } from '@/shared/types/database-types'

defineProps<{
  kanjiList: Kanji[]
}>()
</script>

<template>
  <section class="component-detail-kanji-list">
    <h3 class="component-detail-kanji-list-title">
      Kanji Using This Component
    </h3>

    <div
      v-if="kanjiList.length > 0"
      class="component-detail-kanji-list-grid"
    >
      <RouterLink
        v-for="kanji in kanjiList"
        :key="kanji.id"
        class="component-detail-kanji-list-item"
        :to="`/kanji/${kanji.id}`"
      >
        {{ kanji.character }}
      </RouterLink>
    </div>

    <p
      v-else
      class="component-detail-kanji-list-empty"
    >
      No kanji are currently linked to this component.
    </p>
  </section>
</template>

<style scoped>
.component-detail-kanji-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.component-detail-kanji-list-title {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.component-detail-kanji-list-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.component-detail-kanji-list-item {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-2xl);
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.component-detail-kanji-list-item:hover {
  border-color: var(--color-primary);
  background-color: var(--color-background);
}

.component-detail-kanji-list-item:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.component-detail-kanji-list-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-style: italic;
}
</style>
