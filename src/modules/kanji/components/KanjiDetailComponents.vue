<script setup lang="ts">
/**
 * KanjiDetailComponents
 *
 * UI component displaying linked components for a kanji.
 * Each component is clickable and links to its detail page.
 */

import { RouterLink } from 'vue-router'

import type { Component } from '@/shared/types/database-types'

const props = defineProps<{
  components: Component[]
}>()
</script>

<template>
  <section
    v-if="props.components.length > 0"
    class="kanji-detail-components"
  >
    <h2 class="kanji-detail-components-title">Components</h2>
    <ul class="kanji-detail-components-list">
      <li
        v-for="component in props.components"
        :key="component.id"
        class="kanji-detail-components-item"
      >
        <RouterLink
          class="kanji-detail-components-link"
          :to="`/components/${component.id}`"
        >
          <span class="kanji-detail-components-character">{{
            component.character
          }}</span>
          <span
            v-if="component.descriptionShort"
            class="kanji-detail-components-description"
          >
            {{ component.descriptionShort }}
          </span>
        </RouterLink>
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

.kanji-detail-components-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.kanji-detail-components-item {
  flex-shrink: 0;
}

.kanji-detail-components-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background-color: var(--color-surface-raised);
  color: var(--color-text-primary);
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast);
}

.kanji-detail-components-link:hover {
  border-color: var(--color-primary);
  background-color: var(--color-primary-subtle);
}

.kanji-detail-components-character {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
}

.kanji-detail-components-description {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}
</style>
