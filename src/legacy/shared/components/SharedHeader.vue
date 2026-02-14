<script setup lang="ts">
/**
 * SharedHeader
 *
 * App header with navigation links.
 * Used across all pages for consistent navigation.
 * Includes version toggle for testing new UI during refactoring.
 */

import { RouterLink } from 'vue-router'

import SharedSwitchNewUi from './SharedSwitchNewUi.vue'
</script>

<template>
  <header class="shared-header">
    <div class="shared-header-content">
      <RouterLink
        class="shared-header-logo"
        to="/legacy"
      >
        自作
      </RouterLink>

      <nav
        aria-label="Main navigation"
        class="shared-header-nav"
      >
        <SharedSwitchNewUi />
        <RouterLink
          class="shared-header-link"
          to="/legacy/kanji"
        >
          Kanji
        </RouterLink>
        <RouterLink
          class="shared-header-link"
          to="/legacy/components"
        >
          Components
        </RouterLink>
        <RouterLink
          class="shared-header-link"
          to="/legacy/vocabulary"
        >
          Vocab
        </RouterLink>
        <RouterLink
          aria-label="Settings"
          class="shared-header-link shared-header-link--icon"
          title="Settings"
          to="/legacy/settings"
        >
          <svg
            class="shared-header-icon"
            fill="currentColor"
            version="1.1"
            viewBox="0 0 472.615 472.615"
          >
            <g
              id="SVGRepo_bgCarrier"
              stroke-width="0"
            ></g>
            <g
              id="SVGRepo_tracerCarrier"
              stroke-linecap="round"
              stroke-linejoin="round"
            ></g>
            <g id="SVGRepo_iconCarrier">
              <g>
                <g>
                  <path
                    d="M472.615,274.117V198.4l-55.335-9.255c-4.332-16.64-10.929-32.492-19.692-47.458L430.178,96l-53.563-53.563 l-45.686,32.591c-14.966-8.763-30.917-15.36-47.557-19.692L274.215,0H198.4l-9.157,55.335 c-16.64,4.332-32.591,10.929-47.557,19.692L96,42.437L42.437,96l32.591,45.686c-8.763,14.966-15.36,30.818-19.692,47.458L0,198.4 v75.717l55.335,9.255c4.332,16.64,10.929,32.591,19.692,47.557l-32.591,45.686L96,430.178l45.686-32.689 c14.966,8.862,30.917,15.458,47.557,19.791l9.157,55.335h75.815l9.157-55.335c16.64-4.332,32.591-10.929,47.557-19.791 l45.686,32.689l53.563-53.563l-32.591-45.686c8.763-14.966,15.36-30.917,19.692-47.557L472.615,274.117z M236.308,334.769 c-54.252,0-98.462-44.209-98.462-98.462c0-54.351,44.209-98.462,98.462-98.462s98.462,44.111,98.462,98.462 C334.769,290.56,290.56,334.769,236.308,334.769z"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
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

.shared-header-icon {
  width: 18px;
  height: 18px;
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
  .shared-header-content {
    gap: var(--spacing-sm);
    padding: 0 var(--spacing-md);
  }

  .shared-header-logo {
    font-size: var(--font-size-lg);
  }

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

  .shared-header-icon {
    width: 24px;
    height: 24px;
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
