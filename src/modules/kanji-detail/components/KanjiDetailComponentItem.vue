<script setup lang="ts">
/**
 * KanjiDetailComponentItem
 *
 * Displays an individual component occurrence card with character, meaning,
 * position badge, radical indicator, and navigation link.
 */

import { RouterLink } from 'vue-router'

import SharedPositionBadge from '@/shared/components/SharedPositionBadge.vue'

import type { ComponentOccurrenceWithDetails } from '../kanji-detail-types'

defineProps<{
  /** Component occurrence with populated component data */
  occurrence: ComponentOccurrenceWithDetails
}>()
</script>

<template>
  <RouterLink
    class="kanji-detail-component-item"
    :to="`/components/${occurrence.componentId}`"
  >
    <div class="kanji-detail-component-item-content">
      <div class="kanji-detail-component-item-character">
        {{ occurrence.component.character }}
      </div>
      <div
        v-if="occurrence.component.shortMeaning"
        class="kanji-detail-component-item-meaning"
      >
        {{ occurrence.component.shortMeaning }}
      </div>
    </div>

    <div class="kanji-detail-component-item-badges">
      <SharedPositionBadge
        v-if="occurrence.position"
        :position="occurrence.position"
      />
      <span
        v-if="occurrence.isRadical"
        aria-label="Radical"
        class="kanji-detail-component-item-radical-badge"
        title="This component is the radical of the kanji"
      >
        <svg
          fill="none"
          height="12"
          viewBox="0 0 16 16"
          width="12"
        >
          <path
            d="M8 1L10 6H15L11 9.5L12.5 15L8 11.5L3.5 15L5 9.5L1 6H6L8 1Z"
            fill="currentColor"
          />
        </svg>
        部首
      </span>
    </div>
  </RouterLink>
</template>

<style scoped>
.kanji-detail-component-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-md);
  border: var(--card-border);
  border-radius: var(--card-radius);
  background-color: var(--card-bg);
  color: inherit;
  text-decoration: none;
  box-shadow: var(--card-shadow);
  transition:
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.kanji-detail-component-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.kanji-detail-component-item:focus-within {
  box-shadow: var(--focus-ring);
  outline: none;
}

.kanji-detail-component-item-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  min-height: 44px;
}

.kanji-detail-component-item-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--kanji-card-size);
  line-height: 1;
}

.kanji-detail-component-item-meaning {
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kanji-detail-component-item-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
}

.kanji-detail-component-item-radical-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2xs);
  padding: var(--spacing-2xs) var(--spacing-xs);
  border-radius: var(--radius-sm);
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  line-height: 1;
  cursor: help;
}

.kanji-detail-component-item-radical-badge svg {
  flex-shrink: 0;
}
</style>
