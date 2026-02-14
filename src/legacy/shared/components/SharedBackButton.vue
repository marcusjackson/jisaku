<script setup lang="ts">
/**
 * SharedBackButton
 *
 * Reusable back navigation button for detail pages.
 * Provides consistent back-to-list navigation with icon and label.
 * Preserves URL query parameters when navigating back to list pages.
 */

import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import BaseButton from '@/legacy/base/components/BaseButton.vue'

interface Props {
  /** Route path to navigate to (e.g., '/kanji' or '/components') */
  to: string
  /** Label text for the button (e.g., 'Back to Kanji List') */
  label: string
}

const props = defineProps<Props>()

const route = useRoute()

// Preserve query params from the current route when navigating back
const toWithQuery = computed(() => ({
  path: props.to,
  query: route.query
}))
</script>

<template>
  <RouterLink
    class="shared-back-button"
    :to="toWithQuery"
  >
    <BaseButton variant="ghost">
      <span
        aria-hidden="true"
        class="shared-back-button-icon"
        >←</span
      >
      {{ label }}
    </BaseButton>
  </RouterLink>
</template>

<style scoped>
.shared-back-button {
  display: inline-block;
  text-decoration: none;
}

.shared-back-button-icon {
  margin-right: var(--spacing-xs);
  font-weight: var(--font-weight-bold);
}
</style>
