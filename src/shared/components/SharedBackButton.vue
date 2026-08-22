<script setup lang="ts">
/**
 * SharedBackButton
 *
 * Reusable back navigation button for detail pages.
 * Provides consistent back-to-list navigation with icon and label.
 * Preserves URL query parameters when navigating back to list pages.
 *
 * Renders as a styled `<RouterLink>` (anchor element) to avoid nesting
 * interactive elements (`<a>` wrapping `<button>` is invalid HTML).
 */

import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import type { RouteLocationRaw } from 'vue-router'

interface Props {
  /** Route to navigate to — accepts any Vue Router location (string path, name object, etc.) */
  to: RouteLocationRaw
  /** Label text for the button (e.g., 'Back to Kanji List') */
  label: string
}

const props = defineProps<Props>()

const route = useRoute()

const toWithQuery = computed<RouteLocationRaw>(() => {
  const to = props.to
  if (typeof to === 'string') {
    return { path: to, query: route.query }
  }
  // Object form: merge current query params into the provided location
  return {
    ...to,
    query: { ...route.query, ...to.query }
  }
})
</script>

<template>
  <RouterLink
    class="shared-back-button"
    :to="toWithQuery"
  >
    <span
      aria-hidden="true"
      class="shared-back-button-icon"
      >←</span
    >
    {{ label }}
  </RouterLink>
</template>

<style scoped>
.shared-back-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-xs);
  height: var(--button-height-md);
  padding: var(--button-padding-md);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text-primary);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

.shared-back-button:hover {
  background-color: var(--color-surface);
}

.shared-back-button:focus-visible {
  box-shadow: var(--focus-ring);
  outline: none;
}

.shared-back-button-icon {
  font-weight: var(--font-weight-bold);
}
</style>
