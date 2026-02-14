<script setup lang="ts">
/**
 * SharedSearchKeywordsIndicator
 *
 * UI component displaying a subtle indicator when search_keywords has content.
 * Shows a small icon with tooltip displaying the keywords.
 * On desktop: Hovers to show tooltip (native behavior)
 * On mobile: Click to toggle tooltip open/close with close button for dismissal
 * Outside clicks also close the tooltip when open via click.
 */

import { computed, onMounted, onUnmounted, ref } from 'vue'

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

const isOpen = ref(false)
const contentRef = ref<HTMLElement>()

const hasKeywords = computed(() => {
  return props.searchKeywords && props.searchKeywords.trim().length > 0
})

const tooltipMessage = computed(() => {
  return hasKeywords.value ? props.searchKeywords : 'No search keywords set'
})

const handleClick = () => {
  isOpen.value = !isOpen.value
}

const handleClose = () => {
  isOpen.value = false
}

const handleOutsideClick = (event: Event) => {
  if (!isOpen.value) return // Only handle outside clicks when tooltip is open

  const target = event.target as Node
  if (
    contentRef.value &&
    typeof contentRef.value.contains === 'function' &&
    !contentRef.value.contains(target)
  ) {
    // Check if click is on the trigger button to avoid immediately closing on open click
    const trigger = document.querySelector(
      '[aria-label="Show search keywords"]'
    )
    if (trigger && !trigger.contains(target)) {
      isOpen.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <TooltipProvider>
    <TooltipRoot v-model:open="isOpen">
      <TooltipTrigger as-child>
        <button
          aria-label="Show search keywords"
          class="search-keywords-indicator"
          type="button"
          @click="handleClick"
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
        </button>
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          class="search-keywords-tooltip"
          :side-offset="5"
        >
          <div
            ref="contentRef"
            class="search-keywords-tooltip-content-wrapper"
          >
            <div class="search-keywords-tooltip-header">
              <div class="search-keywords-tooltip-title">Search Keywords</div>
              <button
                aria-label="Close"
                class="search-keywords-tooltip-close"
                type="button"
                @click="handleClose"
              >
                <svg
                  fill="none"
                  height="16"
                  viewBox="0 0 16 16"
                  width="16"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 4L12 12M12 4L4 12"
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                  />
                </svg>
              </button>
            </div>
            <div class="search-keywords-tooltip-content">
              {{ tooltipMessage }}
            </div>
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
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.search-keywords-indicator:hover {
  color: var(--color-text-secondary);
}

.search-keywords-indicator:focus-visible {
  border-radius: var(--radius-sm);
  box-shadow: var(--focus-ring);
  outline: none;
}

.search-keywords-indicator-icon {
  width: 1rem;
  height: 1rem;
}

:deep(.search-keywords-tooltip) {
  z-index: 50;
  max-width: 20rem;
  padding: var(--spacing-3);
  overflow: hidden;
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

:deep(.search-keywords-tooltip-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

:deep(.search-keywords-tooltip-title) {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

:deep(.search-keywords-tooltip-close) {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: var(--spacing-1);
  border: none;
  border-radius: var(--radius-sm);
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast);
}

:deep(.search-keywords-tooltip-close:hover) {
  background-color: var(--color-surface-hover);
  color: var(--color-text-primary);
}

:deep(.search-keywords-tooltip-close:focus-visible) {
  box-shadow: var(--focus-ring);
  outline: none;
}

:deep(.search-keywords-tooltip-content) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
}

:deep(.search-keywords-tooltip-arrow) {
  fill: var(--color-surface);
}
</style>
