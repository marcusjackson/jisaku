<script setup lang="ts">
/**
 * SharedSearchKeywordsIndicator
 *
 * UI component displaying a subtle indicator when search_keywords has content.
 * Shows a small icon/badge with tooltip displaying the keywords on hover.
 * Not prominently visible, just informative.
 */

import { computed } from 'vue'

import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger
} from 'reka-ui'

const props = defineProps<{
  /** The search keywords to display (null/empty won't show indicator) */
  searchKeywords: string | null | undefined
}>()

const hasKeywords = computed(() => {
  return props.searchKeywords && props.searchKeywords.trim().length > 0
})

const tooltipMessage = computed(() => {
  return hasKeywords.value ? props.searchKeywords : 'No search keywords set'
})
</script>

<template>
  <TooltipProvider>
    <TooltipRoot :delay-duration="300">
      <TooltipTrigger as-child>
        <span
          aria-label="Has search keywords"
          class="search-keywords-indicator"
        >
          <svg
            class="search-keywords-indicator-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              fill-rule="evenodd"
            />
          </svg>
        </span>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          class="search-keywords-tooltip"
          :side-offset="5"
        >
          <div class="search-keywords-tooltip-title">Search Keywords</div>
          <div class="search-keywords-tooltip-content">
            {{ tooltipMessage }}
          </div>
          <TooltipArrow class="search-keywords-tooltip-arrow" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style scoped>
.search-keywords-indicator {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1);
  color: var(--color-text-muted);
  cursor: help;
  transition: color var(--transition-fast);
}

.search-keywords-indicator:hover {
  color: var(--color-text-secondary);
}

.search-keywords-indicator-icon {
  width: 1rem;
  height: 1rem;
}

:deep(.search-keywords-tooltip) {
  z-index: 50;
  max-width: 20rem;
  padding: var(--spacing-2) var(--spacing-3);
  overflow: hidden;
  border-radius: var(--radius-md);
  background-color: var(--color-text-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  box-shadow: var(--shadow-lg);
}

:deep(.search-keywords-tooltip-title) {
  margin-bottom: var(--spacing-1);
  font-weight: var(--font-weight-semibold);
}

:deep(.search-keywords-tooltip-content) {
  color: var(--color-text-inverse);
}

:deep(.search-keywords-tooltip-arrow) {
  fill: var(--color-text-primary);
}
</style>
