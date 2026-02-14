<script setup lang="ts">
/**
 * SharedHeader
 *
 * App header with navigation links.
 * Used across all pages for consistent navigation.
 * Includes version toggle for testing new UI during refactoring.
 */

import { RouterLink } from 'vue-router'

import { ROUTES } from '@/router/routes'

import SharedHeaderNav from './SharedHeaderNav.vue'
</script>

<template>
  <header class="shared-header">
    <div class="shared-header-content">
      <RouterLink
        class="shared-header-logo"
        :to="ROUTES.KANJI_LIST"
      >
        自作
      </RouterLink>

      <SharedHeaderNav />
    </div>
  </header>
</template>

<style scoped>
.shared-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  min-height: var(--header-height);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-surface);
}

.shared-header-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-xs);
  max-width: var(--container-xl);
  min-height: var(--header-height);
  margin: 0 auto;
  padding: var(--spacing-xs) var(--spacing-sm);
}

.shared-header-logo {
  flex-shrink: 0;
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
  white-space: nowrap;
}

.shared-header-logo:hover {
  color: var(--color-primary);
}

/* Tablet and larger */
@media (width >= 768px) {
  .shared-header-content {
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-md);
  }

  .shared-header-logo {
    font-size: var(--font-size-lg);
  }
}
</style>
