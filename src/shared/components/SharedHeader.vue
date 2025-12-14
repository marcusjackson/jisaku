<script setup lang="ts">
/**
 * SharedHeader
 *
 * App header with navigation links.
 * Used across all pages for consistent navigation.
 */

import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="shared-header">
    <div class="shared-header-content">
      <RouterLink
        class="shared-header-logo"
        to="/"
      >
        自作字典
      </RouterLink>

      <nav
        aria-label="Main navigation"
        class="shared-header-nav"
      >
        <RouterLink
          class="shared-header-link"
          to="/kanji"
        >
          Kanji
        </RouterLink>
        <RouterLink
          class="shared-header-link"
          to="/components"
        >
          Components
        </RouterLink>
        <RouterLink
          class="shared-header-link"
          to="/settings"
        >
          Settings
        </RouterLink>
      </nav>
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
  gap: var(--spacing-sm);
  max-width: var(--container-xl);
  min-height: var(--header-height);
  margin: 0 auto;
  padding: var(--spacing-sm) var(--spacing-md);
}

.shared-header-logo {
  color: var(--color-text-primary);
  font-family: var(--font-family-kanji);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  text-decoration: none;
}

.shared-header-logo:hover {
  color: var(--color-primary);
}

.shared-header-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.shared-header-link {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.shared-header-link:hover {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

.shared-header-link.router-link-active {
  background-color: var(--color-background);
  color: var(--color-primary);
}

.shared-header-link:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

/* Tablet and larger */
@media (width >= 768px) {
  .shared-header-content {
    flex-wrap: nowrap;
    padding: 0 var(--spacing-md);
  }

  .shared-header-logo {
    font-size: var(--font-size-xl);
  }

  .shared-header-nav {
    flex-wrap: nowrap;
    gap: var(--spacing-md);
  }

  .shared-header-link {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-base);
  }
}
</style>
