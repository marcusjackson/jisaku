<script setup lang="ts">
/**
 * ComponentListCard
 *
 * UI component displaying a single component entry in the list.
 * Pure presentation — receives data via props.
 */

import { RouterLink } from 'vue-router'

import type { Component } from '@/shared/types/database-types'

defineProps<{
  component: Component
}>()
</script>

<template>
  <RouterLink
    class="component-list-card"
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

      <span class="component-list-card-strokes">
        {{ component.strokeCount }}画
      </span>
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
  max-width: 150px;
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.component-list-card-strokes {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
