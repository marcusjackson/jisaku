<script setup lang="ts">
/**
 * KanjiListSectionGrid
 *
 * Section component that handles the layout and arrangement of kanji cards.
 * Displays the grid of kanji, empty state, and "Add Kanji" action button.
 */

import { RouterLink } from 'vue-router'

import BaseButton from '@/base/components/BaseButton.vue'

import SharedPageContainer from '@/shared/components/SharedPageContainer.vue'

import KanjiListCard from './KanjiListCard.vue'

import type { Kanji } from '@/shared/types/database-types'

defineProps<{
  kanjiList: Kanji[]
  /** Whether any filters are currently active */
  hasActiveFilters?: boolean
}>()
</script>

<template>
  <SharedPageContainer>
    <div class="kanji-list-section-grid">
      <header class="kanji-list-section-grid-header">
        <h1 class="kanji-list-section-grid-title">Kanji List</h1>
        <RouterLink
          v-slot="{ navigate }"
          custom
          to="/kanji/new"
        >
          <BaseButton @click="navigate">Add Kanji</BaseButton>
        </RouterLink>
      </header>

      <!-- Empty state: no results from filter -->
      <div
        v-if="kanjiList.length === 0 && hasActiveFilters"
        class="kanji-list-section-grid-empty"
      >
        <p class="kanji-list-section-grid-empty-text">
          No kanji match your filters.
        </p>
      </div>

      <!-- Empty state: no kanji at all -->
      <div
        v-else-if="kanjiList.length === 0"
        class="kanji-list-section-grid-empty"
      >
        <p class="kanji-list-section-grid-empty-text">
          No kanji yet. Add your first one!
        </p>
        <RouterLink
          v-slot="{ navigate }"
          custom
          to="/kanji/new"
        >
          <BaseButton
            size="lg"
            @click="navigate"
          >
            Add Your First Kanji
          </BaseButton>
        </RouterLink>
      </div>

      <!-- Kanji grid -->
      <div
        v-else
        class="kanji-list-section-grid-grid"
      >
        <KanjiListCard
          v-for="kanji in kanjiList"
          :key="kanji.id"
          :kanji="kanji"
        />
      </div>
    </div>
  </SharedPageContainer>
</template>

<style scoped>
.kanji-list-section-grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.kanji-list-section-grid-title {
  margin: 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.kanji-list-section-grid-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-2xl) var(--spacing-md);
  text-align: center;
}

.kanji-list-section-grid-empty-text {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-lg);
}

.kanji-list-section-grid-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--spacing-md);
}

@media (width >= 768px) {
  .kanji-list-section-grid-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}
</style>
