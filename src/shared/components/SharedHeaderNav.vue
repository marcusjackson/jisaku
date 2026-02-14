<script setup lang="ts">
/**
 * SharedHeaderNav
 *
 * Navigation links for the header.
 * Extracted to keep SharedHeader under size limit.
 */

import { RouterLink } from 'vue-router'

import { ROUTES } from '@/router/routes'

import SharedHeaderSettingsIcon from './SharedHeaderSettingsIcon.vue'
import SharedSwitchNewUi from './SharedSwitchNewUi.vue'
</script>

<template>
  <nav
    aria-label="Main navigation"
    class="shared-header-nav"
  >
    <SharedSwitchNewUi />
    <RouterLink
      class="shared-header-link"
      :to="ROUTES.KANJI_LIST"
    >
      Kanji
    </RouterLink>
    <RouterLink
      class="shared-header-link"
      :to="ROUTES.COMPONENT_LIST"
    >
      Components
    </RouterLink>
    <RouterLink
      class="shared-header-link"
      :to="ROUTES.VOCABULARY_LIST"
    >
      Vocab
    </RouterLink>
    <RouterLink
      aria-label="Settings"
      class="shared-header-link shared-header-link--icon"
      title="Settings"
      :to="ROUTES.SETTINGS"
    >
      <SharedHeaderSettingsIcon />
    </RouterLink>
  </nav>
</template>

<style scoped>
.shared-header-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-xs);
}

.shared-header-link {
  flex-shrink: 0;
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

.shared-header-link--icon {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  padding: var(--spacing-1) var(--spacing-1);
}

/* Version toggle styling */
:deep(.shared-switch-new-ui) {
  margin-left: var(--spacing-xs);
}

:deep(.base-switch-wrapper) {
  gap: var(--spacing-1);
}

:deep(.base-switch-root) {
  width: 32px;
  height: 18px;
}

:deep(.base-switch-thumb) {
  width: 14px;
  height: 14px;
}

:deep(.base-switch-root[data-state='checked'] .base-switch-thumb) {
  transform: translateX(14px);
}

/* Tablet and larger */
@media (width >= 768px) {
  .shared-header-nav {
    gap: var(--spacing-md);
  }

  .shared-header-link {
    padding: var(--spacing-2) var(--spacing-3);
    font-size: var(--font-size-lg);
  }

  .shared-header-link--icon {
    width: auto;
    height: auto;
    padding: var(--spacing-2) var(--spacing-2);
  }

  /* Switch larger on tablet+ */
  :deep(.base-switch-root) {
    width: 44px;
    height: 24px;
  }

  :deep(.base-switch-thumb) {
    width: 20px;
    height: 20px;
  }

  :deep(.base-switch-root[data-state='checked'] .base-switch-thumb) {
    transform: translateX(20px);
  }
}
</style>
