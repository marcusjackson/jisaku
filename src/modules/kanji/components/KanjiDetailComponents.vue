<script setup lang="ts">
/**
 * KanjiDetailComponents
 *
 * UI component displaying linked components for a kanji.
 * Shows basic info: character, short_meaning, position badge, radical indicator.
 * Users can navigate to component page for detailed occurrence editing.
 */

import { RouterLink } from 'vue-router'

import SharedPositionBadge from '@/shared/components/SharedPositionBadge.vue'

import type { OccurrenceWithComponent } from '@/shared/types/database-types'

defineProps<{
  occurrences: OccurrenceWithComponent[]
}>()
</script>

<template>
  <section
    v-if="occurrences.length > 0"
    class="kanji-detail-components"
  >
    <h2 class="kanji-detail-components-title">Components</h2>
    <p class="kanji-detail-components-hint">
      Click → to view component page for occurrence details
    </p>
    <ul class="kanji-detail-components-list">
      <li
        v-for="occurrence in occurrences"
        :key="occurrence.id"
        class="kanji-detail-components-item"
      >
        <div class="kanji-detail-components-content">
          <div class="kanji-detail-components-info">
            <span class="kanji-detail-components-character">
              {{ occurrence.component.character }}
            </span>
            <div class="kanji-detail-components-details">
              <span
                v-if="occurrence.component.shortMeaning"
                class="kanji-detail-components-meaning"
              >
                {{ occurrence.component.shortMeaning }}
              </span>
              <div
                v-if="occurrence.position || occurrence.isRadical"
                class="kanji-detail-components-metadata"
              >
                <SharedPositionBadge
                  v-if="occurrence.position"
                  :position="occurrence.position"
                />
                <span
                  v-if="occurrence.isRadical"
                  class="kanji-detail-components-radical-badge"
                  title="This is the radical for this kanji"
                >
                  🔶 Radical
                </span>
              </div>
            </div>
          </div>
          <div class="kanji-detail-components-actions">
            <RouterLink
              class="kanji-detail-components-view-link"
              title="View component page"
              :to="`/components/${occurrence.component.id}`"
            >
              →
            </RouterLink>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.kanji-detail-components {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.kanji-detail-components-title {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.kanji-detail-components-hint {
  margin: 0;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-style: italic;
}

.kanji-detail-components-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.kanji-detail-components-item {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
}

.kanji-detail-components-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
}

.kanji-detail-components-info {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-sm);
}

.kanji-detail-components-character {
  flex-shrink: 0;
  padding: var(--spacing-xs);
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-components-details {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-xs);
  min-width: 0;
}

.kanji-detail-components-meaning {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.kanji-detail-components-metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.kanji-detail-components-radical-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary-subtle);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  cursor: help;
}

.kanji-detail-components-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-xs);
}

.kanji-detail-components-view-link {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background-color: var(--color-surface-raised);
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.kanji-detail-components-view-link:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-subtle);
}

.kanji-detail-components-view-link:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}
</style>
