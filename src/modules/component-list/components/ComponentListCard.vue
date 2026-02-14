<script setup lang="ts">
/**
 * ComponentListCard
 *
 * UI component displaying a single component entry in the list.
 * Shows: component character, short meaning, stroke count, and radical badge.
 */

import { RouterLink } from 'vue-router'

import type { Component } from '@/api/component'

defineProps<{
  component: Component
}>()
</script>

<template>
  <RouterLink
    class="component-list-card"
    data-testid="component-list-card"
    :to="`/components/${component.id}`"
  >
    <span class="component-list-card-character">{{ component.character }}</span>

    <div class="component-list-card-info">
      <span
        v-if="component.shortMeaning"
        class="component-list-card-meaning"
      >
        {{ component.shortMeaning }}
      </span>

      <div class="component-list-card-badges">
        <!-- Radical badge -->
        <span
          v-if="component.canBeRadical"
          aria-label="Can be radical"
          class="component-list-card-badge component-list-card-badge-radical"
          title="Can be radical"
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

        <!-- Stroke count badge -->
        <span
          v-if="component.strokeCount != null"
          class="component-list-card-badge component-list-card-badge-strokes"
        >
          {{ component.strokeCount }}画
        </span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.component-list-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-md);
  border: var(--card-border);
  border-radius: var(--card-radius);
  background-color: var(--card-bg);
  text-decoration: none;
  box-shadow: var(--card-shadow);
  transition:
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}

.component-list-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.component-list-card:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.component-list-card-character {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--kanji-card-size);
  line-height: 1;
}

.component-list-card-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-1);
}

.component-list-card-meaning {
  max-width: 145px;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-list-card-badges {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-1);
}

.component-list-card-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.component-list-card-badge-radical {
  background-color: var(--color-primary-bg);
  color: var(--color-primary);
}

.component-list-card-badge-strokes {
  border: var(--border-width) solid var(--color-border);
  background-color: var(--color-surface-variant);
  color: var(--color-text-secondary);
}
</style>
