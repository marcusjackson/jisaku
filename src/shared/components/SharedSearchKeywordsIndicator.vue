<script setup lang="ts">
/**
 * SharedSearchKeywordsIndicator
 *
 * Displays search icon with tooltip showing keywords. Click to toggle on mobile.
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
  searchKeywords: string | null | undefined
}>()

const isOpen = ref(false)
const contentRef = ref<HTMLElement>()

const tooltipMessage = computed(() => {
  const trimmed = props.searchKeywords?.trim()
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- empty string should show fallback
  return trimmed || 'No search keywords set'
})

const handleOutsideClick = (event: Event) => {
  if (!isOpen.value) return
  const target = event.target as Node
  const trigger = document.querySelector('[aria-label="Show search keywords"]')
  if (
    contentRef.value &&
    !contentRef.value.contains(target) &&
    trigger &&
    !trigger.contains(target)
  ) {
    isOpen.value = false
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
          class="indicator"
          type="button"
          @click="isOpen = !isOpen"
        >
          <svg
            class="indicator-icon"
            fill="currentColor"
            viewBox="0 0 20 20"
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
          class="tooltip"
          :side-offset="5"
        >
          <div
            ref="contentRef"
            class="tooltip-wrapper"
          >
            <div class="tooltip-header">
              <span class="tooltip-title">Search Keywords</span>
              <button
                aria-label="Close"
                class="tooltip-close"
                type="button"
                @click="isOpen = false"
              >
                ×
              </button>
            </div>
            <div class="tooltip-content">{{ tooltipMessage }}</div>
          </div>
          <TooltipArrow class="tooltip-arrow" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style scoped>
.indicator {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1);
  border: none;
  background: none;
  color: var(--color-text-muted);
  cursor: pointer;
}

.indicator:hover {
  color: var(--color-text-secondary);
}

.indicator:focus-visible {
  border-radius: var(--radius-sm);
  box-shadow: var(--focus-ring);
  outline: none;
}

.indicator-icon {
  width: 1rem;
  height: 1rem;
}

:deep(.tooltip) {
  z-index: 50;
  max-width: 20rem;
  padding: var(--spacing-3);
  border-radius: var(--radius-md);
  background-color: var(--color-surface);
  box-shadow: var(--shadow-lg);
}

:deep(.tooltip-header) {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
}

:deep(.tooltip-title) {
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

:deep(.tooltip-close) {
  padding: var(--spacing-1);
  border: none;
  background: none;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
}

:deep(.tooltip-close:hover) {
  color: var(--color-text-primary);
}

:deep(.tooltip-content) {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

:deep(.tooltip-arrow) {
  fill: var(--color-surface);
}
</style>
