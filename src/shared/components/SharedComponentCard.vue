<script setup lang="ts">
/**
 * SharedComponentCard
 *
 * Shared component for displaying components in cross-module contexts.
 * Used when showing components on kanji pages, etc.
 */

import BaseButton from '@/base/components/BaseButton.vue'

import type { Component } from '../types/database-types'

defineProps<{
  component: Component
  /** Show remove button */
  showRemove?: boolean
  /** Show view button */
  showView?: boolean
  /** Additional info to display (e.g., position type, "Radical") */
  badge?: string
  /** Show radical indicator badge */
  isRadical?: boolean
  /** Small note text to display */
  note?: string
}>()

defineEmits<{
  view: []
  remove: []
}>()
</script>

<template>
  <div class="shared-component-card">
    <div class="shared-component-card-main">
      <span class="shared-component-card-character">{{
        component.character
      }}</span>
      <div class="shared-component-card-info">
        <span
          v-if="component.shortMeaning"
          class="shared-component-card-meaning"
        >
          {{ component.shortMeaning }}
        </span>
        <span class="shared-component-card-strokes">
          {{ component.strokeCount }} strokes
        </span>
        <div
          v-if="badge || isRadical"
          class="shared-component-card-badges"
        >
          <span
            v-if="badge"
            class="shared-component-card-badge"
          >
            {{ badge }}
          </span>
          <span
            v-if="isRadical"
            class="shared-component-card-badge shared-component-card-badge-radical"
          >
            🔶 Radical
          </span>
        </div>
        <p
          v-if="note"
          class="shared-component-card-note"
        >
          {{ note }}
        </p>
      </div>
    </div>

    <div
      v-if="showView || showRemove"
      class="shared-component-card-actions"
    >
      <BaseButton
        v-if="showView"
        size="sm"
        variant="secondary"
        @click="$emit('view')"
      >
        View
      </BaseButton>
      <BaseButton
        v-if="showRemove"
        size="sm"
        variant="danger"
        @click="$emit('remove')"
      >
        Remove
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.shared-component-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  border: var(--card-border);
  border-radius: var(--card-radius);
  background-color: var(--card-bg);
}

.shared-component-card-main {
  display: flex;
  flex: 1;
  align-items: center;
  gap: var(--spacing-md);
  min-width: 0;
}

.shared-component-card-character {
  flex-shrink: 0;
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-3xl);
  line-height: 1;
}

.shared-component-card-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--spacing-1);
  min-width: 0;
}

.shared-component-card-meaning {
  overflow: hidden;
  color: var(--color-text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-component-card-strokes {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.shared-component-card-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
}

.shared-component-card-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-sm);
  background-color: var(--color-background);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.shared-component-card-badge-radical {
  background-color: var(--color-warning-bg);
  color: var(--color-warning);
}

.shared-component-card-note {
  margin: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.shared-component-card-actions {
  display: flex;
  flex-shrink: 0;
  gap: var(--spacing-2);
}
</style>
